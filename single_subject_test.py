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

def test_single_subject_exam_creation():
    """Test creating an exam with a single subject to check question quality"""
    print("Testing Single Subject Exam Creation...")
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
        
        # Create an exam with just Physics for NEET
        exam_config = {
            "exam_type": "NEET",
            "subjects": ["Physics"],
            "question_count": 3,  # Small number for quick testing
            "duration": 30,  # 30 minutes
            "difficulty": "Medium"
        }
        
        headers = {"Authorization": f"Bearer {token}"}
        print("Sending exam creation request for Physics only...")
        response = requests.post(f"{API_URL}/exams/create", json=exam_config, headers=headers)
        print(f"Status Code: {response.status_code}")
        
        # Print the full response to see the generated questions
        response_json = response.json()
        if "exam" in response_json and "questions" in response_json["exam"]:
            questions = response_json["exam"]["questions"]
            print(f"Received {len(questions)} questions")
            
            # Print each question in detail
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
        else:
            print(f"Response: {response_json}")
        
        return True
    except Exception as e:
        print(f"❌ Single Subject Exam Creation Test: FAILED - {str(e)}")
        return False

if __name__ == "__main__":
    test_single_subject_exam_creation()