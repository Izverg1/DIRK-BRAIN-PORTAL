from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
import sys
import json
import subprocess
import asyncio
from datetime import datetime
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()
logger = logging.getLogger(__name__)

# Import Unified Orchestrator - single engine for all execution types
try:
    from unified_orchestrator import UnifiedOrchestrator
    orchestrator = UnifiedOrchestrator()
    logger.info("Unified Orchestrator initialized with all connectors")
    
    # Import GodMode Orchestrator for advanced task decomposition
    from godmode_orchestration import godmode_orchestrator
    logger.info("GodMode Orchestrator initialized")
    
    # Also try to import legacy CLI orchestrator for backward compatibility
    from cli_orchestrator import CLIOrchestrator
    cli_orchestrator = CLIOrchestrator()
    
    # Import Real Agent Systems
    from agents.claude_agent import claude_pool
    from agents.project_discovery import project_discovery
    logger.info("Real agent systems initialized")
    
except ImportError as e:
    logger.warning(f"Orchestrator import error: {e}")
    orchestrator = None
    cli_orchestrator = None
    godmode_orchestrator = None
    claude_pool = None
    project_discovery = None

active_websockets = []

# Add CORS middleware to allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class TaskCreate(BaseModel):
    title: str
    description: str
    assignee: str
    priority: str = "MEDIUM"
    deadline: Optional[str] = None

class AgentDeploy(BaseModel):
    agent_type: str
    project_name: str
    task_description: str

class CommandExecute(BaseModel):
    command: str
    args: Optional[Dict[str, Any]] = {}

# Task Registry Path
TASK_REGISTRY_PATH = os.path.join(os.path.dirname(__file__), "dirk_protocol", "task_registry.json")
ACTIVE_TASKS_PATH = os.path.join(os.path.dirname(__file__), "dirk_protocol", "active_tasks")

# Helper functions
def read_task_registry():
    try:
        with open(TASK_REGISTRY_PATH, 'r') as f:
            return json.load(f)
    except:
        return None

def write_task_registry(data):
    with open(TASK_REGISTRY_PATH, 'w') as f:
        json.dump(data, f, indent=2)

def read_task_file(task_id):
    try:
        task_path = os.path.join(ACTIVE_TASKS_PATH, f"{task_id}.json")
        with open(task_path, 'r') as f:
            return json.load(f)
    except:
        return None

# API ROUTES

@app.get("/api/status")
async def get_status():
    return {"status": "DIRK BRAIN Portal Backend (FastAPI) is running!"}

# In-memory agent storage (in production, use database)
agents_db = {
    "agent-1": {
        "id": "agent-1",
        "name": "CodeBuilder-01",
        "type": "DIRK.c",
        "status": "active",
        "project": "DIRK Brain Portal",
        "capabilities": ["TypeScript", "React", "API Integration"],
        "performance": 92,
        "tasksCompleted": 47,
        "createdAt": "2024-01-15"
    },
    "agent-2": {
        "id": "agent-2",
        "name": "Designer-01",
        "type": "DIRK.g",
        "status": "idle",
        "project": "NOT_TODAY",
        "capabilities": ["UI Design", "Content Generation", "Image Processing"],
        "performance": 88,
        "tasksCompleted": 23,
        "createdAt": "2024-01-14"
    }
}

@app.get("/api/agents")
async def get_agents():
    """Get all agents"""
    return list(agents_db.values())

@app.post("/api/agents/create")
async def create_agent(agent: dict):
    """Create a new agent"""
    agent_id = agent.get("id", f"agent-{len(agents_db) + 1}")
    agents_db[agent_id] = agent
    
    # Log agent creation
    logger.info(f"Created new agent: {agent_id} - {agent.get('name')} ({agent.get('type')})")
    
    # If it's a Mr.Wolf agent, initialize the advisor
    if agent.get("type") == "Mr.Wolf":
        try:
            from services.advisor import MrWolfAdvisor
            advisor = MrWolfAdvisor()
            logger.info(f"Initialized Mr.Wolf advisor for agent {agent_id}")
        except Exception as e:
            logger.error(f"Failed to initialize Mr.Wolf advisor: {e}")
    
    return {"success": True, "agent": agent}

@app.delete("/api/agents/{agent_id}")
async def delete_agent(agent_id: str):
    """Delete an agent"""
    if agent_id in agents_db:
        del agents_db[agent_id]
        return {"success": True}
    return {"success": False, "error": "Agent not found"}

@app.put("/api/agents/{agent_id}/status")
async def update_agent_status(agent_id: str, status: dict):
    """Update agent status"""
    if agent_id in agents_db:
        agents_db[agent_id]["status"] = status.get("status", "idle")
        return {"success": True, "agent": agents_db[agent_id]}
    return {"success": False, "error": "Agent not found"}

# Agent Pods storage
pods_db = {}
pod_templates_db = {}

@app.get("/api/agents/options")
async def get_agent_options():
    """Get available providers and frameworks for agent creation"""
    try:
        from providers.UniversalAgentProvider import UniversalAgentProvider
        provider = UniversalAgentProvider()
        return provider.getAvailableOptions()
    except ImportError:
        # Fallback if provider module not available
        return {
            "providers": {
                "anthropic": {"name": "Anthropic Claude", "models": ["claude-opus-4.1", "claude-sonnet-4"]},
                "google": {"name": "Google Gemini", "models": ["gemini-1.5-pro", "gemini-1.5-flash"]},
                "openai": {"name": "OpenAI GPT", "models": ["gpt-4-turbo", "gpt-4o"]},
                "local": {"name": "Local Models", "models": ["llama-3", "mistral"]}
            },
            "frameworks": {
                "langchain": {"name": "LangChain/LangGraph"},
                "crewai": {"name": "CrewAI"},
                "autogen": {"name": "Microsoft AutoGen"},
                "semantic_kernel": {"name": "Semantic Kernel"}
            }
        }

@app.post("/api/pods/generate")
async def generate_pod_from_requirements(requirements: dict):
    """Generate agent pod based on requirements"""
    from providers.UniversalAgentProvider import UniversalAgentProvider
    
    provider = UniversalAgentProvider()
    req_text = requirements.get("requirements", "").lower()
    
    # Analyze requirements to determine optimal agent configuration
    agents = []
    
    # Multi-provider approach based on requirements
    if "full-stack" in req_text or ("frontend" in req_text and "backend" in req_text):
        # Use Claude for coding, Gemini for BA
        agents.extend([
            {
                "provider": "anthropic_claude",
                "model": "claude-sonnet-4",
                "role": "fullstack_developer",
                "framework": "langchain"
            },
            {
                "provider": "google_gemini",
                "model": "gemini-1.5-pro", 
                "role": "business_analyst",
                "framework": "crewai"
            }
        ])
    
    if "e-commerce" in req_text or "payment" in req_text:
        # Add security specialist
        agents.append({
            "provider": "anthropic_claude",
            "model": "claude-opus-4.1",
            "role": "security_specialist",
            "framework": "semantic_kernel"
        })
    
    if "documentation" in req_text or "docs" in req_text:
        agents.append({
            "provider": "openai_gpt",
            "model": "gpt-4-turbo",
            "role": "technical_writer",
            "framework": "langchain"
        })
    
    if "testing" in req_text or "qa" in req_text:
        agents.append({
            "provider": "google_gemini",
            "model": "gemini-1.5-flash",
            "role": "qa_engineer",
            "framework": "autogen"
        })
    
    # Determine pod type
    pod_type = "swarm"
    if "sequential" in req_text or "pipeline" in req_text:
        pod_type = "pipeline"
    elif "hierarchical" in req_text or "manager" in req_text:
        pod_type = "hierarchical"
    elif "mesh" in req_text or "peer" in req_text:
        pod_type = "mesh"
    
    return {
        "success": True,
        "agents": agents,
        "recommended_type": pod_type,
        "deployment": requirements.get("deployment", "local")
    }

# Initialize agent runtime globally
agent_runtime = None

def get_agent_runtime():
    global agent_runtime
    if agent_runtime is None:
        # Import and initialize the runtime
        import sys
        import os
        sys.path.append(os.path.join(os.path.dirname(__file__), 'orchestration'))
        try:
            from AgentRuntime import AgentRuntime
            agent_runtime = AgentRuntime()
            agent_runtime.initializeWebSocket(8080)
            logger.info("Agent Runtime initialized with WebSocket on port 8080")
        except ImportError:
            logger.warning("AgentRuntime not available, using mock mode")
            agent_runtime = None
    return agent_runtime

@app.post("/api/pods/deploy")
async def deploy_pod(pod_data: dict):
    """Deploy an agent pod with actual runtime orchestration"""
    pod_id = pod_data.get("id", f"pod-{datetime.now().strftime('%Y%m%d_%H%M%S')}")
    
    # Store pod configuration
    pods_db[pod_id] = {
        **pod_data,
        "status": "deploying",
        "deployed_at": datetime.now().isoformat()
    }
    
    logger.info(f"Deploying pod {pod_id} with {len(pod_data.get('agents', []))} agents")
    
    # Try to use actual runtime if available
    runtime = get_agent_runtime()
    
    if runtime:
        try:
            # Deploy using actual runtime
            deployment_result = await runtime.deployPod(pod_data)
            deployment_results = deployment_result["deploymentResults"]
            
            # Update pod with orchestration info
            pods_db[pod_id]["orchestration"] = deployment_result["orchestration"]
        except Exception as e:
            logger.error(f"Runtime deployment failed: {e}")
            # Fallback to mock
            deployment_results = []
            for agent_config in pod_data.get("agents", []):
                deployment_results.append({
                    "success": True,
                    "agentId": agent_config.get("id"),
                    "runtime": "mock",
                    "endpoint": f"http://localhost:8000/agents/{agent_config.get('id')}"
                })
    else:
        # Mock deployment for demo
        deployment_results = []
        for agent_config in pod_data.get("agents", []):
            try:
                # Simulate deployment
                import time
                time.sleep(0.1)  # Simulate deployment time
                deployment_results.append({
                    "success": True,
                    "agentId": agent_config.get("id"),
                    "runtime": "mock",
                    "endpoint": f"http://localhost:8000/agents/{agent_config.get('id')}"
                })
            except Exception as e:
                logger.error(f"Failed to deploy agent {agent_config.get('id')}: {e}")
                deployment_results.append({"success": False, "error": str(e)})
    
    # Update pod status
    all_successful = all(r.get("success", False) for r in deployment_results)
    pods_db[pod_id]["status"] = "active" if all_successful else "failed"
    pods_db[pod_id]["deployment_results"] = deployment_results
    
    # Mock performance data
    if all_successful:
        pods_db[pod_id]["performance"] = {
            "successRate": 98.5,
            "avgLatency": 120,
            "throughput": 45,
            "errorRate": 1.5
        }
    
    return {
        "success": all_successful,
        "pod_id": pod_id,
        "deployment_results": deployment_results,
        "performance": pods_db[pod_id].get("performance")
    }

@app.get("/api/pods")
async def get_all_pods():
    """Get all deployed pods"""
    return list(pods_db.values())

@app.get("/api/pods/{pod_id}")
async def get_pod(pod_id: str):
    """Get specific pod details"""
    if pod_id in pods_db:
        return pods_db[pod_id]
    raise HTTPException(status_code=404, detail="Pod not found")

@app.post("/api/pods/{pod_id}/execute")
async def execute_task_on_pod(pod_id: str, task_data: dict):
    """Execute a task on a deployed pod"""
    if pod_id not in pods_db:
        raise HTTPException(status_code=404, detail="Pod not found")
    
    pod = pods_db[pod_id]
    if pod.get("status") != "active":
        raise HTTPException(status_code=400, detail="Pod is not active")
    
    runtime = get_agent_runtime()
    
    if runtime:
        try:
            # Execute task using runtime
            result = await runtime.executeTask(pod_id, task_data)
            
            # Update pod metrics
            if "performance" in pod:
                pod["performance"]["throughput"] = pod["performance"].get("throughput", 0) + 1
            
            return {
                "success": True,
                "pod_id": pod_id,
                "result": result,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Task execution failed: {e}")
            return {
                "success": False,
                "pod_id": pod_id,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    else:
        # Mock execution
        return {
            "success": True,
            "pod_id": pod_id,
            "result": {
                "type": "mock",
                "output": f"Mock execution result for task: {task_data.get('description', 'Unknown task')}"
            },
            "timestamp": datetime.now().isoformat()
        }

@app.get("/api/runtime/status")
async def get_runtime_status():
    """Get runtime orchestration status"""
    runtime = get_agent_runtime()
    
    if runtime:
        return runtime.getStatus()
    else:
        return {
            "status": "mock_mode",
            "activePods": len([p for p in pods_db.values() if p.get("status") == "active"]),
            "totalAgents": sum(len(p.get("agents", [])) for p in pods_db.values())
        }

@app.post("/api/ai/generate-agents")
async def generate_agents_from_ai_prompt(request: dict):
    """Generate agents based on AI prompt - now with intelligent swarm generation"""
    prompt = request.get("prompt", "")
    model = request.get("model", "claude-sonnet-4")
    context = request.get("context", {})
    project = request.get("project", None)
    deployment_target = request.get("deployment", "local")
    
    # Use the new AgentGenerator for intelligent swarm creation
    try:
        from agent_generator import AgentGenerator
        generator = AgentGenerator()
        
        # Generate swarm based on natural language prompt
        swarm = generator.generate_agents(prompt, project)
        
        # Deploy the swarm
        deployment = generator.deploy_swarm(swarm, deployment_target)
        
        # Store swarm in database
        swarm_id = swarm["id"]
        pods_db[swarm_id] = {
            **swarm,
            "deployment": deployment,
            "status": "active"
        }
        
        return {
            "success": True,
            "swarm": swarm,
            "deployment": deployment,
            "message": f"Generated {len(swarm['agents'])} agents in {swarm['coordination']} formation",
            "agents": swarm["agents"]  # For backward compatibility
        }
    except ImportError:
        # Fallback to original implementation if AgentGenerator not available
        logger.warning("AgentGenerator not available, using simple generation")
    
    # Analyze prompt to determine agent requirements
    prompt_lower = prompt.lower()
    agents = []
    
    # Keywords mapping to agent configurations
    if "full-stack" in prompt_lower or "fullstack" in prompt_lower:
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
            },
            {
                "id": f"agent-{datetime.now().timestamp()}-3",
                "name": "QA Tester",
                "provider": "google_gemini",
                "model": "gemini-1.5-pro",
                "role": "qa_engineer",
                "capabilities": ["Testing", "Verification", "Quality Assurance"],
                "specialty": "business_analysis"
            }
        ])
    
    if "security" in prompt_lower:
        agents.append({
            "id": f"agent-{datetime.now().timestamp()}-sec",
            "name": "Security Analyst",
            "provider": "anthropic_claude",
            "model": "claude-opus-4.1",
            "role": "security_specialist",
            "capabilities": ["Security Analysis", "Vulnerability Detection", "Compliance"],
            "specialty": "security"
        })
    
    if "data" in prompt_lower or "analytics" in prompt_lower:
        agents.extend([
            {
                "id": f"agent-{datetime.now().timestamp()}-data",
                "name": "Data Analyst",
                "provider": "google_gemini",
                "model": "gemini-1.5-pro",
                "role": "data_analyst",
                "capabilities": ["Data Analysis", "Visualization", "Reporting"],
                "specialty": "business_analysis"
            },
            {
                "id": f"agent-{datetime.now().timestamp()}-ml",
                "name": "ML Engineer",
                "provider": "openai_gpt",
                "model": "gpt-4-turbo",
                "role": "ml_engineer",
                "capabilities": ["Machine Learning", "Model Training", "Optimization"],
                "specialty": "general"
            }
        ])
    
    if "creative" in prompt_lower or "content" in prompt_lower:
        agents.extend([
            {
                "id": f"agent-{datetime.now().timestamp()}-creative",
                "name": "Content Creator",
                "provider": "openai_gpt",
                "model": "gpt-4-turbo",
                "role": "content_creator",
                "capabilities": ["Writing", "Creative Content", "Marketing"],
                "specialty": "general"
            },
            {
                "id": f"agent-{datetime.now().timestamp()}-design",
                "name": "Designer",
                "provider": "google_gemini",
                "model": "gemini-1.5-pro",
                "role": "designer",
                "capabilities": ["UI Design", "Graphics", "Branding"],
                "specialty": "creative"
            }
        ])
    
    if "testing" in prompt_lower or "qa" in prompt_lower:
        agents.extend([
            {
                "id": f"agent-{datetime.now().timestamp()}-test1",
                "name": "Unit Tester",
                "provider": "anthropic_claude",
                "model": "claude-haiku-3.5",
                "role": "unit_tester",
                "capabilities": ["Unit Testing", "Test Coverage", "Mocking"],
                "specialty": "testing"
            },
            {
                "id": f"agent-{datetime.now().timestamp()}-test2",
                "name": "Integration Tester",
                "provider": "google_gemini",
                "model": "gemini-1.5-flash",
                "role": "integration_tester",
                "capabilities": ["Integration Testing", "API Testing", "E2E Testing"],
                "specialty": "testing"
            }
        ])
    
    # If no specific keywords matched, generate a general-purpose agent
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
        "message": f"Generated {len(agents)} agents based on your requirements",
        "prompt": prompt,
        "model": model
    }

