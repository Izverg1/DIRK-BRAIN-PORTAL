"""
Agent Generator - Intelligent agent swarm creation from natural language
"""

import json
from typing import Dict, List, Any
from datetime import datetime
import re

class AgentGenerator:
    def __init__(self):
        self.agent_templates = self.load_templates()
        self.swarm_patterns = self.load_swarm_patterns()
        
    def load_templates(self) -> Dict:
        """Load agent templates for different roles and capabilities"""
        return {
            "developer": {
                "frontend": {
                    "providers": ["claude", "gpt-4"],
                    "skills": ["React", "TypeScript", "UI/UX", "CSS"],
                    "tools": ["claude code", "npm", "webpack"]
                },
                "backend": {
                    "providers": ["claude", "gemini"],
                    "skills": ["Python", "Node.js", "Database", "API"],
                    "tools": ["claude code", "python", "docker"]
                },
                "fullstack": {
                    "providers": ["claude", "gpt-4", "gemini"],
                    "skills": ["Full Stack", "DevOps", "Architecture"],
                    "tools": ["claude code", "git", "docker", "npm"]
                }
            },
            "analyst": {
                "business": {
                    "providers": ["gemini", "gpt-4"],
                    "skills": ["Requirements", "Documentation", "Planning"],
                    "tools": ["gemini analyze", "markdown"]
                },
                "data": {
                    "providers": ["gemini", "claude"],
                    "skills": ["Data Analysis", "ML", "Statistics"],
                    "tools": ["python", "jupyter", "pandas"]
                }
            },
            "tester": {
                "qa": {
                    "providers": ["gemini", "gpt-4"],
                    "skills": ["Testing", "Automation", "Quality"],
                    "tools": ["pytest", "selenium", "jest"]
                },
                "security": {
                    "providers": ["claude", "gpt-4"],
                    "skills": ["Security", "Penetration Testing", "Compliance"],
                    "tools": ["nmap", "burp", "owasp"]
                }
            },
            "creative": {
                "designer": {
                    "providers": ["dall-e", "midjourney", "gemini"],
                    "skills": ["UI Design", "Graphics", "Branding"],
                    "tools": ["figma", "photoshop"]
                },
                "writer": {
                    "providers": ["gpt-4", "claude"],
                    "skills": ["Content", "Documentation", "Marketing"],
                    "tools": ["markdown", "grammarly"]
                }
            }
        }
    
    def load_swarm_patterns(self) -> Dict:
        """Load common swarm patterns for different project types"""
        return {
            "fullstack": {
                "name": "Full Stack Development Swarm",
                "agents": [
                    {"role": "frontend", "count": 2},
                    {"role": "backend", "count": 2},
                    {"role": "qa", "count": 1},
                    {"role": "designer", "count": 1}
                ],
                "coordination": "pipeline"
            },
            "microservice": {
                "name": "Microservice Architecture Swarm",
                "agents": [
                    {"role": "backend", "count": 4},
                    {"role": "devops", "count": 2},
                    {"role": "qa", "count": 2}
                ],
                "coordination": "mesh"
            },
            "data_pipeline": {
                "name": "Data Processing Pipeline",
                "agents": [
                    {"role": "data", "count": 3},
                    {"role": "backend", "count": 2},
                    {"role": "analyst", "count": 1}
                ],
                "coordination": "pipeline"
            },
            "security_audit": {
                "name": "Security Audit Team",
                "agents": [
                    {"role": "security", "count": 3},
                    {"role": "qa", "count": 2},
                    {"role": "analyst", "count": 1}
                ],
                "coordination": "swarm"
            }
        }
    
    def analyze_prompt(self, prompt: str) -> Dict:
        """Analyze natural language prompt to determine agent requirements"""
        prompt_lower = prompt.lower()
        
        # Detect project type
        project_type = "custom"
        if "full stack" in prompt_lower or "fullstack" in prompt_lower:
            project_type = "fullstack"
        elif "microservice" in prompt_lower or "micro service" in prompt_lower:
            project_type = "microservice"
        elif "data" in prompt_lower and ("pipeline" in prompt_lower or "processing" in prompt_lower):
            project_type = "data_pipeline"
        elif "security" in prompt_lower or "audit" in prompt_lower:
            project_type = "security_audit"
        elif "mobile" in prompt_lower or "app" in prompt_lower:
            project_type = "mobile"
        elif "ai" in prompt_lower or "machine learning" in prompt_lower or "ml" in prompt_lower:
            project_type = "ai_ml"
        
        # Detect required capabilities
        capabilities = []
        if "react" in prompt_lower or "frontend" in prompt_lower:
            capabilities.append("frontend")
        if "backend" in prompt_lower or "api" in prompt_lower:
            capabilities.append("backend")
        if "database" in prompt_lower or "sql" in prompt_lower:
            capabilities.append("database")
        if "test" in prompt_lower or "qa" in prompt_lower:
            capabilities.append("testing")
        if "design" in prompt_lower or "ui" in prompt_lower or "ux" in prompt_lower:
            capabilities.append("design")
        if "security" in prompt_lower:
            capabilities.append("security")
        if "deploy" in prompt_lower or "devops" in prompt_lower:
            capabilities.append("devops")
        
        # Detect coordination type
        coordination = "swarm"  # default
        if "pipeline" in prompt_lower or "sequential" in prompt_lower:
            coordination = "pipeline"
        elif "parallel" in prompt_lower or "concurrent" in prompt_lower:
            coordination = "parallel"
        elif "mesh" in prompt_lower or "interconnected" in prompt_lower:
            coordination = "mesh"
        elif "hierarchical" in prompt_lower or "manager" in prompt_lower:
            coordination = "hierarchical"
        
        # Extract numbers if specified
        numbers = re.findall(r'\d+', prompt)
        agent_count = int(numbers[0]) if numbers else None
        
        return {
            "project_type": project_type,
            "capabilities": capabilities,
            "coordination": coordination,
            "agent_count": agent_count,
            "original_prompt": prompt
        }
    
    def generate_agents(self, prompt: str, project_name: str = None) -> Dict:
        """Generate a swarm of agents based on natural language prompt"""
        analysis = self.analyze_prompt(prompt)
        
        # Use predefined pattern if matches
        if analysis["project_type"] in self.swarm_patterns:
            pattern = self.swarm_patterns[analysis["project_type"]]
            agents = self._create_agents_from_pattern(pattern, analysis)
        else:
            # Custom generation based on capabilities
            agents = self._create_custom_agents(analysis)
        
        # Create swarm configuration
        swarm = {
            "id": f"swarm-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
            "name": f"{analysis['project_type'].replace('_', ' ').title()} Swarm",
            "project": project_name,
            "coordination": analysis["coordination"],
            "agents": agents,
            "metadata": {
                "created_at": datetime.now().isoformat(),
                "prompt": prompt,
                "analysis": analysis,
                "total_agents": len(agents)
            }
        }
        
        return swarm
    
    def _create_agents_from_pattern(self, pattern: Dict, analysis: Dict) -> List[Dict]:
        """Create agents based on a predefined pattern"""
        agents = []
        agent_id = 1
        
        for agent_spec in pattern["agents"]:
            role = agent_spec["role"]
            count = agent_spec["count"]
            
            # Override count if specified in prompt
            if analysis["agent_count"]:
                count = min(count, analysis["agent_count"] // len(pattern["agents"]))
            
            for i in range(count):
                agent = self._create_single_agent(role, agent_id, i)
                agents.append(agent)
                agent_id += 1
        
        return agents
    
    def _create_custom_agents(self, analysis: Dict) -> List[Dict]:
        """Create custom agents based on detected capabilities"""
        agents = []
        agent_id = 1
        
        # Default agent count per capability
        agents_per_capability = 2
        if analysis["agent_count"]:
            agents_per_capability = max(1, analysis["agent_count"] // max(len(analysis["capabilities"]), 1))
        
        # Create agents for each capability
        for capability in analysis["capabilities"]:
            # Map capability to role
            role_map = {
                "frontend": "developer.frontend",
                "backend": "developer.backend",
                "database": "developer.backend",
                "testing": "tester.qa",
                "design": "creative.designer",
                "security": "tester.security",
                "devops": "developer.fullstack"
            }
            
            role = role_map.get(capability, "developer.fullstack")
            
            for i in range(agents_per_capability):
                agent = self._create_single_agent(role, agent_id, i)
                agents.append(agent)
                agent_id += 1
        
        # If no specific capabilities detected, create general purpose agents
        if not agents:
            for i in range(analysis["agent_count"] or 3):
                agent = self._create_single_agent("developer.fullstack", agent_id, i)
                agents.append(agent)
                agent_id += 1
        
        return agents
    
    def _create_single_agent(self, role_path: str, agent_id: int, index: int) -> Dict:
        """Create a single agent with specified role"""
        # Parse role path (e.g., "developer.frontend")
        parts = role_path.split(".")
        category = parts[0] if parts else "developer"
        subcategory = parts[1] if len(parts) > 1 else "fullstack"
        
        # Get template
        template = self.agent_templates.get(category, {}).get(subcategory, {})
        
        # Select provider (rotate through available)
        providers = template.get("providers", ["claude"])
        provider = providers[index % len(providers)]
        
        # Determine execution type (CLI vs API)
        execution_type = "cli" if provider in ["claude", "gemini"] else "api"
        
        # Create agent
        agent = {
            "id": f"agent-{agent_id}",
            "name": f"{subcategory.title()}-{agent_id}",
            "role": role_path,
            "provider": provider,
            "execution_type": execution_type,
            "skills": template.get("skills", []),
            "tools": template.get("tools", []),
            "status": "ready",
            "performance_metrics": {
                "tasks_completed": 0,
                "success_rate": 100.0,
                "avg_response_time": 0
            }
        }
        
        # Add model based on provider
        model_map = {
            "claude": "claude-sonnet-4",
            "gemini": "gemini-1.5-pro",
            "gpt-4": "gpt-4-turbo",
            "local": "llama-3"
        }
        agent["model"] = model_map.get(provider, "gpt-4-turbo")
        
        return agent
    
    def deploy_swarm(self, swarm: Dict, deployment_target: str = "local") -> Dict:
        """Deploy the generated swarm to specified target"""
        deployment = {
            "swarm_id": swarm["id"],
            "deployment_id": f"deploy-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
            "target": deployment_target,
            "status": "deploying",
            "agents_deployed": []
        }
        
        # Deploy each agent
        for agent in swarm["agents"]:
            if agent["execution_type"] == "cli":
                # CLI agents are ready immediately
                agent_deployment = {
                    "agent_id": agent["id"],
                    "status": "ready",
                    "endpoint": f"cli://{agent['provider']}"
                }
            else:
                # API agents need endpoint configuration
                agent_deployment = {
                    "agent_id": agent["id"],
                    "status": "configuring",
                    "endpoint": f"http://localhost:8000/agents/{agent['id']}"
                }
            
            deployment["agents_deployed"].append(agent_deployment)
        
        deployment["status"] = "deployed"
        deployment["deployed_at"] = datetime.now().isoformat()
        
        return deployment