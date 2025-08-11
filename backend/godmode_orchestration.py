"""
GodMode Orchestration System - Advanced Task Decomposition and Agent Routing
Implements intelligent task breakdown, agent selection, and execution orchestration
"""

import asyncio
import json
import logging
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
from enum import Enum
import hashlib
from dataclasses import dataclass, field
from collections import defaultdict
import re

logger = logging.getLogger(__name__)

class TaskType(Enum):
    """Task type classification for intelligent routing"""
    CODE_GENERATION = "code_generation"
    CODE_REVIEW = "code_review"
    ANALYSIS = "analysis"
    TESTING = "testing"
    DOCUMENTATION = "documentation"
    DEPLOYMENT = "deployment"
    OPTIMIZATION = "optimization"
    SECURITY = "security"
    DATA_PROCESSING = "data_processing"
    RESEARCH = "research"
    DESIGN = "design"
    DEBUGGING = "debugging"

class AgentCapability(Enum):
    """Agent capabilities for matching"""
    CODING = "coding"
    ANALYSIS = "analysis"
    TESTING = "testing"
    WRITING = "writing"
    DEPLOYMENT = "deployment"
    SECURITY = "security"
    DATA = "data"
    RESEARCH = "research"
    DESIGN = "design"
    DEBUGGING = "debugging"

@dataclass
class Task:
    """Represents a decomposed task"""
    id: str
    type: TaskType
    description: str
    requirements: List[str]
    dependencies: List[str] = field(default_factory=list)
    priority: int = 5
    estimated_complexity: int = 5
    required_capabilities: List[AgentCapability] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    status: str = "pending"
    assigned_agents: List[str] = field(default_factory=list)
    result: Optional[Dict[str, Any]] = None
    created_at: datetime = field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None

@dataclass
class AgentProfile:
    """Agent profile with capabilities and performance metrics"""
    id: str
    name: str
    provider: str
    capabilities: List[AgentCapability]
    specialties: List[TaskType]
    performance_score: float = 0.85
    availability: bool = True
    current_load: int = 0
    max_concurrent_tasks: int = 3
    success_rate: float = 0.95
    average_completion_time: float = 30.0  # seconds
    metadata: Dict[str, Any] = field(default_factory=dict)