@app.post("/api/ai/chat")
async def ai_chat(request: dict):
    """General AI chat endpoint with command execution"""
    prompt = request.get("prompt", "")
    model = request.get("model", "claude-sonnet-4")
    conversation = request.get("conversation", [])
    
    # Simple response generation (in production, this would call actual LLM)
    response = ""
    command = None
    
    prompt_lower = prompt.lower()
    
    # Check for specific commands
    if "status" in prompt_lower:
        command = "get_status"
        active_pods = len([p for p in pods_db.values() if p.get("status") == "active"])
        total_agents = sum(len(p.get("agents", [])) for p in pods_db.values())
        response = f"System Status: {active_pods} active pods with {total_agents} total agents deployed."
    
    elif "help" in prompt_lower:
        response = """I can help you with:
• Creating agent pods: "Create a full-stack development pod"
• Generating specific agents: "Generate security review agents"
• Building pipelines: "Create a data analysis pipeline"
• Managing projects: "Show me active projects"
• Deploying agents: "Deploy agents to cloud"

Try dragging the generated agents onto the canvas!"""
    
    elif "deploy" in prompt_lower:
        command = "deploy"
        response = "To deploy agents, first add them to the canvas, select a project, and click the Deploy button."
    
    elif "project" in prompt_lower:
        command = "list_projects"
        response = "Available projects: NOT_TODAY, DIRK Brain Portal, CrawlZilla, E-Commerce Platform. Click the Projects button to manage them."
    
    else:
        # Default helpful response
        response = f"I understand you want to: {prompt}. I can help you create AI agents for this. Try being more specific about what type of agents you need (e.g., 'Create agents for web development' or 'Generate a testing pipeline')."
    
    return {
        "success": True,
        "response": response,
        "command": command,
        "model": model,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/analytics/global")
async def get_global_analytics():
    """Get global analytics data for real-time monitoring"""
    active_pods = [p for p in pods_db.values() if p.get("status") == "active"]
    
    return {
        "globalStats": {
            "totalPods": len(pods_db),
            "activePods": len(active_pods),
            "totalRequests": sum(p.get("performance", {}).get("throughput", 0) * 60 for p in active_pods),
            "avgSuccessRate": sum(p.get("performance", {}).get("successRate", 0) for p in active_pods) / max(len(active_pods), 1)
        },
        "podPerformance": [
            {
                "id": p.get("id"),
                "name": p.get("name"),
                "performance": p.get("performance"),
                "agents": len(p.get("agents", []))
            } for p in active_pods
        ],
        "customerInsights": [
            {"region": "US East", "satisfaction": 94.2, "usage": 2847},
            {"region": "EU West", "satisfaction": 89.1, "usage": 1923},
            {"region": "Asia Pacific", "satisfaction": 96.7, "usage": 3421}
        ],
        "painPoints": [
            {"type": "high_latency", "region": "EU West", "severity": "high", "count": 23},
            {"type": "token_limit", "provider": "openai", "severity": "medium", "count": 15},
            {"type": "rate_limit", "provider": "anthropic", "severity": "low", "count": 8}
        ]
    }

@app.post("/api/agents/generate")
async def generate_agents_from_requirements(requirements: dict):
    """Generate agents based on project requirements (legacy endpoint)"""
    req_text = requirements.get("requirements", "").lower()
    project = requirements.get("project", "")
    generated = []
    
    # Simple keyword-based generation
    if "frontend" in req_text or "ui" in req_text:
        agent = {
            "id": f"agent-gen-{len(agents_db) + 1}",
            "name": f"Frontend-Agent-{len(agents_db) + 1}",
            "type": "DIRK.c",
            "status": "idle",
            "project": project,
            "capabilities": ["React", "TypeScript", "CSS", "UI Components"],
            "performance": 100,
            "tasksCompleted": 0,
            "createdAt": datetime.now().isoformat()
        }
        agents_db[agent["id"]] = agent
        generated.append(agent)
    
    if "backend" in req_text or "api" in req_text:
        agent = {
            "id": f"agent-gen-{len(agents_db) + 1}",
            "name": f"Backend-Agent-{len(agents_db) + 1}",
            "type": "DIRK.c",
            "status": "idle",
            "project": project,
            "capabilities": ["Python", "FastAPI", "Database", "REST APIs"],
            "performance": 100,
            "tasksCompleted": 0,
            "createdAt": datetime.now().isoformat()
        }
        agents_db[agent["id"]] = agent
        generated.append(agent)
    
    if "design" in req_text or "creative" in req_text:
        agent = {
            "id": f"agent-gen-{len(agents_db) + 1}",
            "name": f"Designer-Agent-{len(agents_db) + 1}",
            "type": "DIRK.g",
            "status": "idle",
            "project": project,
            "capabilities": ["UI/UX Design", "Graphics", "Content Creation"],
            "performance": 100,
            "tasksCompleted": 0,
            "createdAt": datetime.now().isoformat()
        }
        agents_db[agent["id"]] = agent
        generated.append(agent)
    
    if "security" in req_text or "review" in req_text:
        agent = {
            "id": f"agent-gen-{len(agents_db) + 1}",
            "name": f"SecurityWolf-{len(agents_db) + 1}",
            "type": "Mr.Wolf",
            "status": "idle",
            "project": project,
            "capabilities": ["Security Analysis", "Code Review", "Compliance"],
            "performance": 100,
            "tasksCompleted": 0,
            "createdAt": datetime.now().isoformat()
        }
        agents_db[agent["id"]] = agent
        generated.append(agent)
    
    return {"success": True, "agents": generated}

@app.get("/api/tasks")
async def get_tasks():
    registry = read_task_registry()
    if not registry:
        return {"active": [], "completed": [], "failed": []}
    
    # Load full task details
    active_tasks = []
    for task_id in registry.get("active_tasks", []):
        task_data = read_task_file(task_id)
        if task_data:
            active_tasks.append(task_data)
    
    return {
        "active": active_tasks,
        "completed": registry.get("completed_tasks", []),
        "failed": registry.get("failed_tasks", []),
        "statistics": registry.get("statistics", {})
    }

@app.post("/api/tasks")
async def create_task(task: TaskCreate):
    registry = read_task_registry()
    if not registry:
        raise HTTPException(status_code=500, detail="Task registry not found")
    
    # Create new task
    task_id = f"DIRK-TASK-{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    task_data = {
        "task_id": task_id,
        "title": task.title,
        "description": task.description,
        "creator": "User",
        "assignee": task.assignee,
        "status": "ASSIGNED",
        "priority": task.priority,
        "created_at": datetime.now().isoformat(),
        "deadline": task.deadline or datetime.now().isoformat(),
        "progress_log": [],
        "verification_status": "PENDING"
    }
    
    # Save task file
    task_path = os.path.join(ACTIVE_TASKS_PATH, f"{task_id}.json")
    with open(task_path, 'w') as f:
        json.dump(task_data, f, indent=2)
    
    # Update registry
    registry["active_tasks"].append(task_id)
    registry["task_counter"] = registry.get("task_counter", 0) + 1
    registry["last_updated"] = datetime.now().isoformat()
    write_task_registry(registry)
    
    return {"task_id": task_id, "status": "created"}

@app.post("/api/agents/deploy")
async def deploy_agent(deployment: AgentDeploy):
    # Simulate agent deployment
    # In a real system, this would trigger actual agent deployment
    return {
        "status": "deploying",
        "agent_type": deployment.agent_type,
        "project": deployment.project_name,
        "message": f"Deploying {deployment.agent_type} agent to {deployment.project_name}"
    }

# Import project manager
from project_manager import project_manager

@app.get("/api/projects")
async def get_projects():
    """Get projects from configured sources"""
    # Try to load settings first
    settings = await get_settings()
    
    # Configure sources for project manager
    sources = []
    
    if settings and "projectSources" in settings:
        for source in settings.get("projectSources", []):
            if source.get("type") == "local":
                sources.append({
                    "type": "local",
                    "name": source.get("name", "Local"),
                    "path": source.get("path", "~/projects"),
                    "enabled": source.get("enabled", True)
                })
            elif source.get("type") == "github":
                sources.append({
                    "type": "github",
                    "name": "GitHub",
                    "username": source.get("username"),
                    "organization": source.get("organization"),
                    "api_key": source.get("apiKey"),
                    "enabled": source.get("enabled", True)
                })
            elif source.get("type") == "remote":
                sources.append({
                    "type": "remote",
                    "name": source.get("name", "Remote"),
                    "url": source.get("url"),
                    "api_key": source.get("apiKey"),
                    "enabled": source.get("enabled", True)
                })
    
    # Default source if none configured
    if not sources:
        sources = [{
            "type": "local",
            "name": "Local Projects",
            "path": "~/projects",
            "enabled": True
        }]
    
    # Discover projects
    projects = await project_manager.discover_projects(sources)
    
    # Add default projects if no projects found
    if not projects:
        projects = [
            {
                "id": "not_today",
                "name": "NOT_TODAY",
                "status": "active",
                "type": "default",
                "source": "Default",
                "source_type": "default",
                "technologies": ["AI", "Orchestration"],
                "description": "AI Agent Orchestration Platform"
            },
            {
                "id": "crawlzilla",
                "name": "CrawlZilla",
                "status": "planning",
                "type": "default",
                "source": "Default",
                "source_type": "default",
                "technologies": ["Web Scraping", "Data Mining"],
                "description": "Advanced Web Crawling Framework"
            },
            {
                "id": "dirk_brain",
                "name": "DIRK Brain Portal",
                "status": "active",
                "type": "default",
                "source": "Default",
                "source_type": "default",
                "technologies": ["React", "FastAPI", "Three.js"],
                "description": "The platform you're using right now!"
            }
        ]
    
    return {"projects": projects, "last_scan": project_manager.last_scan}

# Import MrWolf security validator
from mrwolf_security import mr_wolf

@app.post("/api/security/validate-code")
async def validate_code_security(request: dict):
    """MrWolf code validation - The Wolf checks your code"""
    code = request.get("code", "")
    language = request.get("language", "python")
    
    if not code:
        raise HTTPException(status_code=400, detail="No code provided")
    
    # The Wolf validates
    results = mr_wolf.validate_code(code, language)
    
    # Send real-time update via WebSocket
    await ws_manager.broadcast({
        "type": "security_validation",
        "results": results,
        "timestamp": datetime.now().isoformat()
    })
    
    return results

@app.post("/api/security/check-dependencies")
async def check_dependencies(request: dict):
    """Check project dependencies for vulnerabilities"""
    project_path = request.get("project_path", "")
    file_type = request.get("file_type", "package.json")
    
    if not project_path:
        raise HTTPException(status_code=400, detail="Project path required")
    
    package_file = os.path.join(project_path, file_type)
    
    if not os.path.exists(package_file):
        raise HTTPException(status_code=404, detail=f"{file_type} not found")
    
    results = mr_wolf.validate_dependencies(package_file, file_type)
    return results

@app.post("/api/security/compliance-check")
async def check_compliance(request: dict):
    """Check project compliance with security standards"""
    project_path = request.get("project_path", "")
    standards = request.get("standards", ["OWASP"])
    
    if not project_path:
        raise HTTPException(status_code=400, detail="Project path required")
    
    results = mr_wolf.check_compliance(project_path, standards)
    return results

@app.post("/api/security/full-report")
async def generate_security_report(request: dict):
    """Generate comprehensive security report - The Wolf's verdict"""
    project_path = request.get("project_path", "")
    project_id = request.get("project_id", "")
    
    # Get project path from ID if provided
    if project_id and not project_path:
        project = project_manager.get_project(project_id)
        if project:
            project_path = project.get("path", "")
    
    if not project_path:
        raise HTTPException(status_code=400, detail="Project path or ID required")
    
    if not os.path.exists(project_path):
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Generate comprehensive report
    report = mr_wolf.generate_security_report(project_path)
    
    # Broadcast to WebSocket
    await ws_manager.broadcast({
        "type": "security_report",
        "project": project_path,
        "verdict": report.get("verdict"),
        "wolf_says": report.get("wolf_says"),
        "timestamp": datetime.now().isoformat()
    })
    
    return report

@app.get("/api/projects/{project_id}")
async def get_project(project_id: str):
    """Get specific project details"""
    project = project_manager.get_project(project_id)
    if project:
        return project
    raise HTTPException(status_code=404, detail="Project not found")

@app.post("/api/projects/refresh")
async def refresh_projects():
    """Refresh all projects"""
    settings = await get_settings()
    sources = []
    
    if settings and "projectSources" in settings:
        for source in settings.get("projectSources", []):
            sources.append(source)
    
    projects = await project_manager.discover_projects(sources)
    return {"projects": projects, "count": len(projects)}

@app.post("/api/projects/create")
async def create_project(project_data: dict):
    """Create a new project"""
    name = project_data.get("name", "")
    path = project_data.get("path", "")
    project_type = project_data.get("type", "generic")
    
    if not name:
        raise HTTPException(status_code=400, detail="Project name is required")
    
    if not path:
        # Default to user's projects directory
        path = os.path.expanduser(f"~/projects/{name}")
    
    project = await project_manager.create_project(name, path, project_type)
    return {"success": True, "project": project}

@app.post("/api/execute")
async def execute_command(cmd: CommandExecute):
    # Execute DIRK commands
    # This is a simplified version - in production, add proper security
    if cmd.command == "start_godmode":
        # Start the GodMode orchestrator
        return {"status": "started", "message": "GodMode Orchestrator started"}
    elif cmd.command == "analyze_task":
        # Trigger task analysis
        return {"status": "analyzing", "message": "Task analysis in progress"}
    else:
        return {"status": "unknown", "message": f"Unknown command: {cmd.command}"}

# Settings storage (in production, use database)
settings_db = {}

async def get_settings():
    """Get current settings"""
    if settings_db:
        return settings_db
    
    # Try to load from file
    settings_file = os.path.join(os.path.dirname(__file__), "settings.json")
    if os.path.exists(settings_file):
        try:
            with open(settings_file, 'r') as f:
                return json.load(f)
        except:
            pass
    
    # Return default settings
    return {
        "projectSources": [
            {
                "id": "1",
                "name": "Local Projects",
                "type": "local",
                "path": "~/projects",
                "enabled": True
            }
        ],
        "aiProviders": {
            "anthropic": {"apiKey": "", "enabled": False},
            "google": {"apiKey": "", "enabled": False},
            "openai": {"apiKey": "", "enabled": False},
            "local": {"endpoint": "http://localhost:11434", "enabled": True}
        },
        "mcp": {
            "enabled": True,
            "servers": [
                {"id": "1", "name": "Filesystem MCP", "endpoint": "localhost:3100", "enabled": True}
            ]
        },
        "deployment": {
            "defaultTarget": "local",
            "localPath": os.path.expanduser("~/projects"),
            "remoteEndpoint": "",
            "cloudProvider": "aws"
        }
    }

@app.get("/api/settings")
async def get_settings_endpoint():
    """Get application settings"""
    return await get_settings()

@app.post("/api/settings")
async def save_settings(new_settings: dict):
    """Save application settings"""
    global settings_db
    settings_db = new_settings
    
    # Also save to file for persistence
    settings_file = os.path.join(os.path.dirname(__file__), "settings.json")
    try:
        with open(settings_file, 'w') as f:
            json.dump(new_settings, f, indent=2)
        return {"success": True, "message": "Settings saved"}
    except Exception as e:
        logger.error(f"Failed to save settings: {e}")
        return {"success": False, "error": str(e)}

# CLI Execution Endpoints
class CLICommand(BaseModel):
    command: str
    projectPath: Optional[str] = None
    input: Optional[str] = None
    env: Optional[Dict[str, str]] = {}

class CLITemplate(BaseModel):
    tool: str
    template: str
    variables: Optional[Dict[str, Any]] = {}

class CLIWorkflow(BaseModel):
    workflow: str
    variables: Optional[Dict[str, Any]] = {}

@app.post("/api/cli/execute")
async def execute_cli_command(cmd: CLICommand):
    """Execute a CLI command"""
    if not cli_orchestrator:
        raise HTTPException(status_code=503, detail="CLI orchestrator not available")
    
    try:
        config = {
            "command": cmd.command.split()[0] if cmd.command else "",
            "args": cmd.command.split()[1:] if len(cmd.command.split()) > 1 else [],
            "stdin": cmd.input or "",
            "cwd": cmd.projectPath or os.getcwd(),
            "env": cmd.env or {}
        }
        
        # Execute command
        result = await asyncio.to_thread(cli_orchestrator.executeCommand, config)
        
        # Broadcast to WebSocket clients
        for ws in active_websockets:
            try:
                await ws.send_json({
                    "type": "command_complete",
                    "commandId": result["commandId"],
                    "exitCode": result["exitCode"],
                    "output": result["output"]
                })
            except:
                pass
        
        return result
    except Exception as e:
        logger.error(f"CLI execution failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/cli/template")
async def execute_cli_template(template: CLITemplate):
    """Execute a CLI command template"""
    try:
        result = await asyncio.to_thread(
            cli_orchestrator.executeTemplate,
            template.tool,
            template.template,
            template.variables or {}
        )
        return result
    except Exception as e:
        logger.error(f"Template execution failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/cli/workflow")
async def execute_cli_workflow(workflow: CLIWorkflow):
    """Execute a CLI workflow"""
    try:
        result = await asyncio.to_thread(
            cli_orchestrator.executeWorkflow,
            workflow.workflow,
            workflow.variables or {}
        )
        return {"success": True, "results": result}
    except Exception as e:
        logger.error(f"Workflow execution failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/cli/templates")
async def get_cli_templates():
    """Get available CLI templates"""
    return cli_orchestrator.getTemplates()

@app.get("/api/cli/history")
async def get_cli_history(limit: int = 50):
    """Get CLI command history"""
    return cli_orchestrator.getHistory(limit)

@app.get("/api/cli/tools")
async def check_cli_tools():
    """Check which CLI tools are available"""
    if cli_orchestrator:
        tools = await asyncio.to_thread(cli_orchestrator.getAvailableTools)
        return tools
    return {}

# Unified Orchestration Endpoints
@app.post("/api/unified/execute")
async def unified_execute(request: dict):
    """Execute command through unified orchestrator - auto-detects execution type"""
    if not orchestrator:
        raise HTTPException(status_code=503, detail="Unified orchestrator not available")
    
    command = request.get("command", "")
    context = request.get("context", {})
    
    # Add project context if provided
    if request.get("project"):
        context["project"] = request.get("project")
    
    # Execute through unified orchestrator
    result = await orchestrator.execute(command, context)
    
    # Broadcast execution result through WebSocket manager
    await ws_manager.broadcast({
        "type": "execution_result",
        "command": command,
        "result": result,
        "timestamp": datetime.now().isoformat()
    })
    
    # Update agent status if execution affected agents
    if result.get("connector") in ["cli", "api"]:
        await ws_manager.update_agent_status(
            result.get("execution_id", "unknown"),
            {"status": "completed" if result.get("success") else "error"}
        )
    
    return result

@app.post("/api/unified/workflow")
async def unified_workflow(request: dict):
    """Execute a complex workflow through unified orchestrator"""
    if not orchestrator:
        raise HTTPException(status_code=503, detail="Unified orchestrator not available")
    
    workflow = request.get("workflow", {})
    result = await orchestrator.execute_workflow(workflow)
    return result

@app.get("/api/unified/connectors")
async def get_connectors():
    """Get all available connectors and their capabilities"""
    if not orchestrator:
        return {"error": "Orchestrator not available"}
    
    return {
        "connectors": orchestrator.get_capabilities(),
        "health": await orchestrator.health_check_all()
    }

