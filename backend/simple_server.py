from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Create FastAPI app
app = FastAPI(title="Test Server", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Backend server is running!", "status": "ok"}

@app.get("/api/")
async def api_root():
    return {"message": "API is working!", "status": "ok", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "JEE/NEET/EAMCET Portal Backend"}

if __name__ == "__main__":
    print("Starting simple FastAPI server on port 8001...")
    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info")