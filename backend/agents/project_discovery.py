"""
Project Discovery and Claude Code Sub-Agent Generator
Discovers projects and generates specialized Claude Code agents for each
"""

import os
import json
import asyncio
import subprocess
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from pathlib import Path
import git
from claude_agent import ClaudeAgent, ClaudeAgentPool

@dataclass
class ProjectInfo:
    path: str
    name: str
    type: str  # 'react', 'python', 'node', 'rust', 'go', etc.
    language: str
    framework: Optional[str]
    git_repo: Optional[str]
    git_branch: Optional[str]
    package_files: List[str]
    entry_points: List[str]
    dependencies: Dict[str, str]
    claude_md_exists: bool
    last_modified: float

@dataclass
class SubAgentConfig:
    agent_id: str
    project_path: str
    project_name: str
    specialization: str  # 'frontend', 'backend', 'fullstack', 'devops', etc.
    model: str
    context_files: List[str]
    capabilities: List[str]
    tools_enabled: List[str]

class ProjectDiscovery:
    def __init__(self, base_directories: List[str] = None):
        self.base_directories = base_directories or [
            os.path.expanduser("~/projects"),
            os.path.expanduser("~/dev"),
            os.path.expanduser("~/code"),
            "/Users/izverg/projects"  # Current directory
        ]
        self.discovered_projects: Dict[str, ProjectInfo] = {}
        self.sub_agents: Dict[str, ClaudeAgent] = {}
        self.agent_configs: Dict[str, SubAgentConfig] = {}
    
    def detect_project_type(self, project_path: str) -> tuple[str, str, Optional[str]]:
        """Detect project type, language, and framework"""
        path = Path(project_path)
        
        # Check for various project indicators
        files = [f.name for f in path.iterdir() if f.is_file()]
        
        # React/Next.js projects
        if "package.json" in files:
            try:
                with open(path / "package.json", 'r') as f:
                    package_data = json.load(f)
                    deps = {**package_data.get("dependencies", {}), **package_data.get("devDependencies", {})}
                    
                    if "next" in deps:
                        return "react", "typescript", "nextjs"
                    elif "react" in deps:
                        return "react", "javascript", "react"
                    elif "@vue/cli" in deps or "vue" in deps:
                        return "vue", "javascript", "vue"
                    elif "svelte" in deps:
                        return "svelte", "javascript", "svelte"
                    else:
                        return "node", "javascript", "nodejs"
            except:
                pass
        
        # Python projects
        if any(f in files for f in ["requirements.txt", "pyproject.toml", "setup.py", "Pipfile"]):
            if "manage.py" in files:
                return "python", "python", "django"
            elif "app.py" in files or "main.py" in files:
                return "python", "python", "flask"
            else:
                return "python", "python", "python"
        
        # Rust projects
        if "Cargo.toml" in files:
            return "rust", "rust", "cargo"
        
        # Go projects
        if "go.mod" in files or "go.sum" in files:
            return "go", "go", "go"
        
        # Java projects
        if "pom.xml" in files:
            return "java", "java", "maven"
        elif "build.gradle" in files or "build.gradle.kts" in files:
            return "java", "java", "gradle"
        
        # Default
        return "unknown", "unknown", None
    
    def extract_dependencies(self, project_path: str, project_type: str) -> Dict[str, str]:
        """Extract project dependencies"""
        path = Path(project_path)
        dependencies = {}
        
        try:
            if project_type == "react" or project_type == "node":
                package_json = path / "package.json"
                if package_json.exists():
                    with open(package_json, 'r') as f:
                        data = json.load(f)
                        deps = data.get("dependencies", {})
                        dev_deps = data.get("devDependencies", {})
                        dependencies = {**deps, **dev_deps}
            
            elif project_type == "python":
                # Check requirements.txt
                req_file = path / "requirements.txt"
                if req_file.exists():
                    with open(req_file, 'r') as f:
                        for line in f:
                            line = line.strip()
                            if line and not line.startswith('#'):
                                if '==' in line:
                                    name, version = line.split('==', 1)
                                    dependencies[name] = version
                                else:
                                    dependencies[line] = "latest"
                
                # Check pyproject.toml
                pyproject = path / "pyproject.toml"
                if pyproject.exists():
                    # Simple parsing - would use toml library in production
                    dependencies["pyproject"] = "detected"
            
            elif project_type == "rust":
                cargo_toml = path / "Cargo.toml"
                if cargo_toml.exists():
                    dependencies["cargo"] = "detected"
        
        except Exception as e:
            print(f"Error extracting dependencies from {project_path}: {e}")
        
        return dependencies
    
    def get_git_info(self, project_path: str) -> tuple[Optional[str], Optional[str]]:
        """Get git repository info"""
        try:
            repo = git.Repo(project_path)
            remote_url = None
            if repo.remotes:
                remote_url = repo.remotes.origin.url
            current_branch = repo.active_branch.name
            return remote_url, current_branch
        except:
            return None, None
    
    def scan_directory(self, directory: str) -> List[ProjectInfo]:
        """Scan directory for projects"""
        projects = []
        
        if not os.path.exists(directory):
            return projects
        
        try:
            for item in os.listdir(directory):
                item_path = os.path.join(directory, item)
                if os.path.isdir(item_path) and not item.startswith('.'):
                    # Check if it's a project directory
                    project_type, language, framework = self.detect_project_type(item_path)
                    
                    if project_type != "unknown":
                        # Get git info
                        git_repo, git_branch = self.get_git_info(item_path)
                        
                        # Get dependencies
                        dependencies = self.extract_dependencies(item_path, project_type)
                        
                        # Check for CLAUDE.md
                        claude_md = os.path.exists(os.path.join(item_path, "CLAUDE.md"))
                        
                        # Find package files and entry points
                        package_files = []
                        entry_points = []
                        
                        for file in os.listdir(item_path):
                            if file in ["package.json", "requirements.txt", "Cargo.toml", "go.mod", "pom.xml"]:
                                package_files.append(file)
                            if file in ["main.py", "app.py", "index.js", "main.rs", "main.go"]:
                                entry_points.append(file)
                        
                        project = ProjectInfo(
                            path=item_path,
                            name=item,
                            type=project_type,
                            language=language,
                            framework=framework,
                            git_repo=git_repo,
                            git_branch=git_branch,
                            package_files=package_files,
                            entry_points=entry_points,
                            dependencies=dependencies,
                            claude_md_exists=claude_md,
                            last_modified=os.path.getmtime(item_path)
                        )
                        projects.append(project)
        
        except Exception as e:
            print(f"Error scanning directory {directory}: {e}")
        
        return projects
    
    def discover_all_projects(self) -> Dict[str, ProjectInfo]:
        """Discover all projects in base directories"""
        all_projects = {}
        
        for directory in self.base_directories:
            if os.path.exists(directory):
                projects = self.scan_directory(directory)
                for project in projects:
                    all_projects[project.name] = project
        
        self.discovered_projects = all_projects
        return all_projects
    
    def generate_sub_agent_config(self, project: ProjectInfo) -> SubAgentConfig:
        """Generate Claude Code sub-agent configuration for project"""
        agent_id = f"claude-code-{project.name.lower().replace(' ', '-')}"
        
        # Determine specialization based on project type
        if project.type == "react" and project.framework == "nextjs":
            specialization = "fullstack"
            capabilities = ["react", "nextjs", "typescript", "frontend", "api"]
            tools_enabled = ["filesystem", "bash", "web_search", "artifacts"]
        elif project.type == "react":
            specialization = "frontend"
            capabilities = ["react", "javascript", "css", "frontend"]
            tools_enabled = ["filesystem", "bash", "artifacts"]
        elif project.type == "python":
            if project.framework == "django":
                specialization = "backend"
                capabilities = ["django", "python", "database", "api"]
            elif project.framework == "flask":
                specialization = "backend"
                capabilities = ["flask", "python", "api"]
            else:
                specialization = "backend"
                capabilities = ["python", "scripting"]
            tools_enabled = ["filesystem", "bash", "repl"]
        elif project.type == "rust":
            specialization = "systems"
            capabilities = ["rust", "performance", "systems"]
            tools_enabled = ["filesystem", "bash"]
        else:
            specialization = "general"
            capabilities = [project.language, project.type]
            tools_enabled = ["filesystem", "bash"]
        
        # Context files to include
        context_files = []
        if project.claude_md_exists:
            context_files.append("CLAUDE.md")
        context_files.extend(project.package_files)
        context_files.append("README.md")  # If exists
        
        return SubAgentConfig(
            agent_id=agent_id,
            project_path=project.path,
            project_name=project.name,
            specialization=specialization,
            model="claude-3-5-sonnet-20241022",  # Best model for coding
            context_files=context_files,
            capabilities=capabilities,
            tools_enabled=tools_enabled
        )
    
    async def deploy_sub_agent(self, project: ProjectInfo, api_key: str) -> Optional[ClaudeAgent]:
        """Deploy a specialized Claude Code sub-agent for project"""
        config = self.generate_sub_agent_config(project)
        
        # Create specialized Claude agent
        agent = ClaudeAgent(config.agent_id, config.model)
        
        # Initialize with API key
        if not agent.initialize(api_key):
            return None
        
        # Store configuration
        self.agent_configs[config.agent_id] = config
        self.sub_agents[config.agent_id] = agent
        
        # Create initial context prompt
        context_prompt = self.build_context_prompt(project, config)
        
        # Send context to agent
        try:
            await agent.execute_task(
                f"{config.agent_id}-context",
                context_prompt,
                max_tokens=1000
            )
        except Exception as e:
            print(f"Failed to set context for agent {config.agent_id}: {e}")
        
        return agent
    
    def build_context_prompt(self, project: ProjectInfo, config: SubAgentConfig) -> str:
        """Build context prompt for sub-agent"""
        context = f"""You are a specialized Claude Code agent for the project "{project.name}".

Project Details:
- Path: {project.path}
- Type: {project.type}
- Language: {project.language}
- Framework: {project.framework or 'None'}
- Specialization: {config.specialization}

Your capabilities include: {', '.join(config.capabilities)}
You have access to these tools: {', '.join(config.tools_enabled)}

Project structure includes:
- Package files: {', '.join(project.package_files)}
- Entry points: {', '.join(project.entry_points)}
- CLAUDE.md exists: {project.claude_md_exists}

Dependencies: {json.dumps(project.dependencies, indent=2)}

You are ready to assist with development tasks for this project. Always consider the project context and use appropriate tools for the task."""
        
        return context
    
    async def deploy_all_agents(self, api_key: str) -> Dict[str, bool]:
        """Deploy sub-agents for all discovered projects"""
        deployment_results = {}
        
        for project_name, project in self.discovered_projects.items():
            try:
                agent = await self.deploy_sub_agent(project, api_key)
                deployment_results[project_name] = agent is not None
            except Exception as e:
                print(f"Failed to deploy agent for {project_name}: {e}")
                deployment_results[project_name] = False
        
        return deployment_results
    
    def get_project_status(self) -> Dict[str, Any]:
        """Get status of all projects and their agents"""
        return {
            "discovered_projects": len(self.discovered_projects),
            "deployed_agents": len(self.sub_agents),
            "projects": {name: asdict(project) for name, project in self.discovered_projects.items()},
            "agents": {aid: agent.get_status() for aid, agent in self.sub_agents.items()},
            "configurations": {aid: asdict(config) for aid, config in self.agent_configs.items()}
        }


# Global project discovery instance
project_discovery = ProjectDiscovery()