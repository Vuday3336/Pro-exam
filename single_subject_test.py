#!/usr/bin/env python3
import requests
import json
import os
from dotenv import load_dotenv
import sys

# Load environment variables from frontend/.env to get the backend URL
load_dotenv('/app/frontend/.env')

# Get the backend URL from environment variables
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL')
if not BACKEND_URL:
    print("Error: REACT_APP_BACKEND_URL not found in environment variables")
    sys.exit(1)

# Ensure the URL ends with /api
API_URL = f"{BACKEND_URL}/api"
print(f"Using API URL: {API_URL}")

# Test data
TEST_USER = {
    "email": "test@example.com", 
    "password": "TestPassword123",
}

def test_single_subject_exam_creation(exam_type="NEET", subject="Biology"):
    """Test creating an exam with a single subject to check question quality"""
    print(f"Testing Single Subject Exam Creation for {exam_type} - {subject}...")
    try:
        # Login to get a token
        login_data = {
            "email": TEST_USER["email"],
            "password": TEST_USER["password"]
        }
        
        login_response = requests.post(f"{API_URL}/auth/login", json=login_data)
        if login_response.status_code != 200:
            print(f"❌ Login failed with status code {login_response.status_code}")
            return False
        
        # Get the token from the login response
        token = login_response.json()["token"]
        
        # Create an exam with just the specified subject
        exam_config = {
            "exam_type": exam_type,
            "subjects": [subject],
            "question_count": 3,  # Small number for quick testing
            "duration": 30,  # 30 minutes
            "difficulty": "Medium"
        }
        
        headers = {"Authorization": f"Bearer {token}"}
        print(f"Sending exam creation request for {subject} only...")
        response = requests.post(f"{API_URL}/exams/create", json=exam_config, headers=headers)
        print(f"Status Code: {response.status_code}")
        
        # Print the full response to see the generated questions
        response_json = response.json()
        if "exam" in response_json and "questions" in response_json["exam"]:
            questions = response_json["exam"]["questions"]
            print(f"Received {len(questions)} questions")
            
            # Print each question in detail
            sample_questions = 0
            for i, question in enumerate(questions):
                print(f"\nQuestion {i+1}: {question['question']}")
                print("Options:")
                for j, option in enumerate(question['options']):
                    print(f"  {chr(65+j)}. {option}")
                print(f"Correct Answer: {question['correct_answer']}")
                print(f"Subject: {question['subject']}")
                print(f"Topic: {question['topic']}")
                
                # Check if this is a sample/template question
                if "sample" in question['question'].lower() or "template" in question['question'].lower():
                    print("⚠️ This appears to be a sample/template question")
                    sample_questions += 1
            
            if sample_questions == len(questions):
                print("\n❌ ALL questions are sample/template questions")
            elif sample_questions > 0:
                print(f"\n⚠️ {sample_questions} out of {len(questions)} are sample/template questions")
            else:
                print("\n✅ No sample/template questions found")
        else:
            print(f"Response: {response_json}")
        
        return True
    except Exception as e:
        print(f"❌ Single Subject Exam Creation Test: FAILED - {str(e)}")
        return False

if __name__ == "__main__":
    # Test with Biology for NEET
    test_single_subject_exam_creation("NEET", "Biology")
    print("\n" + "="*80 + "\n")
    
    # Test with Mathematics for JEE Main
    test_single_subject_exam_creation("JEE Main", "Mathematics")
    print("\n" + "="*80 + "\n")
    
    # Test with Chemistry for EAMCET Engineering
    test_single_subject_exam_creation("EAMCET Engineering", "Chemistry")