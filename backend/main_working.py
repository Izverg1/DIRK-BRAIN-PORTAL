#!/usr/bin/env python3
"""
DIRK Brain Portal - Working Backend Implementation
Simplified FastAPI server that actually works
"""

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
import json
import logging
import asyncio
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="DIRK Brain Portal API", version="1.0.0")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage (for now)
agents_db = {}
pods_db = {}
metrics_db = {
    "totalPods": 0,
    "activePods": 0,
    "totalRequests": 0,
    "avgSuccessRate": 95.0
}

# Pydantic models
class AgentCreate(BaseModel):
    name: str
    type: str
    provider: str
    model: str
    capabilities: List[str] = []

class PodDeploy(BaseModel):
    name: str
    type: str
    agents: List[Dict[str, Any]]
    project: Optional[str] = None

# Root endpoint
@app.get("/")
async def root():
    return {"message": "DIRK Brain Portal API is running!", "version": "1.0.0"}

# Health check
@app.get("/api/status")
async def get_status():
    return {
        "status": "healthy",
        "message": "DIRK BRAIN Portal Backend (FastAPI) is running!",
        "timestamp": datetime.now().isoformat(),
        "active_agents": len(agents_db),
        "active_pods": len(pods_db)
    }

# Agent endpoints
@app.get("/api/agents")
async def get_agents():
    """Get all agents"""
    return list(agents_db.values())

@app.post("/api/agents/create")
async def create_agent(agent: AgentCreate):
    """Create a new agent"""
    agent_id = f"agent-{len(agents_db) + 1}"
    
    agent_data = {
        "id": agent_id,
        "name": agent.name,
        "type": agent.type,
        "provider": agent.provider,
        "model": agent.model,
        "capabilities": agent.capabilities,
        "status": "idle",
        "performance": 85.0,
        "tasksCompleted": 0,
        "createdAt": datetime.now().isoformat()
    }
    
    agents_db[agent_id] = agent_data
    logger.info(f"Created agent: {agent_id}")
    
    return {"success": True, "agent": agent_data}

@app.delete("/api/agents/{agent_id}")
async def delete_agent(agent_id: str):
    """Delete an agent"""
    if agent_id in agents_db:
        del agents_db[agent_id]
        logger.info(f"Deleted agent: {agent_id}")
        return {"success": True}
    raise HTTPException(status_code=404, detail="Agent not found")

# Pod endpoints  
@app.get("/api/pods")
async def get_pods():
    """Get all pods"""
    return list(pods_db.values())

@app.post("/api/pods/deploy")
async def deploy_pod(pod: PodDeploy):
    """Deploy a pod"""
    pod_id = f"pod-{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    pod_data = {
        "id": pod_id,
        "name": pod.name,
        "type": pod.type,
        "agents": pod.agents,
        "project": pod.project,
        "status": "active",
        "deployedAt": datetime.now().isoformat(),
        "performance": {
            "successRate": 95.0,
            "avgLatency": 120,
            "throughput": 45,
            "errorRate": 5.0
        }
    }
    
    pods_db[pod_id] = pod_data
    metrics_db["totalPods"] += 1
    metrics_db["activePods"] += 1
    
    logger.info(f"Deployed pod: {pod_id} with {len(pod.agents)} agents")
    
    return {
        "success": True,
        "pod_id": pod_id,
        "message": f"Pod deployed successfully with {len(pod.agents)} agents"
    }

@app.post("/api/pods/{pod_id}/execute")
async def execute_task_on_pod(pod_id: str, task_data: Dict[str, Any]):
    """Execute a task on a pod"""
    if pod_id not in pods_db:
        raise HTTPException(status_code=404, detail="Pod not found")
    
    pod = pods_db[pod_id]
    if pod["status"] != "active":
        raise HTTPException(status_code=400, detail="Pod is not active")
    
    # Simulate task execution
    result = {
        "success": True,
        "pod_id": pod_id,
        "task": task_data,
        "result": {
            "output": f"Task executed successfully on {len(pod['agents'])} agents",
            "executionTime": "2.3s",
            "agentsUsed": len(pod["agents"])
        },
        "timestamp": datetime.now().isoformat()
    }
    
    # Update metrics
    metrics_db["totalRequests"] += 1
    
    return result

# Analytics endpoints
@app.get("/api/analytics/global")
async def get_global_analytics():
    """Get global analytics"""
    return {
        "globalStats": metrics_db,
        "podPerformance": [
            {
                "id": pod_data["id"],
                "name": pod_data["name"],
                "performance": pod_data.get("performance", {}),
                "agents": len(pod_data.get("agents", []))
            }
            for pod_data in pods_db.values()
        ],
        "timestamp": datetime.now().isoformat()
    }

# AI generation endpoints
@app.post("/api/ai/generate-agents")
async def generate_agents_from_prompt(request: Dict[str, Any]):
    """Generate agents from AI prompt"""
    prompt = request.get("prompt", "")
    
    # Simple keyword-based generation
    agents = []
    
    if "full-stack" in prompt.lower() or "fullstack" in prompt.lower():
        agents.extend([
            {
                "id": f"agent-{datetime.now().timestamp()}-1",
                "name": "Frontend Developer",
                "provider": "anthropic_claude",
                "model": "claude-sonnet-4",
                "role": "frontend_developer",
                "capabilities": ["React", "TypeScript", "UI/UX"],
                "specialty": "coding"
            },
            {
                "id": f"agent-{datetime.now().timestamp()}-2", 
                "name": "Backend Developer",
                "provider": "anthropic_claude",
                "model": "claude-opus-4.1",
                "role": "backend_developer", 
                "capabilities": ["Python", "FastAPI", "Database"],
                "specialty": "coding"
            }
        ])
    
    if not agents:
        agents.append({
            "id": f"agent-{datetime.now().timestamp()}-general",
            "name": "General Assistant",
            "provider": "anthropic_claude",
            "model": "claude-sonnet-4",
            "role": "assistant",
            "capabilities": ["General Tasks", "Research", "Documentation"],
            "specialty": "general"
        })
    
    return {
        "success": True,
        "agents": agents,
        "message": f"Generated {len(agents)} agents based on your requirements"
    }

# Project endpoints
@app.get("/api/projects")
async def get_projects():
    """Get projects"""
    default_projects = [
        {
            "id": "dirk_brain",
            "name": "DIRK Brain Portal",
            "status": "active",
            "type": "ai_platform",
            "description": "AI Agent Orchestration Platform"
        },
        {
            "id": "test_project",
            "name": "Test Project",
            "status": "active",
            "type": "development",
            "description": "Development and testing environment"
        }
    ]
    
    return {"projects": default_projects}

# WebSocket endpoint
@app.websocket("/ws/terminal")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Keep connection alive and send periodic updates
            await websocket.send_json({
                "type": "status",
                "data": {
                    "connected": True,
                    "timestamp": datetime.now().isoformat()
                }
            })
            # Wait for 30 seconds before next update
            await asyncio.sleep(30)
    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 3001))
    
    print(f"🚀 Starting DIRK Brain Portal API on port {port}")
    print(f"📊 Dashboard available at http://localhost:{port}")
    print(f"📋 API docs at http://localhost:{port}/docs")
    
    uvicorn.run(
        "main_working:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )