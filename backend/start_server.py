#!/usr/bin/env python3

import uvicorn
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Set default values if environment variables are missing
os.environ.setdefault('MONGO_URL', 'mongodb://localhost:27017')
os.environ.setdefault('DB_NAME', 'jee_neet_portal')
os.environ.setdefault('GEMINI_API_KEY', 'dummy_key_for_testing')
os.environ.setdefault('JWT_SECRET_KEY', 'dummy_secret_key_for_testing')
os.environ.setdefault('JWT_ALGORITHM', 'HS256')
os.environ.setdefault('JWT_EXPIRATION_HOURS', '24')

if __name__ == "__main__":
    print("Starting FastAPI server...")
    print(f"MongoDB URL: {os.environ.get('MONGO_URL')}")
    print(f"Database Name: {os.environ.get('DB_NAME')}")
    print(f"JWT Secret: {'*' * len(os.environ.get('JWT_SECRET_KEY', ''))}")
    
    try:
        uvicorn.run(
            "server:app",
            host="0.0.0.0",
            port=8001,
            reload=True,
            log_level="info"
        )
    except Exception as e:
        print(f"Error starting server: {e}")
        import traceback
        traceback.print_exc()