@app.post("/api/unified/register-connector")
async def register_connector(request: dict):
    """Register a new custom connector"""
    if not orchestrator:
        raise HTTPException(status_code=503, detail="Orchestrator not available")
    
    connector_type = request.get("type", "")
    config = request.get("config", {})
    name = request.get("name", f"custom-{connector_type}")
    
    # Create appropriate connector based on type
    if connector_type == "api":
        from unified_orchestrator import APIConnector
        connector = APIConnector(config)
    elif connector_type == "ssh":
        from unified_orchestrator import SSHConnector
        connector = SSHConnector(config)
    elif connector_type == "docker":
        from unified_orchestrator import DockerConnector
        connector = DockerConnector(config)
    else:
        raise HTTPException(status_code=400, detail=f"Unknown connector type: {connector_type}")
    
    orchestrator.register_connector(name, connector)
    
    return {
        "success": True,
        "message": f"Registered connector: {name}",
        "capabilities": connector.get_capabilities()
    }

@app.get("/api/unified/history")
async def get_execution_history(limit: int = 50):
    """Get execution history from unified orchestrator"""
    if not orchestrator:
        return []
    
    return orchestrator.get_execution_history(limit)

@app.get("/api/unified/active")
async def get_active_executions():
    """Get currently active executions"""
    if not orchestrator:
        return {}
    
    return orchestrator.get_active_executions()

# GodMode Orchestration Endpoints
@app.post("/api/godmode/decompose")
async def godmode_decompose(request: dict):
    """Decompose a high-level task into subtasks"""
    if not godmode_orchestrator:
        raise HTTPException(status_code=503, detail="GodMode orchestrator not available")
    
    task_request = request.get("request", "")
    context = request.get("context", {})
    
    tasks = await godmode_orchestrator.decompose_task(task_request, context)
    
    return {
        "success": True,
        "tasks": [godmode_orchestrator.task_to_dict(t) for t in tasks],
        "count": len(tasks)
    }

@app.post("/api/godmode/execute")
async def godmode_execute(request: dict):
    """Execute a complete workflow with task decomposition and agent routing"""
    if not godmode_orchestrator:
        raise HTTPException(status_code=503, detail="GodMode orchestrator not available")
    
    task_request = request.get("request", "")
    context = request.get("context", {})
    
    result = await godmode_orchestrator.execute_workflow(task_request, context)
    
    # Broadcast through WebSocket
    for ws in active_websockets:
        try:
            await ws.send_json({
                "type": "godmode_execution",
                "workflow_id": result.get("workflow_id"),
                "status": "completed" if result.get("success") else "failed",
                "tasks": result.get("tasks", []),
                "timestamp": datetime.now().isoformat()
            })
        except:
            pass
    
    return result

@app.get("/api/godmode/metrics")
async def godmode_metrics():
    """Get GodMode orchestrator metrics"""
    if not godmode_orchestrator:
        return {"error": "GodMode orchestrator not available"}
    
    return godmode_orchestrator.get_metrics()

@app.get("/api/godmode/agents")
async def godmode_agents():
    """Get available agents and their capabilities"""
    if not godmode_orchestrator:
        return {"agents": []}
    
    agents = []
    for agent in godmode_orchestrator.agents.values():
        agents.append({
            "id": agent.id,
            "name": agent.name,
            "provider": agent.provider,
            "capabilities": [cap.value for cap in agent.capabilities],
            "specialties": [spec.value for spec in agent.specialties],
            "performance_score": agent.performance_score,
            "availability": agent.availability,
            "current_load": agent.current_load,
            "max_concurrent_tasks": agent.max_concurrent_tasks
        })
    
    return {"agents": agents, "count": len(agents)}

@app.get("/api/godmode/tasks/{task_id}")
async def godmode_task_status(task_id: str):
    """Get status of a specific task"""
    if not godmode_orchestrator:
        raise HTTPException(status_code=503, detail="GodMode orchestrator not available")
    
    if task_id not in godmode_orchestrator.tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task = godmode_orchestrator.tasks[task_id]
    return godmode_orchestrator.task_to_dict(task)

