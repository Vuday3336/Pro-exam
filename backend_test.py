#!/usr/bin/env python3
import requests
import json
import time
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
    "full_name": "Test Student",
    "email": "test@example.com", 
    "password": "TestPassword123",
    "target_exam": ["JEE Main", "NEET"],
    "school": "Test School",
    "class_level": "12th"
}

# Store the JWT token
token = None

def print_separator():
    print("\n" + "="*80 + "\n")

def test_health_check():
    """Test the health check endpoint"""
    print("Testing Health Check Endpoint...")
    try:
        response = requests.get(f"{API_URL}/")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        assert response.status_code == 200, "Health check failed"
        assert "message" in response.json(), "Response missing 'message' field"
        
        print("✅ Health Check Test: PASSED")
        return True
    except Exception as e:
        print(f"❌ Health Check Test: FAILED - {str(e)}")
        return False

def test_user_registration():
    """Test user registration endpoint"""
    print("Testing User Registration Endpoint...")
    try:
        response = requests.post(f"{API_URL}/auth/register", json=TEST_USER)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        # If user already exists, this is expected
        if response.status_code == 400 and "already registered" in response.json().get("detail", ""):
            print("⚠️ User already exists, proceeding with login test")
            return True
        
        assert response.status_code == 200, "Registration failed"
        assert "token" in response.json(), "Response missing 'token' field"
        assert "user" in response.json(), "Response missing 'user' field"
        
        # Store the token for subsequent requests
        global token
        token = response.json()["token"]
        
        print("✅ User Registration Test: PASSED")
        return True
    except Exception as e:
        print(f"❌ User Registration Test: FAILED - {str(e)}")
        return False

def test_user_login():
    """Test user login endpoint"""
    print("Testing User Login Endpoint...")
    try:
        login_data = {
            "email": TEST_USER["email"],
            "password": TEST_USER["password"]
        }
        
        response = requests.post(f"{API_URL}/auth/login", json=login_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        assert response.status_code == 200, "Login failed"
        assert "token" in response.json(), "Response missing 'token' field"
        assert "user" in response.json(), "Response missing 'user' field"
        
        # Store the token for subsequent requests
        global token
        token = response.json()["token"]
        
        print("✅ User Login Test: PASSED")
        return True
    except Exception as e:
        print(f"❌ User Login Test: FAILED - {str(e)}")
        return False

def test_protected_endpoint():
    """Test protected endpoint requiring authentication"""
    print("Testing Protected Endpoint (auth/me)...")
    try:
        # Ensure we have a token
        global token
        if not token:
            print("❌ No authentication token available. Login test must pass first.")
            return False
        
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_URL}/auth/me", headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        assert response.status_code == 200, "Protected endpoint access failed"
        assert "email" in response.json(), "Response missing user data"
        
        print("✅ Protected Endpoint Test: PASSED")
        return True
    except Exception as e:
        print(f"❌ Protected Endpoint Test: FAILED - {str(e)}")
        return False

def test_dashboard():
    """Test dashboard endpoint requiring authentication"""
    print("Testing Dashboard Endpoint...")
    try:
        # Ensure we have a token
        global token
        if not token:
            print("❌ No authentication token available. Login test must pass first.")
            return False
        
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_URL}/dashboard", headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        assert response.status_code == 200, "Dashboard access failed"
        assert "user" in response.json(), "Response missing 'user' field"
        assert "stats" in response.json(), "Response missing 'stats' field"
        
        print("✅ Dashboard Endpoint Test: PASSED")
        return True
    except Exception as e:
        print(f"❌ Dashboard Endpoint Test: FAILED - {str(e)}")
        return False

def test_google_oauth():
    """Test Google OAuth endpoint with a mock token"""
    print("Testing Google OAuth Endpoint...")
    try:
        # Create a mock Google token (this is not a real token)
        mock_token = "mock_google_token_for_testing"
        
        # Send request to Google OAuth endpoint
        response = requests.post(f"{API_URL}/auth/google", json={"token": mock_token})
        print(f"Status Code: {response.status_code}")
        
        # We expect a 401 error since we're using a mock token
        # This test is primarily to verify the endpoint structure is correct
        print(f"Response: {response.json()}")
        
        # The endpoint should return a 401 error for invalid tokens
        assert response.status_code == 401, "Expected 401 status code for invalid token"
        assert "detail" in response.json(), "Response missing 'detail' field"
        assert "Invalid Google token" in response.json()["detail"], "Unexpected error message"
        
        print("✅ Google OAuth Endpoint Test: PASSED (Endpoint structure is correct)")
        return True
    except Exception as e:
        print(f"❌ Google OAuth Endpoint Test: FAILED - {str(e)}")
        return False

def test_exam_creation(exam_type="JEE Main", subjects=None):
    """Test exam creation endpoint requiring authentication"""
    print(f"Testing Exam Creation Endpoint for {exam_type}...")
    try:
        # Ensure we have a token
        global token
        if not token:
            print("❌ No authentication token available. Login test must pass first.")
            return False
        
        if subjects is None:
            if exam_type == "JEE Main":
                subjects = ["Physics", "Chemistry", "Mathematics"]
            elif exam_type == "NEET":
                subjects = ["Physics", "Chemistry", "Biology"]
            elif exam_type == "EAMCET Engineering":
                subjects = ["Physics", "Chemistry", "Mathematics"]
            elif exam_type == "EAMCET Medical":
                subjects = ["Physics", "Chemistry", "Biology"]
            else:
                subjects = ["Physics", "Chemistry", "Mathematics"]
        
        exam_config = {
            "exam_type": exam_type,
            "subjects": subjects,
            "question_count": 6,  # Small number for quick testing
            "duration": 30,  # 30 minutes
            "difficulty": "Medium"
        }
        
        headers = {"Authorization": f"Bearer {token}"}
        print("Sending exam creation request...")
        response = requests.post(f"{API_URL}/exams/create", json=exam_config, headers=headers)
        print(f"Status Code: {response.status_code}")
        
        # Print a truncated response to avoid overwhelming the console
        response_json = response.json()
        if "exam" in response_json and "questions" in response_json["exam"]:
            question_count = len(response_json["exam"]["questions"])
            print(f"Received {question_count} questions in response")
            # Truncate the questions to show just the first one
            response_json["exam"]["questions"] = response_json["exam"]["questions"][:1]
            print(f"Response (truncated): {json.dumps(response_json, indent=2)}")
        else:
            print(f"Response: {response_json}")
        
        assert response.status_code == 200, "Exam creation failed"
        assert "exam" in response_json, "Response missing 'exam' field"
        assert "questions" in response_json["exam"], "Response missing 'questions' field"
        assert response_json["exam"]["exam_type"] == exam_type, f"Exam type mismatch: expected {exam_type}"
        
        print(f"✅ Exam Creation Test for {exam_type}: PASSED")
        return True
    except Exception as e:
        print(f"❌ Exam Creation Test for {exam_type}: FAILED - {str(e)}")
        return False

def run_all_tests():
    """Run all tests in sequence"""
    print_separator()
    print("STARTING BACKEND API TESTS")
    print_separator()
    
    # Track test results
    results = {}
    
    # Test 1: Health Check
    results["Health Check"] = test_health_check()
    print_separator()
    
    # Test 2: User Registration
    results["User Registration"] = test_user_registration()
    print_separator()
    
    # Test 3: User Login
    results["User Login"] = test_user_login()
    print_separator()
    
    # Test 4: Protected Endpoint
    results["Protected Endpoint"] = test_protected_endpoint()
    print_separator()
    
    # Test 5: Dashboard
    results["Dashboard"] = test_dashboard()
    print_separator()
    
    # Test 6: Google OAuth
    results["Google OAuth"] = test_google_oauth()
    print_separator()
    
    # Test 7: JEE Main Exam Creation
    results["JEE Main Exam Creation"] = test_exam_creation("JEE Main")
    print_separator()
    
    # Test 8: NEET Exam Creation
    results["NEET Exam Creation"] = test_exam_creation("NEET")
    print_separator()
    
    # Test 9: EAMCET Engineering Exam Creation
    results["EAMCET Engineering Exam Creation"] = test_exam_creation("EAMCET Engineering")
    print_separator()
    
    # Test 10: EAMCET Medical Exam Creation
    results["EAMCET Medical Exam Creation"] = test_exam_creation("EAMCET Medical")
    print_separator()
    
    # Print summary
    print("TEST SUMMARY:")
    all_passed = True
    for test_name, result in results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        if not result:
            all_passed = False
        print(f"{test_name}: {status}")
    
    print_separator()
    if all_passed:
        print("🎉 ALL TESTS PASSED! The backend API is working correctly.")
    else:
        print("⚠️ SOME TESTS FAILED. Please check the logs above for details.")
    
    return all_passed

if __name__ == "__main__":
    run_all_tests()