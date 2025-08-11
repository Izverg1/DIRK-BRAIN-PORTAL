"""
Project Manager - Handles project discovery and management
Supports local filesystem, GitHub, and other sources
"""

import os
import json
import asyncio
import aiohttp
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
from pathlib import Path

logger = logging.getLogger(__name__)

class ProjectManager:
    """Manages project discovery from multiple sources"""
    
    def __init__(self):
        self.projects_cache = {}
        self.sources = []
        self.last_scan = None
        
    async def discover_projects(self, sources: List[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Discover projects from configured sources"""
        if sources:
            self.sources = sources
        
        all_projects = []
        
        for source in self.sources:
            if not source.get("enabled", True):
                continue
            
            source_type = source.get("type", "local")
            
            if source_type == "local":
                projects = await self.discover_local_projects(source)
                all_projects.extend(projects)
            elif source_type == "github":
                projects = await self.discover_github_projects(source)
                all_projects.extend(projects)
            elif source_type == "gitlab":
                projects = await self.discover_gitlab_projects(source)
                all_projects.extend(projects)
            elif source_type == "remote":
                projects = await self.discover_remote_projects(source)
                all_projects.extend(projects)
        
        # Update cache
        self.projects_cache = {p["id"]: p for p in all_projects}
        self.last_scan = datetime.now().isoformat()
        
        return all_projects
    
    async def discover_local_projects(self, source: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Discover projects from local filesystem"""
        path = os.path.expanduser(source.get("path", "~/projects"))
        projects = []
        
        if not os.path.exists(path):
            logger.warning(f"Local path does not exist: {path}")
            return projects
        
        try:
            for item in os.listdir(path):
                item_path = os.path.join(path, item)
                
                # Skip hidden directories and non-directories
                if item.startswith('.') or not os.path.isdir(item_path):
                    continue
                
                # Detect project type
                project_info = self.analyze_local_project(item_path)
                
                if project_info:
                    projects.append({
                        "id": item.lower().replace(" ", "_").replace("-", "_"),
                        "name": item,
                        "path": item_path,
                        "source": source.get("name", "Local"),
                        "source_type": "local",
                        **project_info
                    })
            
            logger.info(f"Discovered {len(projects)} local projects in {path}")
            
        except Exception as e:
            logger.error(f"Error discovering local projects: {e}")
        
        return projects
    
    def analyze_local_project(self, path: str) -> Optional[Dict[str, Any]]:
        """Analyze a local directory to determine if it's a project"""
        project_info = {
            "status": "unknown",
            "type": "generic",
            "technologies": [],
            "has_git": False,
            "last_modified": None
        }
        
        # Check for version control
        if os.path.exists(os.path.join(path, ".git")):
            project_info["has_git"] = True
            project_info["status"] = "active"
            
            # Try to get last commit date
            try:
                import subprocess
                result = subprocess.run(
                    ["git", "log", "-1", "--format=%ai"],
                    cwd=path,
                    capture_output=True,
                    text=True
                )
                if result.returncode == 0:
                    project_info["last_modified"] = result.stdout.strip()
            except:
                pass
        
        # Detect project type and technologies
        files = os.listdir(path)
        
        # Node.js/JavaScript project
        if "package.json" in files:
            project_info["type"] = "nodejs"
            project_info["technologies"].append("JavaScript")
            
            # Read package.json for more info
            try:
                with open(os.path.join(path, "package.json"), 'r') as f:
                    pkg = json.load(f)
                    
                    # Detect frameworks
                    deps = {**pkg.get("dependencies", {}), **pkg.get("devDependencies", {})}
                    
                    if "react" in deps:
                        project_info["technologies"].append("React")
                    if "next" in deps:
                        project_info["technologies"].append("Next.js")
                    if "vue" in deps:
                        project_info["technologies"].append("Vue")
                    if "angular" in deps:
                        project_info["technologies"].append("Angular")
                    if "express" in deps:
                        project_info["technologies"].append("Express")
                    if "fastify" in deps:
                        project_info["technologies"].append("Fastify")
                    
                    project_info["description"] = pkg.get("description", "")
                    project_info["version"] = pkg.get("version", "")
                    
            except Exception as e:
                logger.debug(f"Could not read package.json: {e}")
        
        # Python project
        if "requirements.txt" in files or "setup.py" in files or "pyproject.toml" in files:
            project_info["type"] = "python"
            project_info["technologies"].append("Python")
            
            # Check for specific frameworks
            req_file = os.path.join(path, "requirements.txt")
            if os.path.exists(req_file):
                try:
                    with open(req_file, 'r') as f:
                        requirements = f.read().lower()
                        
                        if "django" in requirements:
                            project_info["technologies"].append("Django")
                        if "flask" in requirements:
                            project_info["technologies"].append("Flask")
                        if "fastapi" in requirements:
                            project_info["technologies"].append("FastAPI")
                        if "tensorflow" in requirements or "torch" in requirements:
                            project_info["technologies"].append("ML/AI")
                            
                except:
                    pass
        
        # Go project
        if "go.mod" in files:
            project_info["type"] = "go"
            project_info["technologies"].append("Go")
        
        # Rust project
        if "Cargo.toml" in files:
            project_info["type"] = "rust"
            project_info["technologies"].append("Rust")
        
        # Java project
        if "pom.xml" in files or "build.gradle" in files:
            project_info["type"] = "java"
            project_info["technologies"].append("Java")
            
            if "pom.xml" in files:
                project_info["technologies"].append("Maven")
            if "build.gradle" in files:
                project_info["technologies"].append("Gradle")
        
        # Docker project
        if "Dockerfile" in files or "docker-compose.yml" in files:
            project_info["technologies"].append("Docker")
            project_info["has_docker"] = True
        
        # Kubernetes
        if any(f.endswith((".yaml", ".yml")) and "kubernetes" in f.lower() for f in files):
            project_info["technologies"].append("Kubernetes")
        
        # Only return if it's actually a project
        if project_info["has_git"] or project_info["type"] != "generic":
            return project_info
        
        return None
    
    async def discover_github_projects(self, source: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Discover projects from GitHub"""
        projects = []
        api_key = source.get("api_key", "")
        username = source.get("username", "")
        org = source.get("organization", "")
        
        if not (username or org):
            logger.warning("GitHub source requires username or organization")
            return projects
        
        headers = {
            "Accept": "application/vnd.github.v3+json"
        }
        
        if api_key:
            headers["Authorization"] = f"token {api_key}"
        
        try:
            async with aiohttp.ClientSession() as session:
                # Determine endpoint
                if org:
                    url = f"https://api.github.com/orgs/{org}/repos"
                else:
                    url = f"https://api.github.com/users/{username}/repos"
                
                async with session.get(url, headers=headers) as response:
                    if response.status == 200:
                        repos = await response.json()
                        
                        for repo in repos:
                            # Extract technologies from language
                            technologies = []
                            if repo.get("language"):
                                technologies.append(repo["language"])
                            
                            projects.append({
                                "id": repo["name"].lower().replace("-", "_"),
                                "name": repo["name"],
                                "path": repo["clone_url"],
                                "source": "GitHub",
                                "source_type": "github",
                                "status": "active" if not repo.get("archived") else "archived",
                                "type": "github",
                                "technologies": technologies,
                                "description": repo.get("description", ""),
                                "url": repo["html_url"],
                                "stars": repo.get("stargazers_count", 0),
                                "forks": repo.get("forks_count", 0),
                                "last_modified": repo.get("updated_at"),
                                "private": repo.get("private", False)
                            })
                        
                        logger.info(f"Discovered {len(projects)} GitHub projects")
                    else:
                        logger.error(f"GitHub API error: {response.status}")
                        
        except Exception as e:
            logger.error(f"Error discovering GitHub projects: {e}")
        
        return projects
    
    async def discover_gitlab_projects(self, source: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Discover projects from GitLab"""
        projects = []
        api_key = source.get("api_key", "")
        base_url = source.get("url", "https://gitlab.com")
        username = source.get("username", "")
        
        if not username:
            logger.warning("GitLab source requires username")
            return projects
        
        headers = {}
        if api_key:
            headers["PRIVATE-TOKEN"] = api_key
        
        try:
            async with aiohttp.ClientSession() as session:
                url = f"{base_url}/api/v4/users/{username}/projects"
                
                async with session.get(url, headers=headers) as response:
                    if response.status == 200:
                        repos = await response.json()
                        
                        for repo in repos:
                            projects.append({
                                "id": repo["path"].lower().replace("-", "_"),
                                "name": repo["name"],
                                "path": repo["ssh_url_to_repo"],
                                "source": "GitLab",
                                "source_type": "gitlab",
                                "status": "active",
                                "type": "gitlab",
                                "description": repo.get("description", ""),
                                "url": repo["web_url"],
                                "last_modified": repo.get("last_activity_at")
                            })
                        
                        logger.info(f"Discovered {len(projects)} GitLab projects")
                    else:
                        logger.error(f"GitLab API error: {response.status}")
                        
        except Exception as e:
            logger.error(f"Error discovering GitLab projects: {e}")
        
        return projects
    
    async def discover_remote_projects(self, source: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Discover projects from custom remote API"""
        projects = []
        url = source.get("url", "")
        api_key = source.get("api_key", "")
        
        if not url:
            logger.warning("Remote source requires URL")
            return projects
        
        headers = {}
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        # Assume the API returns a list of projects
                        if isinstance(data, list):
                            projects = data
                        elif isinstance(data, dict) and "projects" in data:
                            projects = data["projects"]
                        
                        # Normalize project data
                        for i, project in enumerate(projects):
                            if "id" not in project:
                                project["id"] = f"remote_project_{i}"
                            if "source_type" not in project:
                                project["source_type"] = "remote"
                            if "source" not in project:
                                project["source"] = source.get("name", "Remote")
                        
                        logger.info(f"Discovered {len(projects)} remote projects")
                    else:
                        logger.error(f"Remote API error: {response.status}")
                        
        except Exception as e:
            logger.error(f"Error discovering remote projects: {e}")
        
        return projects
    
    def get_project(self, project_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific project by ID"""
        return self.projects_cache.get(project_id)
    
    def get_all_projects(self) -> List[Dict[str, Any]]:
        """Get all cached projects"""
        return list(self.projects_cache.values())
    
    async def refresh_project(self, project_id: str) -> Optional[Dict[str, Any]]:
        """Refresh a specific project's information"""
        project = self.projects_cache.get(project_id)
        
        if not project:
            return None
        
        source_type = project.get("source_type", "local")
        
        if source_type == "local":
            # Re-analyze local project
            path = project.get("path")
            if path and os.path.exists(path):
                updated_info = self.analyze_local_project(path)
                if updated_info:
                    project.update(updated_info)
                    project["last_refreshed"] = datetime.now().isoformat()
        
        return project
    
    async def create_project(self, name: str, path: str, project_type: str = "generic") -> Dict[str, Any]:
        """Create a new project"""
        project_id = name.lower().replace(" ", "_").replace("-", "_")
        
        # Create project directory
        os.makedirs(path, exist_ok=True)
        
        # Initialize based on type
        if project_type == "nodejs":
            # Create package.json
            package_json = {
                "name": name,
                "version": "1.0.0",
                "description": f"{name} project",
                "main": "index.js",
                "scripts": {
                    "start": "node index.js"
                }
            }
            with open(os.path.join(path, "package.json"), 'w') as f:
                json.dump(package_json, f, indent=2)
        
        elif project_type == "python":
            # Create requirements.txt
            with open(os.path.join(path, "requirements.txt"), 'w') as f:
                f.write("# Python dependencies\n")
        
        # Initialize git repository
        try:
            import subprocess
            subprocess.run(["git", "init"], cwd=path, check=True)
            logger.info(f"Initialized git repository for {name}")
        except:
            logger.warning(f"Could not initialize git for {name}")
        
        # Create project object
        project = {
            "id": project_id,
            "name": name,
            "path": path,
            "source": "Local",
            "source_type": "local",
            "status": "active",
            "type": project_type,
            "created_at": datetime.now().isoformat()
        }
        
        # Add to cache
        self.projects_cache[project_id] = project
        
        return project

# Global project manager instance
project_manager = ProjectManager()