class GodModeOrchestrator:
    """
    Advanced orchestration system for intelligent task management
    """
    
    def __init__(self):
        self.tasks: Dict[str, Task] = {}
        self.agents: Dict[str, AgentProfile] = {}
        self.task_queue: List[Task] = []
        self.execution_history: List[Dict[str, Any]] = []
        self.consensus_threshold = 0.7
        self.initialize_default_agents()
        
    def initialize_default_agents(self):
        """Initialize default agent profiles"""
        default_agents = [
            AgentProfile(
                id="claude-opus",
                name="Claude Opus",
                provider="anthropic",
                capabilities=[AgentCapability.CODING, AgentCapability.ANALYSIS, AgentCapability.DEBUGGING],
                specialties=[TaskType.CODE_GENERATION, TaskType.CODE_REVIEW, TaskType.DEBUGGING],
                performance_score=0.95
            ),
            AgentProfile(
                id="gemini-pro",
                name="Gemini Pro",
                provider="google",
                capabilities=[AgentCapability.ANALYSIS, AgentCapability.DATA, AgentCapability.RESEARCH],
                specialties=[TaskType.ANALYSIS, TaskType.DATA_PROCESSING, TaskType.RESEARCH],
                performance_score=0.90
            ),
            AgentProfile(
                id="gpt-4-turbo",
                name="GPT-4 Turbo",
                provider="openai",
                capabilities=[AgentCapability.WRITING, AgentCapability.DESIGN, AgentCapability.CODING],
                specialties=[TaskType.DOCUMENTATION, TaskType.DESIGN, TaskType.CODE_GENERATION],
                performance_score=0.88
            ),
            AgentProfile(
                id="local-tester",
                name="Local Test Runner",
                provider="local",
                capabilities=[AgentCapability.TESTING, AgentCapability.DEBUGGING],
                specialties=[TaskType.TESTING, TaskType.DEBUGGING],
                performance_score=0.85
            ),
            AgentProfile(
                id="security-scanner",
                name="Security Scanner",
                provider="local",
                capabilities=[AgentCapability.SECURITY, AgentCapability.ANALYSIS],
                specialties=[TaskType.SECURITY, TaskType.ANALYSIS],
                performance_score=0.92
            )
        ]
        
        for agent in default_agents:
            self.agents[agent.id] = agent
    
    async def decompose_task(self, request: str, context: Dict[str, Any] = None) -> List[Task]:
        """
        Decompose a high-level request into executable tasks
        """
        context = context or {}
        tasks = []
        
        # Analyze request to identify task types
        task_patterns = {
            TaskType.CODE_GENERATION: r"(create|build|implement|develop|write.*code)",
            TaskType.CODE_REVIEW: r"(review|check|audit|inspect.*code)",
            TaskType.ANALYSIS: r"(analyze|investigate|examine|study)",
            TaskType.TESTING: r"(test|verify|validate|check)",
            TaskType.DOCUMENTATION: r"(document|write.*docs|explain|describe)",
            TaskType.DEPLOYMENT: r"(deploy|release|publish|launch)",
            TaskType.OPTIMIZATION: r"(optimize|improve|enhance|speed up)",
            TaskType.SECURITY: r"(secure|scan|vulnerability|security)",
            TaskType.DATA_PROCESSING: r"(process|transform|extract|data)",
            TaskType.RESEARCH: r"(research|find|discover|explore)",
            TaskType.DESIGN: r"(design|architect|plan|structure)",
            TaskType.DEBUGGING: r"(debug|fix|troubleshoot|solve)"
        }
        
        request_lower = request.lower()
        identified_types = []
        
        for task_type, pattern in task_patterns.items():
            if re.search(pattern, request_lower):
                identified_types.append(task_type)
        
        # If no specific type identified, use analysis as default
        if not identified_types:
            identified_types = [TaskType.ANALYSIS]
        
        # Create tasks based on identified types
        for i, task_type in enumerate(identified_types):
            task_id = self.generate_task_id(request, i)
            
            # Determine required capabilities
            capability_map = {
                TaskType.CODE_GENERATION: [AgentCapability.CODING],
                TaskType.CODE_REVIEW: [AgentCapability.CODING, AgentCapability.ANALYSIS],
                TaskType.ANALYSIS: [AgentCapability.ANALYSIS],
                TaskType.TESTING: [AgentCapability.TESTING],
                TaskType.DOCUMENTATION: [AgentCapability.WRITING],
                TaskType.DEPLOYMENT: [AgentCapability.DEPLOYMENT],
                TaskType.OPTIMIZATION: [AgentCapability.CODING, AgentCapability.ANALYSIS],
                TaskType.SECURITY: [AgentCapability.SECURITY],
                TaskType.DATA_PROCESSING: [AgentCapability.DATA],
                TaskType.RESEARCH: [AgentCapability.RESEARCH],
                TaskType.DESIGN: [AgentCapability.DESIGN],
                TaskType.DEBUGGING: [AgentCapability.DEBUGGING, AgentCapability.CODING]
            }
            
            task = Task(
                id=task_id,
                type=task_type,
                description=f"{task_type.value}: {request}",
                requirements=self.extract_requirements(request, task_type),
                priority=self.calculate_priority(task_type, context),
                estimated_complexity=self.estimate_complexity(request, task_type),
                required_capabilities=capability_map.get(task_type, []),
                metadata={
                    "original_request": request,
                    "context": context,
                    "decomposition_timestamp": datetime.now().isoformat()
                }
            )
            
            tasks.append(task)
            self.tasks[task_id] = task
        
        # Identify dependencies between tasks
        self.identify_dependencies(tasks)
        
        return tasks
    
    def generate_task_id(self, request: str, index: int) -> str:
        """Generate unique task ID"""
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        hash_input = f"{request}{index}{timestamp}"
        task_hash = hashlib.md5(hash_input.encode()).hexdigest()[:8]
        return f"task-{timestamp}-{task_hash}"
    
    def extract_requirements(self, request: str, task_type: TaskType) -> List[str]:
        """Extract specific requirements from request"""
        requirements = []
        
        # Language/framework detection
        languages = ["python", "javascript", "typescript", "java", "go", "rust", "c++"]
        frameworks = ["react", "vue", "angular", "django", "fastapi", "spring", "express"]
        
        request_lower = request.lower()
        
        for lang in languages:
            if lang in request_lower:
                requirements.append(f"language:{lang}")
        
        for framework in frameworks:
            if framework in request_lower:
                requirements.append(f"framework:{framework}")
        
        # Task-specific requirements
        if task_type == TaskType.TESTING:
            requirements.append("testing:unit")
            requirements.append("testing:integration")
        elif task_type == TaskType.SECURITY:
            requirements.append("security:vulnerability_scan")
            requirements.append("security:compliance_check")
        elif task_type == TaskType.DEPLOYMENT:
            requirements.append("deployment:containerization")
            requirements.append("deployment:ci_cd")
        
        return requirements
    
    def calculate_priority(self, task_type: TaskType, context: Dict[str, Any]) -> int:
        """Calculate task priority (1-10)"""
        base_priority = 5
        
        # Adjust based on task type
        priority_adjustments = {
            TaskType.SECURITY: 3,
            TaskType.DEBUGGING: 2,
            TaskType.DEPLOYMENT: 1,
            TaskType.TESTING: 1,
            TaskType.OPTIMIZATION: 0,
            TaskType.CODE_GENERATION: 0,
            TaskType.CODE_REVIEW: 0,
            TaskType.ANALYSIS: 0,
            TaskType.DOCUMENTATION: -1,
            TaskType.RESEARCH: -1,
            TaskType.DESIGN: -1,
            TaskType.DATA_PROCESSING: -1
        }
        
        priority = base_priority + priority_adjustments.get(task_type, 0)
        
        # Adjust based on context
        if context.get("urgent"):
            priority += 2
        if context.get("blocking"):
            priority += 3
        
        return max(1, min(10, priority))
    
    def estimate_complexity(self, request: str, task_type: TaskType) -> int:
        """Estimate task complexity (1-10)"""
        # Simple heuristic based on request length and keywords
        complexity = min(10, len(request) // 50 + 1)
        
        # Adjust based on task type
        complexity_adjustments = {
            TaskType.CODE_GENERATION: 2,
            TaskType.DEBUGGING: 3,
            TaskType.SECURITY: 2,
            TaskType.OPTIMIZATION: 3,
            TaskType.DESIGN: 2,
            TaskType.DEPLOYMENT: 1,
            TaskType.TESTING: 1,
            TaskType.ANALYSIS: 1,
            TaskType.DOCUMENTATION: 0,
            TaskType.RESEARCH: 1,
            TaskType.CODE_REVIEW: 1,
            TaskType.DATA_PROCESSING: 1
        }
        
        complexity += complexity_adjustments.get(task_type, 0)
        
        # Check for complex keywords
        complex_keywords = ["distributed", "scalable", "concurrent", "parallel", 
                          "machine learning", "ai", "blockchain", "microservices"]
        
        request_lower = request.lower()
        for keyword in complex_keywords:
            if keyword in request_lower:
                complexity += 1
        
        return max(1, min(10, complexity))
    
    def identify_dependencies(self, tasks: List[Task]):
        """Identify dependencies between tasks"""
        # Simple dependency rules
        for i, task in enumerate(tasks):
            for j, other_task in enumerate(tasks):
                if i != j:
                    # Testing depends on code generation
                    if task.type == TaskType.TESTING and other_task.type == TaskType.CODE_GENERATION:
                        task.dependencies.append(other_task.id)
                    
                    # Deployment depends on testing
                    elif task.type == TaskType.DEPLOYMENT and other_task.type == TaskType.TESTING:
                        task.dependencies.append(other_task.id)
                    
                    # Documentation can depend on code generation
                    elif task.type == TaskType.DOCUMENTATION and other_task.type == TaskType.CODE_GENERATION:
                        task.dependencies.append(other_task.id)
                    
                    # Code review depends on code generation
                    elif task.type == TaskType.CODE_REVIEW and other_task.type == TaskType.CODE_GENERATION:
                        task.dependencies.append(other_task.id)
    
    async def select_agents(self, task: Task) -> List[AgentProfile]:
        """Select best agents for a task"""
        suitable_agents = []
        
        for agent in self.agents.values():
            # Check availability
            if not agent.availability or agent.current_load >= agent.max_concurrent_tasks:
                continue
            
            # Check capabilities match
            capability_match = any(cap in agent.capabilities for cap in task.required_capabilities)
            
            # Check specialty match
            specialty_match = task.type in agent.specialties
            
            # Calculate suitability score
            score = 0.0
            if specialty_match:
                score += 0.5
            if capability_match:
                score += 0.3
            score += agent.performance_score * 0.2
            
            if score > 0.5:
                suitable_agents.append((agent, score))
        
        # Sort by score and select top agents
        suitable_agents.sort(key=lambda x: x[1], reverse=True)
        
        # Determine number of agents based on complexity
        num_agents = 1
        if task.estimated_complexity > 7:
            num_agents = 3
        elif task.estimated_complexity > 4:
            num_agents = 2
        
        selected = [agent for agent, _ in suitable_agents[:num_agents]]
        
        # Update agent assignments
        for agent in selected:
            agent.current_load += 1
            task.assigned_agents.append(agent.id)
        
        return selected
    
    async def execute_task(self, task: Task, agents: List[AgentProfile]) -> Dict[str, Any]:
        """Execute a task with selected agents"""
        task.status = "executing"
        execution_start = datetime.now()
        
        try:
            # Simulate task execution based on type
            if task.type == TaskType.CODE_GENERATION:
                result = await self.execute_code_generation(task, agents)
            elif task.type == TaskType.CODE_REVIEW:
                result = await self.execute_code_review(task, agents)
            elif task.type == TaskType.ANALYSIS:
                result = await self.execute_analysis(task, agents)
            elif task.type == TaskType.TESTING:
                result = await self.execute_testing(task, agents)
            else:
                result = await self.execute_generic(task, agents)
            
            task.status = "completed"
            task.completed_at = datetime.now()
            task.result = result
            
            # Update agent load
            for agent_id in task.assigned_agents:
                if agent_id in self.agents:
                    self.agents[agent_id].current_load -= 1
            
            return {
                "success": True,
                "task_id": task.id,
                "result": result,
                "execution_time": (datetime.now() - execution_start).total_seconds(),
                "agents_used": [agent.id for agent in agents]
            }
            
        except Exception as e:
            task.status = "failed"
            logger.error(f"Task execution failed: {e}")
            
            # Update agent load
            for agent_id in task.assigned_agents:
                if agent_id in self.agents:
                    self.agents[agent_id].current_load -= 1
            
            return {
                "success": False,
                "task_id": task.id,
                "error": str(e),
                "execution_time": (datetime.now() - execution_start).total_seconds()
            }
    
    async def execute_code_generation(self, task: Task, agents: List[AgentProfile]) -> Dict[str, Any]:
        """Execute code generation task"""
        # Simulate code generation
        await asyncio.sleep(0.5)  # Simulate processing time
        
        return {
            "generated_code": f"# Generated code for: {task.description}\n\ndef generated_function():\n    pass",
            "language": "python",
            "lines_of_code": 4,
            "agents_consensus": len(agents) > 1
        }
    
    async def execute_code_review(self, task: Task, agents: List[AgentProfile]) -> Dict[str, Any]:
        """Execute code review task"""
        await asyncio.sleep(0.3)
        
        return {
            "review_results": {
                "issues_found": 2,
                "suggestions": ["Add type hints", "Improve error handling"],
                "security_concerns": [],
                "performance_notes": ["Consider caching results"]
            },
            "review_score": 8.5,
            "agents_consensus": len(agents) > 1
        }
    
    async def execute_analysis(self, task: Task, agents: List[AgentProfile]) -> Dict[str, Any]:
        """Execute analysis task"""
        await asyncio.sleep(0.4)
        
        return {
            "analysis": {
                "summary": f"Analysis of: {task.description}",
                "key_findings": ["Finding 1", "Finding 2", "Finding 3"],
                "recommendations": ["Recommendation 1", "Recommendation 2"],
                "confidence_score": 0.85
            },
            "agents_consensus": len(agents) > 1
        }
    
    async def execute_testing(self, task: Task, agents: List[AgentProfile]) -> Dict[str, Any]:
        """Execute testing task"""
        await asyncio.sleep(0.6)
        
        return {
            "test_results": {
                "total_tests": 10,
                "passed": 9,
                "failed": 1,
                "coverage": 85.5,
                "failed_tests": ["test_edge_case"]
            },
            "agents_consensus": len(agents) > 1
        }
    
    async def execute_generic(self, task: Task, agents: List[AgentProfile]) -> Dict[str, Any]:
        """Execute generic task"""
        await asyncio.sleep(0.3)
        
        return {
            "status": "completed",
            "output": f"Task completed: {task.description}",
            "agents_used": len(agents)
        }
    
    async def execute_workflow(self, request: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Execute complete workflow from request to results"""
        workflow_id = f"workflow-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        workflow_start = datetime.now()
        
        try:
            # Step 1: Decompose task
            tasks = await self.decompose_task(request, context)
            
            # Step 2: Order tasks by dependencies and priority
            ordered_tasks = self.order_tasks_by_dependencies(tasks)
            
            # Step 3: Execute tasks
            results = []
            for task in ordered_tasks:
                # Select agents
                agents = await self.select_agents(task)
                
                if not agents:
                    logger.warning(f"No suitable agents found for task {task.id}")
                    continue
                
                # Execute task
                result = await self.execute_task(task, agents)
                results.append(result)
                
                # If task failed and it's critical, stop workflow
                if not result["success"] and task.priority >= 8:
                    logger.error(f"Critical task {task.id} failed, stopping workflow")
                    break
            
            # Step 4: Aggregate results
            aggregated_results = self.aggregate_results(results)
            
            # Record execution history
            execution_record = {
                "workflow_id": workflow_id,
                "request": request,
                "context": context,
                "tasks_created": len(tasks),
                "tasks_completed": sum(1 for r in results if r["success"]),
                "total_execution_time": (datetime.now() - workflow_start).total_seconds(),
                "timestamp": datetime.now().isoformat(),
                "results": aggregated_results
            }
            
            self.execution_history.append(execution_record)
            
            return {
                "success": True,
                "workflow_id": workflow_id,
                "tasks": [self.task_to_dict(t) for t in tasks],
                "results": aggregated_results,
                "execution_time": execution_record["total_execution_time"]
            }
            
        except Exception as e:
            logger.error(f"Workflow execution failed: {e}")
            return {
                "success": False,
                "workflow_id": workflow_id,
                "error": str(e),
                "execution_time": (datetime.now() - workflow_start).total_seconds()
            }
    
    def order_tasks_by_dependencies(self, tasks: List[Task]) -> List[Task]:
        """Order tasks respecting dependencies"""
        ordered = []
        remaining = tasks.copy()
        completed_ids = set()
        
        while remaining:
            # Find tasks with no pending dependencies
            ready_tasks = []
            for task in remaining:
                if all(dep_id in completed_ids for dep_id in task.dependencies):
                    ready_tasks.append(task)
            
            if not ready_tasks:
                # Circular dependency or all remaining tasks have unmet dependencies
                logger.warning("Circular dependency detected or unmet dependencies")
                ordered.extend(remaining)
                break
            
            # Sort ready tasks by priority
            ready_tasks.sort(key=lambda t: t.priority, reverse=True)
            
            # Add highest priority task to ordered list
            next_task = ready_tasks[0]
            ordered.append(next_task)
            completed_ids.add(next_task.id)
            remaining.remove(next_task)
        
        return ordered
    
    def aggregate_results(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Aggregate results from multiple task executions"""
        aggregated = {
            "total_tasks": len(results),
            "successful_tasks": sum(1 for r in results if r["success"]),
            "failed_tasks": sum(1 for r in results if not r["success"]),
            "total_execution_time": sum(r.get("execution_time", 0) for r in results),
            "task_results": results,
            "summary": {}
        }
        
        # Aggregate specific result types
        for result in results:
            if result["success"] and "result" in result:
                task_result = result["result"]
                
                # Aggregate code generation results
                if "generated_code" in task_result:
                    if "generated_code" not in aggregated["summary"]:
                        aggregated["summary"]["generated_code"] = []
                    aggregated["summary"]["generated_code"].append(task_result["generated_code"])
                
                # Aggregate analysis results
                if "analysis" in task_result:
                    if "analyses" not in aggregated["summary"]:
                        aggregated["summary"]["analyses"] = []
                    aggregated["summary"]["analyses"].append(task_result["analysis"])
                
                # Aggregate test results
                if "test_results" in task_result:
                    if "test_results" not in aggregated["summary"]:
                        aggregated["summary"]["test_results"] = []
                    aggregated["summary"]["test_results"].append(task_result["test_results"])
        
        return aggregated
    
    def task_to_dict(self, task: Task) -> Dict[str, Any]:
        """Convert task to dictionary"""
        return {
            "id": task.id,
            "type": task.type.value,
            "description": task.description,
            "status": task.status,
            "priority": task.priority,
            "complexity": task.estimated_complexity,
            "dependencies": task.dependencies,
            "assigned_agents": task.assigned_agents,
            "created_at": task.created_at.isoformat(),
            "completed_at": task.completed_at.isoformat() if task.completed_at else None
        }
    
    async def get_consensus(self, agent_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Achieve consensus among multiple agent results"""
        if len(agent_results) <= 1:
            return agent_results[0] if agent_results else {}
        
        # Simple voting mechanism for consensus
        consensus_result = {}
        
        # Count agreements on each result aspect
        vote_counts = defaultdict(lambda: defaultdict(int))
        
        for result in agent_results:
            for key, value in result.items():
                if isinstance(value, (str, int, float, bool)):
                    vote_counts[key][str(value)] += 1
        
        # Select majority vote for each aspect
        for key, votes in vote_counts.items():
            if votes:
                # Get the value with most votes
                majority_value = max(votes.items(), key=lambda x: x[1])
                consensus_result[key] = majority_value[0]
                
                # Calculate consensus strength
                total_votes = sum(votes.values())
                consensus_strength = majority_value[1] / total_votes
                consensus_result[f"{key}_consensus"] = consensus_strength
        
        consensus_result["consensus_achieved"] = all(
            consensus_result.get(f"{k}_consensus", 0) >= self.consensus_threshold 
            for k in consensus_result.keys() 
            if not k.endswith("_consensus")
        )
        
        return consensus_result
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get orchestrator metrics"""
        return {
            "total_tasks": len(self.tasks),
            "pending_tasks": sum(1 for t in self.tasks.values() if t.status == "pending"),
            "executing_tasks": sum(1 for t in self.tasks.values() if t.status == "executing"),
            "completed_tasks": sum(1 for t in self.tasks.values() if t.status == "completed"),
            "failed_tasks": sum(1 for t in self.tasks.values() if t.status == "failed"),
            "total_agents": len(self.agents),
            "available_agents": sum(1 for a in self.agents.values() if a.availability),
            "busy_agents": sum(1 for a in self.agents.values() if a.current_load > 0),
            "workflows_executed": len(self.execution_history),
            "average_workflow_time": sum(e["total_execution_time"] for e in self.execution_history) / len(self.execution_history) if self.execution_history else 0
        }

# Global instance
godmode_orchestrator = GodModeOrchestrator()