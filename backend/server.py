from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import os
import uuid
import json
import logging
from datetime import datetime, timedelta
from pathlib import Path
from dotenv import load_dotenv
import google.generativeai as genai
from tenacity import retry, stop_after_attempt, wait_exponential
import jwt
import bcrypt
from google.auth.transport import requests
from google.oauth2 import id_token
import httpx
import asyncio

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(title="JEE/NEET/EAMCET Exam Portal API", version="1.0.0")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Gemini AI Configuration
genai.configure(api_key=os.environ['GEMINI_API_KEY'])

# Configure the model with better settings for reliability
generation_config = genai.types.GenerationConfig(
    temperature=0.7,
    top_p=0.8,
    top_k=40,
    max_output_tokens=8192,
)

safety_settings = [
    {
        "category": "HARM_CATEGORY_HARASSMENT",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
        "category": "HARM_CATEGORY_HATE_SPEECH",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
        "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
        "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    }
]

model = genai.GenerativeModel(
    "gemini-2.0-flash",
    generation_config=generation_config,
    safety_settings=safety_settings
)

# JWT Configuration
JWT_SECRET = os.environ['JWT_SECRET_KEY']
JWT_ALGORITHM = os.environ['JWT_ALGORITHM']
JWT_EXPIRATION = int(os.environ['JWT_EXPIRATION_HOURS'])

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    profile_picture: Optional[str] = None
    target_exam: List[str] = []
    school: Optional[str] = None
    class_level: Optional[str] = None
    google_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    active_sessions: List[dict] = Field(default_factory=list)  # Track active sessions with device info

class UserRegistration(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    phone: Optional[str] = None
    target_exam: List[str] = []
    school: Optional[str] = None
    class_level: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleAuth(BaseModel):
    token: str

class ExamConfig(BaseModel):
    exam_type: str  # JEE Main, NEET, EAMCET Engineering, EAMCET Medical
    subjects: List[str]
    question_count: int
    duration: int  # in minutes
    difficulty: str  # Easy, Medium, Hard, Mixed

class Question(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question: str
    options: List[str]
    correct_index: int
    correct_answer: str
    solution: str
    difficulty: str
    subject: str
    topic: str
    exam_type: str

class Exam(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    exam_type: str
    configuration: ExamConfig
    questions: List[Question]
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration: int
    status: str = "created"  # created, ongoing, completed, submitted
    answers: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ExamSubmission(BaseModel):
    exam_id: str
    answers: Dict[str, Any]

class ExamResult(BaseModel):
    exam_id: str
    user_id: str
    score: float
    total_questions: int
    correct_answers: int
    percentage: float
    time_taken: int
    subject_wise_score: Dict[str, Any]
    detailed_analysis: List[Dict[str, Any]]
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Utility Functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_jwt_token(user_id: str, email: str, session_id: str = None) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "session_id": session_id or str(uuid.uuid4()),
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION),
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_jwt_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_device_info(request) -> dict:
    """Extract device information from request headers"""
    user_agent = request.headers.get("user-agent", "Unknown")
    
    # Parse device type from user agent
    device_type = "Unknown"
    if "Mobile" in user_agent:
        device_type = "Mobile"
    elif "Tablet" in user_agent:
        device_type = "Tablet"
    elif "Windows" in user_agent or "Macintosh" in user_agent or "Linux" in user_agent:
        device_type = "Desktop"
    
    # Parse browser info
    browser = "Unknown"
    if "Chrome" in user_agent:
        browser = "Chrome"
    elif "Firefox" in user_agent:
        browser = "Firefox"
    elif "Safari" in user_agent:
        browser = "Safari"
    elif "Edge" in user_agent:
        browser = "Edge"
    
    return {
        "device_type": device_type,
        "browser": browser,
        "user_agent": user_agent,
        "ip_address": request.client.host if hasattr(request, 'client') else "Unknown",
        "login_time": datetime.utcnow()
    }

async def manage_user_sessions(user_id: str, session_id: str, device_info: dict, max_sessions: int = 1):
    """Manage user sessions, keeping only the most recent ones"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        return
    
    # Get current sessions
    active_sessions = user.get("active_sessions", [])
    
    # Remove old sessions if we're at the limit
    if len(active_sessions) >= max_sessions:
        # Keep only the most recent sessions (remove oldest)
        active_sessions = active_sessions[-(max_sessions-1):]
    
    # Add new session
    new_session = {
        "session_id": session_id,
        "device_info": device_info,
        "created_at": datetime.utcnow(),
        "last_activity": datetime.utcnow()
    }
    active_sessions.append(new_session)
    
    # Update user's active sessions
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"active_sessions": active_sessions, "last_login": datetime.utcnow()}}
    )

async def is_session_valid(user_id: str, session_id: str) -> bool:
    """Check if a session is still valid"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        return False
    
    active_sessions = user.get("active_sessions", [])
    return any(session["session_id"] == session_id for session in active_sessions)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    payload = decode_jwt_token(credentials.credentials)
    
    # Check if session is still valid
    session_id = payload.get("session_id")
    if session_id and not await is_session_valid(payload["user_id"], session_id):
        raise HTTPException(status_code=401, detail="Session expired or invalid")
    
    user = await db.users.find_one({"id": payload["user_id"]})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return User(**user)

# AI Question Generation with Chunked Approach
async def generate_questions_chunk(subject: str, count: int, exam_config: ExamConfig, chunk_size: int = 5) -> List[Question]:
    """Generate questions in chunks to avoid timeout and size issues"""
    all_questions = []
    
    # Split into smaller chunks
    chunks = []
    remaining = count
    while remaining > 0:
        current_chunk = min(chunk_size, remaining)
        chunks.append(current_chunk)
        remaining -= current_chunk
    
    logger.info(f"Generating {count} questions for {subject} in {len(chunks)} chunks: {chunks}")
    
    for i, chunk_count in enumerate(chunks):
        max_retries = 3
        for attempt in range(max_retries):
            try:
                prompt = f"""
                You are an expert question writer for {exam_config.exam_type} competitive exams. Generate exactly {chunk_count} high-quality, original MCQ questions for {subject} at {exam_config.difficulty} difficulty level.

                CRITICAL REQUIREMENTS:
                - Generate REAL, SPECIFIC, DETAILED questions (NOT sample/template questions)
                - NO generic phrases like "Sample question", "Question 1", "Option A for question 1"
                - Each question must be a complete, standalone academic question
                - Questions should test actual {subject} concepts relevant to {exam_config.exam_type}
                - Include specific numerical values, formulas, concepts, or scenarios where appropriate
                - Each question must have exactly 4 distinct, meaningful options
                - Only one correct answer per question
                - Include detailed solution with step-by-step explanation
                - Cover different topics within {subject}
                - Maintain {exam_config.difficulty} difficulty level throughout

                QUESTION QUALITY STANDARDS:
                - Questions should be exam-level quality, not basic or template-like
                - Options should be plausible and test understanding
                - Avoid obvious wrong answers
                - Include relevant diagrams descriptions if needed
                - Solutions should be educational and complete

                FORBIDDEN CONTENT:
                - NO "Sample [subject] question" phrasing
                - NO "Option A for question X" format
                - NO placeholder or template text
                - NO generic question stems

                Example of GOOD question format:
                "A uniform rod of length 2m and mass 5kg is pivoted at its center. If a force of 10N is applied at one end perpendicular to the rod, what is the angular acceleration?"

                Example of BAD question format (NEVER use):
                "Sample Physics question 1 for NEET"

                Generate exactly {chunk_count} questions following these standards.

                Output ONLY valid JSON in this EXACT format (no extra text):
                {{
                    "questions": [
                        {{
                            "question": "Complete specific question text with actual content",
                            "options": ["Specific option 1", "Specific option 2", "Specific option 3", "Specific option 4"],
                            "correct_index": 0,
                            "correct_answer": "A",
                            "solution": "Detailed step-by-step solution explanation",
                            "difficulty": "{exam_config.difficulty}",
                            "subject": "{subject}",
                            "topic": "Specific topic name",
                            "exam_type": "{exam_config.exam_type}"
                        }}
                    ]
                }}
                """
                
                # Generate with timeout
                response = await asyncio.wait_for(
                    asyncio.get_event_loop().run_in_executor(
                        None, lambda: model.generate_content(
                            prompt,
                            generation_config=genai.types.GenerationConfig(
                                temperature=0.7,
                                max_output_tokens=8192,
                            )
                        )
                    ),
                    timeout=60.0  # 60 second timeout per chunk
                )
                
                response_text = response.text.strip()
                
                # Clean JSON response - be more aggressive in cleaning
                if "```json" in response_text:
                    start = response_text.find("```json") + 7
                    end = response_text.rfind("```")
                    if end > start:
                        response_text = response_text[start:end].strip()
                elif "```" in response_text:
                    start = response_text.find("```") + 3
                    end = response_text.rfind("```")
                    if end > start:
                        response_text = response_text[start:end].strip()
                
                # Find JSON content if there's extra text
                json_start = response_text.find("{")
                json_end = response_text.rfind("}") + 1
                if json_start >= 0 and json_end > json_start:
                    response_text = response_text[json_start:json_end]
                
                # Parse JSON
                parsed_response = json.loads(response_text)
                chunk_questions = parsed_response.get("questions", [])
                
                # Validate we got the expected number of questions
                if len(chunk_questions) != chunk_count:
                    logger.warning(f"Expected {chunk_count} questions, got {len(chunk_questions)} for {subject} chunk {i+1}")
                
                # Convert to Question objects
                for q_data in chunk_questions:
                    try:
                        question = Question(
                            question=q_data["question"],
                            options=q_data["options"],
                            correct_index=int(q_data["correct_index"]),
                            correct_answer=q_data["correct_answer"],
                            solution=q_data["solution"],
                            difficulty=q_data["difficulty"],
                            subject=q_data["subject"],
                            topic=q_data.get("topic", "General"),
                            exam_type=q_data["exam_type"]
                        )
                        all_questions.append(question)
                    except Exception as e:
                        logger.error(f"Error parsing question: {str(e)}")
                        continue
                
                logger.info(f"Successfully generated {len(chunk_questions)} questions for {subject} chunk {i+1}")
                break  # Success, break retry loop
                
            except asyncio.TimeoutError:
                logger.warning(f"Timeout generating {subject} chunk {i+1}, attempt {attempt+1}")
                if attempt == max_retries - 1:
                    # Add fallback questions for this chunk
                    for j in range(chunk_count):
                        fallback_question = Question(
                            question=f"Sample {subject} question {len(all_questions) + j + 1} for {exam_config.exam_type}",
                            options=[
                                f"Option A for question {len(all_questions) + j + 1}",
                                f"Option B for question {len(all_questions) + j + 1}",
                                f"Option C for question {len(all_questions) + j + 1}",
                                f"Option D for question {len(all_questions) + j + 1}"
                            ],
                            correct_index=0,
                            correct_answer="A",
                            solution=f"This is a fallback question for {subject}.",
                            difficulty=exam_config.difficulty,
                            subject=subject,
                            topic="General",
                            exam_type=exam_config.exam_type
                        )
                        all_questions.append(fallback_question)
                    logger.warning(f"Used fallback questions for {subject} chunk {i+1}")
            except Exception as e:
                logger.error(f"Error generating {subject} chunk {i+1}, attempt {attempt+1}: {str(e)}")
                if attempt == max_retries - 1:
                    # Add fallback questions for this chunk
                    for j in range(chunk_count):
                        fallback_question = Question(
                            question=f"Sample {subject} question {len(all_questions) + j + 1} for {exam_config.exam_type}",
                            options=[
                                f"Option A for question {len(all_questions) + j + 1}",
                                f"Option B for question {len(all_questions) + j + 1}",
                                f"Option C for question {len(all_questions) + j + 1}",
                                f"Option D for question {len(all_questions) + j + 1}"
                            ],
                            correct_index=0,
                            correct_answer="A",
                            solution=f"This is a fallback question for {subject}.",
                            difficulty=exam_config.difficulty,
                            subject=subject,
                            topic="General",
                            exam_type=exam_config.exam_type
                        )
                        all_questions.append(fallback_question)
                    logger.warning(f"Used fallback questions for {subject} chunk {i+1}")
        
        # Small delay between chunks to avoid rate limiting
        if i < len(chunks) - 1:
            await asyncio.sleep(2)
    
    logger.info(f"Generated total {len(all_questions)} questions for {subject}")
    return all_questions

async def generate_questions_with_gemini(exam_config: ExamConfig) -> List[Question]:
    """Generate questions using Gemini AI with chunked approach and robust error handling"""
    
    # Subject distribution based on exam type
    subject_distribution = {
        "JEE Main": {"Physics": 25, "Chemistry": 25, "Mathematics": 25},
        "NEET": {"Physics": 45, "Chemistry": 45, "Biology": 90},
        "EAMCET Engineering": {"Physics": 40, "Chemistry": 40, "Mathematics": 80},
        "EAMCET Medical": {"Physics": 40, "Chemistry": 40, "Biology": 80}
    }
    
    # Calculate questions per subject
    total_questions = exam_config.question_count
    if exam_config.exam_type in subject_distribution:
        total_standard = sum(subject_distribution[exam_config.exam_type].values())
        ratio = total_questions / total_standard
        questions_per_subject = {
            subject: max(1, int(count * ratio))
            for subject, count in subject_distribution[exam_config.exam_type].items()
            if subject in exam_config.subjects
        }
    else:
        # Equal distribution for custom exams
        questions_per_subject = {
            subject: total_questions // len(exam_config.subjects)
            for subject in exam_config.subjects
        }
    
    # Adjust to ensure we get exactly the requested number of questions
    current_total = sum(questions_per_subject.values())
    if current_total < total_questions:
        # Add remaining questions to the first subject
        first_subject = list(questions_per_subject.keys())[0]
        questions_per_subject[first_subject] += (total_questions - current_total)
    elif current_total > total_questions:
        # Remove excess questions from the last subject
        last_subject = list(questions_per_subject.keys())[-1]
        questions_per_subject[last_subject] -= (current_total - total_questions)
        questions_per_subject[last_subject] = max(1, questions_per_subject[last_subject])
    
    logger.info(f"Question distribution: {questions_per_subject}")
    
    all_questions = []
    
    # Generate questions for each subject concurrently but with controlled concurrency
    tasks = []
    for subject, count in questions_per_subject.items():
        task = generate_questions_chunk(subject, count, exam_config)
        tasks.append(task)
    
    # Execute tasks with some concurrency but not all at once to avoid rate limits
    for task in tasks:
        try:
            subject_questions = await task
            all_questions.extend(subject_questions)
        except Exception as e:
            logger.error(f"Failed to generate questions for a subject: {str(e)}")
    
    # Ensure we have the minimum required questions
    if len(all_questions) < total_questions:
        missing = total_questions - len(all_questions)
        logger.warning(f"Missing {missing} questions, adding fallback questions")
        
        for i in range(missing):
            fallback_question = Question(
                question=f"Sample question {len(all_questions) + i + 1} for {exam_config.exam_type}",
                options=[
                    f"Option A for question {len(all_questions) + i + 1}",
                    f"Option B for question {len(all_questions) + i + 1}",
                    f"Option C for question {len(all_questions) + i + 1}",
                    f"Option D for question {len(all_questions) + i + 1}"
                ],
                correct_index=0,
                correct_answer="A",
                solution="This is a fallback question.",
                difficulty=exam_config.difficulty,
                subject=exam_config.subjects[0],
                topic="General",
                exam_type=exam_config.exam_type
            )
            all_questions.append(fallback_question)
    
    # Trim if we have too many questions
    if len(all_questions) > total_questions:
        all_questions = all_questions[:total_questions]
    
    logger.info(f"Final question count: {len(all_questions)} (requested: {total_questions})")
    return all_questions

# API Endpoints

@api_router.post("/auth/register")
async def register_user(user_data: UserRegistration, request: Request):
    """Register a new user"""
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    hashed_password = hash_password(user_data.password)
    
    # Create user
    user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        phone=user_data.phone,
        target_exam=user_data.target_exam,
        school=user_data.school,
        class_level=user_data.class_level
    )
    
    user_dict = user.dict()
    user_dict["password"] = hashed_password
    
    await db.users.insert_one(user_dict)
    
    # Generate session ID and get device info
    session_id = str(uuid.uuid4())
    device_info = get_device_info(request)
    
    # Manage user sessions (limit to 1 active session)
    await manage_user_sessions(user.id, session_id, device_info, max_sessions=1)
    
    # Generate JWT token with session ID
    token = create_jwt_token(user.id, user.email, session_id)
    
    return {"message": "User registered successfully", "token": token, "user": user.dict()}

@api_router.post("/auth/login")
async def login_user(login_data: UserLogin, request: Request):
    """Login user with email and password"""
    user = await db.users.find_one({"email": login_data.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(login_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Generate session ID and get device info
    session_id = str(uuid.uuid4())
    device_info = get_device_info(request)
    
    # Manage user sessions (limit to 1 active session)
    await manage_user_sessions(user["id"], session_id, device_info, max_sessions=1)
    
    # Generate JWT token with session ID
    token = create_jwt_token(user["id"], user["email"], session_id)
    
    user_obj = User(**user)
    return {"message": "Login successful", "token": token, "user": user_obj.dict()}

@api_router.post("/auth/google")
async def google_auth(google_data: GoogleAuth, request: Request):
    """Authenticate with Google OAuth"""
    try:
        # Verify Google token
        id_info = id_token.verify_oauth2_token(
            google_data.token, 
            requests.Request(), 
            os.environ['GOOGLE_CLIENT_ID']
        )
        
        google_id = id_info['sub']
        email = id_info['email']
        full_name = id_info['name']
        profile_picture = id_info.get('picture', '')
        
        # Check if user exists
        user = await db.users.find_one({"email": email})
        
        if user:
            user_obj = User(**user)
        else:
            # Create new user
            user_obj = User(
                email=email,
                full_name=full_name,
                profile_picture=profile_picture,
                google_id=google_id
            )
            await db.users.insert_one(user_obj.dict())
        
        # Generate session ID and get device info
        session_id = str(uuid.uuid4())
        device_info = get_device_info(request)
        
        # Manage user sessions (limit to 1 active session)
        await manage_user_sessions(user_obj.id, session_id, device_info, max_sessions=1)
        
        # Generate JWT token with session ID
        token = create_jwt_token(user_obj.id, user_obj.email, session_id)
        
        return {"message": "Google authentication successful", "token": token, "user": user_obj.dict()}
        
    except ValueError as e:
        raise HTTPException(status_code=401, detail="Invalid Google token")

@api_router.get("/auth/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user

@api_router.get("/auth/sessions")
async def get_active_sessions(current_user: User = Depends(get_current_user)):
    """Get user's active sessions"""
    user = await db.users.find_one({"id": current_user.id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    active_sessions = user.get("active_sessions", [])
    
    # Format sessions for display
    formatted_sessions = []
    for session in active_sessions:
        device_info = session.get("device_info", {})
        formatted_sessions.append({
            "session_id": session["session_id"],
            "device_type": device_info.get("device_type", "Unknown"),
            "browser": device_info.get("browser", "Unknown"),
            "ip_address": device_info.get("ip_address", "Unknown"),
            "login_time": session.get("created_at"),
            "last_activity": session.get("last_activity")
        })
    
    return {"active_sessions": formatted_sessions}

@api_router.post("/auth/logout-other-devices")
async def logout_other_devices(current_user: User = Depends(get_current_user)):
    """Logout from all other devices except current one"""
    # Get current session from JWT token
    # This is a simplified version - in production you'd want to get the current session ID
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {"active_sessions": []}}
    )
    
    return {"message": "Logged out from all other devices"}

@api_router.post("/auth/logout")
async def logout_user(current_user: User = Depends(get_current_user)):
    """Logout current user"""
    # Remove current session
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {"active_sessions": []}}
    )
    
    return {"message": "Logged out successfully"}

@api_router.post("/exams/create")
async def create_exam(exam_config: ExamConfig, current_user: User = Depends(get_current_user)):
    """Create a new exam with AI-generated questions"""
    try:
        logger.info(f"Creating exam for user {current_user.id}: {exam_config.exam_type}, {exam_config.question_count} questions")
        
        # Generate questions using AI with robust error handling
        questions = await generate_questions_with_gemini(exam_config)
        
        if len(questions) < exam_config.question_count:
            logger.warning(f"Generated {len(questions)} questions, requested {exam_config.question_count}")
        
        # Create exam
        exam = Exam(
            user_id=current_user.id,
            exam_type=exam_config.exam_type,
            configuration=exam_config,
            questions=questions,
            duration=exam_config.duration
        )
        
        await db.exams.insert_one(exam.dict())
        
        logger.info(f"Exam created successfully with {len(questions)} questions")
        return {"message": "Exam created successfully", "exam": exam}
        
    except Exception as e:
        logger.error(f"Error creating exam: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create exam: {str(e)}")

@api_router.get("/exams/generation-status/{exam_id}")
async def get_generation_status(exam_id: str, current_user: User = Depends(get_current_user)):
    """Get the status of exam question generation (for future use with async generation)"""
    # This endpoint can be used for real-time progress tracking in the future
    # For now, return that generation is complete
    return {"status": "completed", "progress": 100}

@api_router.get("/exams/{exam_id}")
async def get_exam(exam_id: str, current_user: User = Depends(get_current_user)):
    """Get exam details"""
    exam = await db.exams.find_one({"id": exam_id, "user_id": current_user.id})
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    return Exam(**exam)

@api_router.post("/exams/{exam_id}/start")
async def start_exam(exam_id: str, current_user: User = Depends(get_current_user)):
    """Start an exam"""
    exam = await db.exams.find_one({"id": exam_id, "user_id": current_user.id})
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    if exam["status"] != "created":
        raise HTTPException(status_code=400, detail="Exam already started or completed")
    
    # Update exam status
    await db.exams.update_one(
        {"id": exam_id},
        {"$set": {"status": "ongoing", "start_time": datetime.utcnow()}}
    )
    
    return {"message": "Exam started successfully"}

@api_router.post("/exams/{exam_id}/submit")
async def submit_exam(exam_id: str, submission: ExamSubmission, current_user: User = Depends(get_current_user)):
    """Submit exam answers"""
    exam = await db.exams.find_one({"id": exam_id, "user_id": current_user.id})
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    if exam["status"] != "ongoing":
        raise HTTPException(status_code=400, detail="Exam not in progress")
    
    # Calculate results
    exam_obj = Exam(**exam)
    correct_answers = 0
    total_questions = len(exam_obj.questions)
    subject_wise_score = {}
    detailed_analysis = []
    
    for i, question in enumerate(exam_obj.questions):
        question_id = str(i)
        user_answer = submission.answers.get(question_id)
        is_correct = user_answer == question.correct_index if user_answer is not None else False
        
        if is_correct:
            correct_answers += 1
        
        # Subject-wise scoring
        if question.subject not in subject_wise_score:
            subject_wise_score[question.subject] = {"correct": 0, "total": 0}
        subject_wise_score[question.subject]["total"] += 1
        if is_correct:
            subject_wise_score[question.subject]["correct"] += 1
        
        # Detailed analysis
        detailed_analysis.append({
            "question_id": question_id,
            "question": question.question,
            "options": question.options,
            "correct_answer": question.correct_index,
            "user_answer": user_answer,
            "is_correct": is_correct,
            "solution": question.solution,
            "subject": question.subject,
            "topic": question.topic
        })
    
    # Calculate percentage and time taken
    percentage = (correct_answers / total_questions) * 100
    time_taken = int((datetime.utcnow() - exam_obj.start_time).total_seconds() / 60) if exam_obj.start_time else 0
    
    # Create result
    result = ExamResult(
        exam_id=exam_id,
        user_id=current_user.id,
        score=correct_answers,
        total_questions=total_questions,
        correct_answers=correct_answers,
        percentage=percentage,
        time_taken=time_taken,
        subject_wise_score=subject_wise_score,
        detailed_analysis=detailed_analysis
    )
    
    # Update exam status
    await db.exams.update_one(
        {"id": exam_id},
        {"$set": {
            "status": "completed",
            "end_time": datetime.utcnow(),
            "answers": submission.answers
        }}
    )
    
    # Save result
    await db.results.insert_one(result.dict())
    
    return {"message": "Exam submitted successfully", "result": result}

@api_router.get("/exams/{exam_id}/result")
async def get_exam_result(exam_id: str, current_user: User = Depends(get_current_user)):
    """Get exam result"""
    result = await db.results.find_one({"exam_id": exam_id, "user_id": current_user.id})
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    
    return ExamResult(**result)

@api_router.get("/dashboard")
async def get_dashboard(current_user: User = Depends(get_current_user)):
    """Get user dashboard data"""
    # Get user's exams
    exams_cursor = db.exams.find({"user_id": current_user.id})
    exams = await exams_cursor.to_list(length=100)
    
    # Get user's results
    results_cursor = db.results.find({"user_id": current_user.id})
    results = await results_cursor.to_list(length=100)
    
    # Clean up MongoDB documents (remove _id fields)
    clean_exams = []
    for exam in exams:
        if '_id' in exam:
            del exam['_id']
        clean_exams.append(exam)
    
    clean_results = []
    for result in results:
        if '_id' in result:
            del result['_id']
        clean_results.append(result)
    
    # Calculate statistics
    total_exams = len(clean_exams)
    completed_exams = len([e for e in clean_exams if e["status"] == "completed"])
    
    if clean_results:
        avg_score = sum(r["percentage"] for r in clean_results) / len(clean_results)
        best_score = max(r["percentage"] for r in clean_results)
    else:
        avg_score = 0
        best_score = 0
    
    return {
        "user": current_user.dict(),
        "stats": {
            "total_exams": total_exams,
            "completed_exams": completed_exams,
            "average_score": round(avg_score, 2),
            "best_score": round(best_score, 2)
        },
        "recent_exams": clean_exams[-5:] if clean_exams else [],
        "recent_results": clean_results[-5:] if clean_results else []
    }

@api_router.get("/")
async def root():
    return {"message": "JEE/NEET/EAMCET Exam Portal API"}

# Include router
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)