"""
GodMode Orchestrator gRPC Server
Central orchestration service for task decomposition and agent coordination
"""

import grpc
import json
import asyncio
import logging
from concurrent import futures
from datetime import datetime
from typing import Dict, List, Any
import sys
import os

# Add proto path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'proto'))

# Import generated protobuf classes
try:
    from godmode_pb2 import (
        TaskDecompositionRequest, TaskDecompositionResponse,
        AgentSelectionRequest, AgentSelectionResponse,
        ExecutionPlanRequest, ExecutionPlanResponse,
        StatusRequest, StatusResponse,
        Agent, Task, ExecutionStep
    )
    from godmode_pb2_grpc import (
        GodModeServiceServicer,
        add_GodModeServiceServicer_to_server
    )
except ImportError:
    print("Proto files not generated. Generating now...")
    os.system("python -m grpc_tools.protoc -I../proto --python_out=. --grpc_python_out=. ../proto/godmode.proto")
    from godmode_pb2 import *
    from godmode_pb2_grpc import *

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GodModeOrchestrator(GodModeServiceServicer):
    """
    Main orchestration service that handles:
    - Task decomposition into subtasks
    - Agent selection based on capabilities
    - Execution plan generation
    - Workflow coordination
    """
    
    def __init__(self):
        self.active_tasks = {}
        self.agent_registry = {}
        self.execution_history = []
        self.initialize_default_agents()
        
    def initialize_default_agents(self):
        """Initialize default agent types"""
        self.agent_types = {
            "coding": {
                "providers": ["anthropic_claude", "openai_gpt"],
                "capabilities": ["code_generation", "debugging", "refactoring"],
                "specialties": ["python", "javascript", "typescript", "react"]
            },
            "analysis": {
                "providers": ["google_gemini", "anthropic_claude"],
                "capabilities": ["data_analysis", "pattern_recognition", "reporting"],
                "specialties": ["business_analysis", "requirements", "documentation"]
            },
            "testing": {
                "providers": ["google_gemini", "local_llm"],
                "capabilities": ["test_generation", "validation", "qa"],
                "specialties": ["unit_testing", "integration_testing", "e2e_testing"]
            },
            "security": {
                "providers": ["anthropic_claude"],
                "capabilities": ["vulnerability_scan", "compliance_check", "code_review"],
                "specialties": ["security_audit", "penetration_testing", "compliance"]
            },
            "creative": {
                "providers": ["openai_gpt", "google_gemini"],
                "capabilities": ["content_creation", "design", "ui_ux"],
                "specialties": ["copywriting", "graphic_design", "user_experience"]
            }
        }
        
    def DecomposeTask(self, request, context):
        """Decompose a complex task into subtasks"""
        logger.info(f"Decomposing task: {request.description}")
        
        # Analyze task complexity
        task_lower = request.description.lower()
        subtasks = []
        
        # Intelligent task decomposition based on keywords
        if "full-stack" in task_lower or "application" in task_lower:
            subtasks = [
                Task(
                    id=f"task-{datetime.now().timestamp()}-1",
                    name="Frontend Development",
                    description="Build user interface components",
                    type="coding",
                    priority="HIGH",
                    estimated_time=120
                ),
                Task(
                    id=f"task-{datetime.now().timestamp()}-2",
                    name="Backend Development",
                    description="Implement API endpoints and business logic",
                    type="coding",
                    priority="HIGH",
                    estimated_time=150
                ),
                Task(
                    id=f"task-{datetime.now().timestamp()}-3",
                    name="Database Design",
                    description="Design and implement data models",
                    type="coding",
                    priority="MEDIUM",
                    estimated_time=60
                ),
                Task(
                    id=f"task-{datetime.now().timestamp()}-4",
                    name="Testing",
                    description="Write and execute tests",
                    type="testing",
                    priority="MEDIUM",
                    estimated_time=90
                ),
                Task(
                    id=f"task-{datetime.now().timestamp()}-5",
                    name="Security Review",
                    description="Perform security audit",
                    type="security",
                    priority="HIGH",
                    estimated_time=45
                )
            ]
        
        elif "api" in task_lower or "endpoint" in task_lower:
            subtasks = [
                Task(
                    id=f"task-{datetime.now().timestamp()}-1",
                    name="API Design",
                    description="Design RESTful API structure",
                    type="analysis",
                    priority="HIGH",
                    estimated_time=30
                ),
                Task(
                    id=f"task-{datetime.now().timestamp()}-2",
                    name="Implementation",
                    description="Implement API endpoints",
                    type="coding",
                    priority="HIGH",
                    estimated_time=60
                ),
                Task(
                    id=f"task-{datetime.now().timestamp()}-3",
                    name="API Testing",
                    description="Test API endpoints",
                    type="testing",
                    priority="MEDIUM",
                    estimated_time=30
                )
            ]
        
        elif "analyze" in task_lower or "research" in task_lower:
            subtasks = [
                Task(
                    id=f"task-{datetime.now().timestamp()}-1",
                    name="Data Collection",
                    description="Gather required information",
                    type="analysis",
                    priority="HIGH",
                    estimated_time=45
                ),
                Task(
                    id=f"task-{datetime.now().timestamp()}-2",
                    name="Analysis",
                    description="Analyze collected data",
                    type="analysis",
                    priority="HIGH",
                    estimated_time=60
                ),
                Task(
                    id=f"task-{datetime.now().timestamp()}-3",
                    name="Report Generation",
                    description="Generate analysis report",
                    type="creative",
                    priority="MEDIUM",
                    estimated_time=30
                )
            ]
        
        else:
            # Generic task decomposition
            subtasks = [
                Task(
                    id=f"task-{datetime.now().timestamp()}-1",
                    name="Planning",
                    description="Plan approach and requirements",
                    type="analysis",
                    priority="HIGH",
                    estimated_time=30
                ),
                Task(
                    id=f"task-{datetime.now().timestamp()}-2",
                    name="Implementation",
                    description="Execute main task",
                    type="coding",
                    priority="HIGH",
                    estimated_time=90
                ),
                Task(
                    id=f"task-{datetime.now().timestamp()}-3",
                    name="Validation",
                    description="Validate results",
                    type="testing",
                    priority="MEDIUM",
                    estimated_time=30
                )
            ]
        
        # Build dependency graph
        dependencies = {}
        if len(subtasks) > 1:
            # Sequential dependencies by default
            for i in range(1, len(subtasks)):
                dependencies[subtasks[i].id] = [subtasks[i-1].id]
        
        response = TaskDecompositionResponse(
            success=True,
            subtasks=subtasks,
            dependencies=json.dumps(dependencies),
            total_estimated_time=sum(t.estimated_time for t in subtasks)
        )
        
        # Store in active tasks
        self.active_tasks[request.task_id] = {
            "description": request.description,
            "subtasks": subtasks,
            "created_at": datetime.now().isoformat()
        }
        
        return response
    
    def SelectAgents(self, request, context):
        """Select optimal agents for tasks"""
        logger.info(f"Selecting agents for {len(request.tasks)} tasks")
        
        agent_assignments = []
        
        for task in request.tasks:
            # Select best agent type for task
            task_type = task.type or "coding"
            agent_config = self.agent_types.get(task_type, self.agent_types["coding"])
            
            # Choose provider based on task priority
            if task.priority == "HIGH":
                provider = agent_config["providers"][0]  # Use best provider
            else:
                provider = agent_config["providers"][-1] if len(agent_config["providers"]) > 1 else agent_config["providers"][0]
            
            # Create agent assignment
            agent = Agent(
                id=f"agent-{datetime.now().timestamp()}",
                name=f"{task_type.capitalize()}-Agent",
                type=f"DIRK.{'c' if task_type == 'coding' else 'g' if task_type == 'creative' else 'a'}",
                provider=provider,
                capabilities=agent_config["capabilities"],
                status="available"
            )
            
            agent_assignments.append(agent)
            
            # Register agent
            self.agent_registry[agent.id] = {
                "agent": agent,
                "assigned_task": task.id,
                "created_at": datetime.now().isoformat()
            }
        
        return AgentSelectionResponse(
            success=True,
            selected_agents=agent_assignments,
            reasoning=f"Selected {len(agent_assignments)} specialized agents based on task requirements"
        )
    
    def GenerateExecutionPlan(self, request, context):
        """Generate optimal execution plan"""
        logger.info(f"Generating execution plan for {len(request.tasks)} tasks with {len(request.agents)} agents")
        
        execution_steps = []
        step_order = 1
        
        # Parse dependencies
        dependencies = json.loads(request.dependencies) if request.dependencies else {}
        
        # Create execution steps based on dependencies
        completed = set()
        remaining = [t for t in request.tasks]
        
        while remaining:
            # Find tasks that can be executed (no pending dependencies)
            ready_tasks = []
            for task in remaining:
                task_deps = dependencies.get(task.id, [])
                if all(dep in completed for dep in task_deps):
                    ready_tasks.append(task)
            
            if not ready_tasks:
                # Break circular dependencies
                ready_tasks = [remaining[0]]
            
            # Create parallel execution step for ready tasks
            parallel_tasks = []
            for task in ready_tasks:
                # Find assigned agent
                agent = None
                for a in request.agents:
                    if self.agent_registry.get(a.id, {}).get("assigned_task") == task.id:
                        agent = a
                        break
                
                if not agent and request.agents:
                    agent = request.agents[0]  # Fallback to first agent
                
                parallel_tasks.append({
                    "task_id": task.id,
                    "task_name": task.name,
                    "agent_id": agent.id if agent else "unassigned",
                    "agent_name": agent.name if agent else "Unassigned"
                })
            
            execution_step = ExecutionStep(
                step_number=step_order,
                description=f"Execute {len(parallel_tasks)} task(s) in parallel",
                parallel_tasks=json.dumps(parallel_tasks),
                estimated_time=max([t.estimated_time for t in ready_tasks], default=30)
            )
            
            execution_steps.append(execution_step)
            step_order += 1
            
            # Mark as completed and remove from remaining
            for task in ready_tasks:
                completed.add(task.id)
                remaining.remove(task)
        
        # Calculate total time (considering parallel execution)
        total_time = sum(step.estimated_time for step in execution_steps)
        
        return ExecutionPlanResponse(
            success=True,
            execution_steps=execution_steps,
            total_estimated_time=total_time,
            optimization_notes="Tasks organized for maximum parallelization"
        )
    
    def GetStatus(self, request, context):
        """Get orchestrator status"""
        return StatusResponse(
            is_healthy=True,
            active_tasks=len(self.active_tasks),
            registered_agents=len(self.agent_registry),
            uptime_seconds=0,  # Would need to track start time
            last_activity=datetime.now().isoformat()
        )

def serve():
    """Start the gRPC server"""
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    add_GodModeServiceServicer_to_server(GodModeOrchestrator(), server)
    
    port = 50051
    server.add_insecure_port(f'[::]:{port}')
    
    logger.info(f"GodMode Orchestrator gRPC server starting on port {port}")
    server.start()
    
    try:
        server.wait_for_termination()
    except KeyboardInterrupt:
        logger.info("Shutting down GodMode server...")
        server.stop(0)

if __name__ == "__main__":
    serve()