# WebSocket endpoint for orchestrator real-time updates
@app.websocket("/ws/orchestrator")
async def websocket_orchestrator(websocket: WebSocket):
    await websocket.accept()
    active_websockets.append(websocket)
    
    try:
        while True:
            # Receive commands from frontend
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "execute":
                # Execute command and stream output
                command = message.get("command", "")
                result = await orchestrator.execute(command)
                
                await websocket.send_json({
                    "type": "command_output",
                    "commandId": message.get("commandId"),
                    "output": result.get("output", ""),
                    "error": result.get("error"),
                    "success": result.get("success")
                })
                
                await websocket.send_json({
                    "type": "command_complete",
                    "commandId": message.get("commandId"),
                    "exitCode": result.get("exit_code", 0)
                })
            
            elif message.get("type") == "agent_status":
                # Update agent status
                agent_id = message.get("agentId")
                status = message.get("status")
                
                # Broadcast to all connected clients
                for ws in active_websockets:
                    if ws != websocket:
                        await ws.send_json({
                            "type": "agent_status",
                            "agentId": agent_id,
                            "status": status
                        })
            
    except WebSocketDisconnect:
        active_websockets.remove(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        if websocket in active_websockets:
            active_websockets.remove(websocket)
    """Get currently active executions"""
    if not orchestrator:
        return {}
    
    return orchestrator.get_active_executions()

# Import WebSocket manager
from websocket_manager import ws_manager

# WebSocket for real-time terminal output
@app.websocket("/ws/terminal")
async def websocket_terminal(websocket: WebSocket):
    await ws_manager.connect(websocket)
    
    try:
        while True:
            # Receive and handle messages
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                await ws_manager.handle_message(websocket, message)
            except json.JSONDecodeError:
                # Handle plain text messages for backward compatibility
                if data == "ping":
                    await websocket.send_json({"type": "pong"})
                else:
                    await ws_manager.handle_message(websocket, {"type": "execute_command", "command": data})
    except WebSocketDisconnect:
        await ws_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await ws_manager.disconnect(websocket)

@app.get("/api/metrics")
async def get_metrics():
    # Return system metrics
    registry = read_task_registry()
    stats = registry.get("statistics", {}) if registry else {}
    
    return {
        "tasks": {
            "total_created": stats.get("total_tasks_created", 0),
            "total_completed": stats.get("total_tasks_completed", 0),
            "total_failed": stats.get("total_tasks_failed", 0),
            "active_count": len(registry.get("active_tasks", [])) if registry else 0
        },
        "agents": {
            "total": 5,
            "active": 2,
            "idle": 3
        },
        "performance": {
            "average_completion_time": stats.get("average_completion_time", "N/A"),
            "success_rate": 95
        }
    }

# REAL AGENT SYSTEM ENDPOINTS

@app.get("/api/real-agents")
async def get_real_agents():
    """Get real Claude agents from the pool"""
    if not claude_pool:
        return {"agents": [], "status": "disabled"}
    
    status = claude_pool.get_pool_status()
    return {
        "agents": [
            {
                "id": agent_data["agent_id"],
                "name": agent_data["agent_id"],
                "type": "claude",
                "version": agent_data["model"],
                "status": agent_data["status"],
                "efficiency": min(100, agent_data["metrics"]["efficiency_score"]),
                "tasks": agent_data["metrics"]["tasks_completed"],
                "accuracy": min(100, agent_data["metrics"]["accuracy_score"]),
                "lastUpdate": agent_data["last_updated"]
            }
            for agent_data in status["agents"].values()
        ],
        "pool_status": status
    }

@app.post("/api/real-agents/initialize")
async def initialize_real_agents(request: dict):
    """Initialize real agents with API key"""
    if not claude_pool:
        raise HTTPException(status_code=503, detail="Agent pool not available")
    
    api_key = request.get("api_key")
    if not api_key:
        raise HTTPException(status_code=400, detail="API key required")
    
    # Initialize agents
    initialized = claude_pool.initialize_agents(api_key)
    
    return {
        "success": True,
        "initialized_agents": initialized,
        "total_agents": len(claude_pool.agents)
    }

@app.post("/api/real-agents/execute-task")
async def execute_real_task(request: dict):
    """Execute a task on real agents"""
    if not claude_pool:
        raise HTTPException(status_code=503, detail="Agent pool not available")
    
    task_id = request.get("task_id", f"task-{datetime.now().isoformat()}")
    prompt = request.get("prompt")
    max_tokens = request.get("max_tokens", 4000)
    
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt required")
    
    try:
        # Execute task on available agent
        task_result = await claude_pool.execute_task_on_pool(task_id, prompt, max_tokens)
        
        if not task_result:
            raise HTTPException(status_code=503, detail="No available agents")
        
        return {
            "success": True,
            "task": {
                "id": task_result.id,
                "status": task_result.status,
                "response": task_result.response,
                "tokens_used": task_result.tokens_used,
                "error": task_result.error
            }
        }
    except Exception as e:
        logger.error(f"Real task execution failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/projects/discover")
async def discover_projects():
    """Discover projects and their potential agents"""
    if not project_discovery:
        return {"projects": [], "status": "disabled"}
    
    # Discover all projects
    projects = project_discovery.discover_all_projects()
    
    # Get project status including any deployed agents
    status = project_discovery.get_project_status()
    
    return {
        "discovered_projects": len(projects),
        "projects": list(projects.values()),
        "deployed_agents": status["deployed_agents"],
        "agent_status": status
    }

@app.post("/api/projects/deploy-agents")
async def deploy_project_agents(request: dict):
    """Deploy Claude Code sub-agents for discovered projects"""
    if not project_discovery:
        raise HTTPException(status_code=503, detail="Project discovery not available")
    
    api_key = request.get("api_key")
    if not api_key:
        raise HTTPException(status_code=400, detail="API key required")
    
    # Deploy agents for all projects
    results = await project_discovery.deploy_all_agents(api_key)
    
    return {
        "success": True,
        "deployment_results": results,
        "total_projects": len(project_discovery.discovered_projects),
        "successful_deployments": sum(results.values())
    }

@app.get("/api/projects/{project_name}/agent")
async def get_project_agent_status(project_name: str):
    """Get status of specific project's agent"""
    if not project_discovery:
        raise HTTPException(status_code=503, detail="Project discovery not available")
    
    # Find the agent for this project
    agent_id = f"claude-code-{project_name.lower().replace(' ', '-')}"
    
    if agent_id in project_discovery.sub_agents:
        agent = project_discovery.sub_agents[agent_id]
        return agent.get_status()
    else:
        raise HTTPException(status_code=404, detail="Agent not found for project")

@app.post("/api/projects/{project_name}/execute-task")
async def execute_project_task(project_name: str, request: dict):
    """Execute task on specific project's agent"""
    if not project_discovery:
        raise HTTPException(status_code=503, detail="Project discovery not available")
    
    # Find the agent for this project
    agent_id = f"claude-code-{project_name.lower().replace(' ', '-')}"
    
    if agent_id not in project_discovery.sub_agents:
        raise HTTPException(status_code=404, detail="Agent not found for project")
    
    agent = project_discovery.sub_agents[agent_id]
    
    task_id = request.get("task_id", f"project-task-{datetime.now().isoformat()}")
    prompt = request.get("prompt")
    max_tokens = request.get("max_tokens", 4000)
    
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt required")
    
    try:
        task_result = await agent.execute_task(task_id, prompt, max_tokens)
        
        return {
            "success": True,
            "project": project_name,
            "agent_id": agent_id,
            "task": {
                "id": task_result.id,
                "status": task_result.status,
                "response": task_result.response,
                "tokens_used": task_result.tokens_used,
                "error": task_result.error
            }
        }
    except Exception as e:
        logger.error(f"Project task execution failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Static file serving (only needed if serving production build)
frontend_dist_path = "/Users/izverg/projects/dirk-brain-portal/frontend/out"

if os.path.exists(frontend_dist_path):
    # Serve static files only if build directory exists
    @app.get("/")
    async def read_root():
        return FileResponse(os.path.join(frontend_dist_path, "index.html"))
    
    app.mount("/_next", StaticFiles(directory=os.path.join(frontend_dist_path, "_next")), name="next_static")
    
    # Catch-all route MUST BE LAST
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_full_path = os.path.join(frontend_dist_path, full_path)
        if os.path.exists(file_full_path) and os.path.isfile(file_full_path):
            return FileResponse(file_full_path)
        # For client-side routing, return index.html
        return FileResponse(os.path.join(frontend_dist_path, "index.html"))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 3001))
    uvicorn.run(app, host="0.0.0.0", port=port)