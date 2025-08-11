#!/usr/bin/env python3

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="DIRK Agency Mock API", version="1.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "DIRK Agency Mock API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "dirk-agency-api"}

@app.get("/api/agents")
async def get_agents():
    return {
        "agents": [
            {
                "id": 1,
                "name": "Claude-3.5-Sonnet",
                "status": "active",
                "tasks": 1847,
                "accuracy": 99.2,
                "provider": "Anthropic"
            },
            {
                "id": 2,
                "name": "GPT-4-Turbo",
                "status": "active", 
                "tasks": 1456,
                "accuracy": 98.7,
                "provider": "OpenAI"
            },
            {
                "id": 3,
                "name": "Gemini-Pro-1.5",
                "status": "active",
                "tasks": 1234,
                "accuracy": 98.1,
                "provider": "Google"
            },
            {
                "id": 4,
                "name": "Claude-3-Opus",
                "status": "active",
                "tasks": 1678,
                "accuracy": 99.4,
                "provider": "Anthropic"
            }
        ],
        "total": 4,
        "active": 4
    }

@app.get("/api/pods")
async def get_pods():
    return {
        "pods": [
            {
                "id": "pod-1",
                "name": "Code Review Swarm",
                "type": "swarm",
                "agents": ["Claude-3.5-Sonnet", "GPT-4-Turbo"],
                "status": "active",
                "tasks_completed": 234
            },
            {
                "id": "pod-2", 
                "name": "Data Analysis Pipeline",
                "type": "pipeline",
                "agents": ["Gemini-Pro-1.5", "Claude-3-Opus"],
                "status": "active",
                "tasks_completed": 189
            }
        ],
        "total": 2,
        "active": 2
    }

@app.get("/api/projects")
async def get_projects():
    return {
        "projects": [
            {
                "id": "proj-1",
                "name": "E-commerce Platform",
                "status": "active",
                "progress": 68,
                "agents_assigned": 5
            },
            {
                "id": "proj-2",
                "name": "API Security Audit", 
                "status": "active",
                "progress": 42,
                "agents_assigned": 3
            },
            {
                "id": "proj-3",
                "name": "Mobile App Development",
                "status": "in_progress",
                "progress": 25,
                "agents_assigned": 4
            }
        ],
        "total": 3,
        "active": 3
    }

@app.get("/api/analytics/global")
async def get_global_analytics():
    return {
        "metrics": {
            "total_tasks": 8247,
            "success_rate": 99.2,
            "avg_response_time": 0.8,
            "active_agents": 47
        },
        "trends": {
            "tasks_change": "+18.7%",
            "success_change": "+4.8%", 
            "response_time_change": "-15.2%",
            "agents_change": "+23.4%"
        }
    }

if __name__ == "__main__":
    print("🚀 Starting DIRK Agency Mock API Server...")
    print("📊 Serving mock data for frontend development")
    print("🌐 API will be available at: http://localhost:8001")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )