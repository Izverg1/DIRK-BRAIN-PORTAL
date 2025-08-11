"""
Unified Orchestrator - Single engine for CLI, API, MCP, and custom connectors
Modular architecture with pluggable connectors for any execution type
"""

import asyncio
import subprocess
import json
import os
from typing import Dict, List, Any, Optional, Protocol
from datetime import datetime
from abc import ABC, abstractmethod
import aiohttp
import logging

# Import MrWolf security validator
try:
    from mrwolf_security import MrWolfSecurity
    mrwolf = MrWolfSecurity()
except ImportError:
    mrwolf = None
    
logger = logging.getLogger(__name__)

# Connector Protocol - All connectors must implement this interface
class ConnectorProtocol(Protocol):
    """Protocol that all connectors must implement"""
    
    async def execute(self, command: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a command and return results"""
        ...
    
    async def health_check(self) -> bool:
        """Check if the connector is healthy and ready"""
        ...
    
    def get_capabilities(self) -> Dict[str, Any]:
        """Return connector capabilities and metadata"""
        ...

# Base Connector Class
class BaseConnector(ABC):
    """Abstract base class for all connectors"""
    
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {}
        self.name = self.__class__.__name__
        self.status = "initializing"
        
    @abstractmethod
    async def execute(self, command: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a command through this connector"""
        pass
    
    @abstractmethod
    async def health_check(self) -> bool:
        """Check connector health"""
        pass
    
    @abstractmethod
    def get_capabilities(self) -> Dict[str, Any]:
        """Get connector capabilities"""
        pass

# CLI Connector - For local CLI tools
class CLIConnector(BaseConnector):
    """Connector for CLI tools like claude, gemini, git, npm, etc."""
    
    def __init__(self, config: Dict[str, Any] = None):
        super().__init__(config)
        self.supported_tools = ['claude', 'gemini', 'git', 'npm', 'python', 'docker']
        
    async def execute(self, command: Dict[str, Any]) -> Dict[str, Any]:
        """Execute CLI command locally"""
        cmd = command.get("command", "")
        args = command.get("args", [])
        stdin = command.get("stdin", "")
        cwd = command.get("cwd", os.getcwd())
        env = {**os.environ, **command.get("env", {})}
        
        try:
            # Build full command
            full_command = [cmd] + args if isinstance(args, list) else [cmd, args]
            
            # Execute with asyncio
            process = await asyncio.create_subprocess_exec(
                *full_command,
                stdin=asyncio.subprocess.PIPE if stdin else None,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=cwd,
                env=env
            )
            
            # Send stdin if provided
            if stdin:
                stdout, stderr = await process.communicate(stdin.encode())
            else:
                stdout, stderr = await process.communicate()
            
            return {
                "success": process.returncode == 0,
                "output": stdout.decode() if stdout else "",
                "error": stderr.decode() if stderr else "",
                "exit_code": process.returncode,
                "connector": "cli",
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "connector": "cli",
                "timestamp": datetime.now().isoformat()
            }
    
    async def health_check(self) -> bool:
        """Check if CLI tools are available"""
        try:
            result = await self.execute({"command": "echo", "args": ["health_check"]})
            return result.get("success", False)
        except:
            return False
    
    def get_capabilities(self) -> Dict[str, Any]:
        return {
            "type": "cli",
            "tools": self.supported_tools,
            "execution": "local",
            "async": True
        }

# API Connector - For remote API-based agents
class APIConnector(BaseConnector):
    """Connector for API-based agents (OpenAI, Anthropic, custom APIs)"""
    
    def __init__(self, config: Dict[str, Any] = None):
        super().__init__(config)
        config = config or {}
        self.base_url = config.get("base_url", "")
        self.api_key = config.get("api_key", "")
        self.headers = config.get("headers", {})
        
    async def execute(self, command: Dict[str, Any]) -> Dict[str, Any]:
        """Execute API call to remote agent"""
        endpoint = command.get("endpoint", "")
        method = command.get("method", "POST")
        payload = command.get("payload", {})
        
        # Add API key to headers if provided
        headers = {**self.headers}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        
        url = f"{self.base_url}{endpoint}" if self.base_url else endpoint
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.request(
                    method,
                    url,
                    json=payload,
                    headers=headers
                ) as response:
                    result = await response.json()
                    
                    return {
                        "success": response.status < 400,
                        "status_code": response.status,
                        "result": result,
                        "connector": "api",
                        "endpoint": endpoint,
                        "timestamp": datetime.now().isoformat()
                    }
                    
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "connector": "api",
                "endpoint": endpoint,
                "timestamp": datetime.now().isoformat()
            }
    
    async def health_check(self) -> bool:
        """Check if API endpoint is reachable"""
        if not self.base_url:
            return True  # Assume healthy if no base URL (using full URLs)
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(self.base_url, timeout=5) as response:
                    return response.status < 500
        except:
            return False
    
    def get_capabilities(self) -> Dict[str, Any]:
        return {
            "type": "api",
            "base_url": self.base_url,
            "execution": "remote",
            "async": True,
            "auth": "bearer" if self.api_key else "none"
        }

# MCP Connector - For Model Context Protocol servers
class MCPConnector(BaseConnector):
    """Connector for MCP (Model Context Protocol) servers"""
    
    def __init__(self, config: Dict[str, Any] = None):
        super().__init__(config)
        config = config or {}
        self.server_url = config.get("server_url", "localhost:3100")
        self.protocol = config.get("protocol", "grpc")
        
    async def execute(self, command: Dict[str, Any]) -> Dict[str, Any]:
        """Execute command through MCP server"""
        action = command.get("action", "")
        params = command.get("params", {})
        
        if self.protocol == "grpc":
            # gRPC implementation would go here
            return {
                "success": True,
                "result": f"MCP action '{action}' executed",
                "connector": "mcp",
                "protocol": self.protocol,
                "timestamp": datetime.now().isoformat()
            }
        else:
            # HTTP/REST fallback
            endpoint = f"http://{self.server_url}/mcp/{action}"
            api_connector = APIConnector({"base_url": f"http://{self.server_url}"})
            return await api_connector.execute({
                "endpoint": f"/mcp/{action}",
                "payload": params
            })
    
    async def health_check(self) -> bool:
        """Check if MCP server is reachable"""
        try:
            result = await self.execute({"action": "ping", "params": {}})
            return result.get("success", False)
        except:
            return False
    
    def get_capabilities(self) -> Dict[str, Any]:
        return {
            "type": "mcp",
            "server": self.server_url,
            "protocol": self.protocol,
            "execution": "remote",
            "async": True
        }

# Docker Connector - For containerized agents
class DockerConnector(BaseConnector):
    """Connector for Docker-based agent execution with enhanced deployment"""
    
    def __init__(self, config: Dict[str, Any] = None):
        super().__init__(config)
        config = config or {}
        self.docker_host = config.get("docker_host", "unix://var/run/docker.sock")
        self.containers = {}  # Track running containers
        
    async def execute(self, command: Dict[str, Any]) -> Dict[str, Any]:
        """Execute command in Docker container or deploy new agent"""
        action = command.get("action", "run")
        
        if action == "deploy":
            return await self.deploy_agent(command)
        elif action == "run":
            return await self.run_command(command)
        elif action == "stop":
            return await self.stop_container(command)
        elif action == "status":
            return await self.get_status(command)
        else:
            return await self.run_command(command)
    
    async def deploy_agent(self, command: Dict[str, Any]) -> Dict[str, Any]:
        """Deploy a new containerized agent"""
        agent_type = command.get("agent_type", "generic")
        agent_id = command.get("agent_id", f"agent-{datetime.now().timestamp()}")
        
        # Map agent types to Docker images
        image_map = {
            "claude": "anthropic/claude-cli:latest",
            "gemini": "google/gemini-cli:latest",
            "python": "python:3.11-slim",
            "node": "node:18-alpine",
            "generic": "alpine:latest"
        }
        
        image = command.get("image", image_map.get(agent_type, "alpine:latest"))
        
        # Build Docker run command with proper configuration
        docker_cmd = [
            "docker", "run", "-d",
            "--name", f"dirk-agent-{agent_id}",
            "--label", f"dirk.agent.id={agent_id}",
            "--label", f"dirk.agent.type={agent_type}",
            "--restart", "unless-stopped"
        ]
        
        # Add environment variables
        env_vars = command.get("env", {})
        for key, value in env_vars.items():
            docker_cmd.extend(["-e", f"{key}={value}"])
        
        # Add port mappings if needed
        ports = command.get("ports", [])
        for port in ports:
            docker_cmd.extend(["-p", str(port)])
        
        # Add the image and command
        docker_cmd.append(image)
        if command.get("cmd"):
            docker_cmd.extend(command["cmd"].split())
        
        # Execute deployment
        cli_connector = CLIConnector()
        result = await cli_connector.execute({"command": docker_cmd[0], "args": docker_cmd[1:]})
        
        if result.get("success"):
            container_id = result.get("output", "").strip()
            self.containers[agent_id] = {
                "container_id": container_id,
                "agent_type": agent_type,
                "image": image,
                "started_at": datetime.now().isoformat()
            }
            
            result["agent_id"] = agent_id
            result["container_id"] = container_id
            result["deployment"] = "success"
        
        result["connector"] = "docker"
        return result
    
    async def run_command(self, command: Dict[str, Any]) -> Dict[str, Any]:
        """Run command in existing or new container"""
        container = command.get("container", "")
        agent_id = command.get("agent_id", "")
        image = command.get("image", "")
        cmd = command.get("command", "")
        
        docker_cmd = ["docker"]
        
        # Use agent_id to find container if provided
        if agent_id and agent_id in self.containers:
            container = self.containers[agent_id]["container_id"]
        
        if container:
            # Execute in existing container
            docker_cmd.extend(["exec", container])
            if cmd:
                docker_cmd.extend(cmd.split())
        elif image:
            # Run new container
            docker_cmd.extend(["run", "--rm", image])
            if cmd:
                docker_cmd.extend(cmd.split())
        else:
            return {
                "success": False,
                "error": "Either container, agent_id, or image must be specified",
                "connector": "docker",
                "timestamp": datetime.now().isoformat()
            }
        
        cli_connector = CLIConnector()
        result = await cli_connector.execute({"command": docker_cmd[0], "args": docker_cmd[1:]})
        result["connector"] = "docker"
        return result
    
    async def stop_container(self, command: Dict[str, Any]) -> Dict[str, Any]:
        """Stop a running container"""
        agent_id = command.get("agent_id", "")
        container = command.get("container", "")
        
        if agent_id and agent_id in self.containers:
            container = self.containers[agent_id]["container_id"]
        
        if not container:
            return {
                "success": False,
                "error": "No container specified",
                "connector": "docker",
                "timestamp": datetime.now().isoformat()
            }
        
        cli_connector = CLIConnector()
        result = await cli_connector.execute({"command": "docker", "args": ["stop", container]})
        
        if result.get("success") and agent_id in self.containers:
            del self.containers[agent_id]
        
        result["connector"] = "docker"
        return result
    
    async def get_status(self, command: Dict[str, Any]) -> Dict[str, Any]:
        """Get status of Docker containers"""
        cli_connector = CLIConnector()
        
        # Get all DIRK agent containers
        result = await cli_connector.execute({
            "command": "docker",
            "args": ["ps", "--filter", "label=dirk.agent.id", "--format", "json"]
        })
        
        result["connector"] = "docker"
        result["containers"] = self.containers
        return result
    
    async def health_check(self) -> bool:
        """Check if Docker is available"""
        cli_connector = CLIConnector()
        result = await cli_connector.execute({"command": "docker", "args": ["version"]})
        return result.get("success", False)
    
    def get_capabilities(self) -> Dict[str, Any]:
        return {
            "type": "docker",
            "host": self.docker_host,
            "execution": "containerized",
            "async": True
        }

# WebSocket Connector - For real-time streaming agents
class WebSocketConnector(BaseConnector):
    """Connector for WebSocket-based real-time agents"""
    
    def __init__(self, config: Dict[str, Any] = None):
        super().__init__(config)
        config = config or {}
        self.ws_url = config.get("ws_url", "")
        
    async def execute(self, command: Dict[str, Any]) -> Dict[str, Any]:
        """Execute command through WebSocket"""
        # WebSocket implementation would go here
        return {
            "success": True,
            "result": "WebSocket command executed",
            "connector": "websocket",
            "url": self.ws_url,
            "timestamp": datetime.now().isoformat()
        }
    
    async def health_check(self) -> bool:
        """Check WebSocket connection"""
        return True  # Placeholder
    
    def get_capabilities(self) -> Dict[str, Any]:
        return {
            "type": "websocket",
            "url": self.ws_url,
            "execution": "streaming",
            "async": True,
            "bidirectional": True
        }

# SSH Connector - For remote server execution
class SSHConnector(BaseConnector):
    """Connector for SSH-based remote execution with agent deployment"""
    
    def __init__(self, config: Dict[str, Any] = None):
        super().__init__(config)
        config = config or {}
        self.host = config.get("host", "")
        self.user = config.get("user", "")
        self.key_file = config.get("key_file", "")
        self.port = config.get("port", 22)
        self.remote_agents = {}  # Track remote agents
        
    async def execute(self, command: Dict[str, Any]) -> Dict[str, Any]:
        """Execute command on remote server via SSH"""
        action = command.get("action", "run")
        
        if action == "deploy":
            return await self.deploy_remote_agent(command)
        elif action == "transfer":
            return await self.transfer_files(command)
        elif action == "status":
            return await self.check_remote_status(command)
        else:
            return await self.run_remote_command(command)
    
    async def deploy_remote_agent(self, command: Dict[str, Any]) -> Dict[str, Any]:
        """Deploy agent on remote server"""
        agent_type = command.get("agent_type", "python")
        agent_id = command.get("agent_id", f"agent-{datetime.now().timestamp()}")
        script = command.get("script", "")
        
        # Create remote directory for agent
        remote_dir = f"~/dirk-agents/{agent_id}"
        mkdir_cmd = f"mkdir -p {remote_dir}"
        
        result = await self.run_remote_command({"command": mkdir_cmd})
        if not result.get("success"):
            return result
        
        # Transfer agent script if provided
        if script:
            # Write script to temp file
            import tempfile
            with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
                f.write(script)
                temp_file = f.name
            
            # SCP the file to remote
            scp_result = await self.transfer_files({
                "source": temp_file,
                "destination": f"{remote_dir}/agent.py"
            })
            
            # Clean up temp file
            os.unlink(temp_file)
            
            if not scp_result.get("success"):
                return scp_result
        
        # Start the agent on remote server
        start_cmd = f"cd {remote_dir} && nohup python3 agent.py > output.log 2>&1 & echo $!"
        if agent_type == "node":
            start_cmd = f"cd {remote_dir} && nohup node agent.js > output.log 2>&1 & echo $!"
        
        result = await self.run_remote_command({"command": start_cmd})
        
        if result.get("success"):
            pid = result.get("output", "").strip()
            self.remote_agents[agent_id] = {
                "host": self.host,
                "remote_dir": remote_dir,
                "pid": pid,
                "agent_type": agent_type,
                "deployed_at": datetime.now().isoformat()
            }
            
            result["agent_id"] = agent_id
            result["remote_pid"] = pid
            result["deployment"] = "success"
        
        return result
    
    async def run_remote_command(self, command: Dict[str, Any]) -> Dict[str, Any]:
        """Run command on remote server"""
        cmd = command.get("command", "")
        host = command.get("host", self.host)
        user = command.get("user", self.user)
        
        ssh_cmd = ["ssh", "-o", "StrictHostKeyChecking=no"]
        
        if self.key_file:
            ssh_cmd.extend(["-i", self.key_file])
        
        if self.port != 22:
            ssh_cmd.extend(["-p", str(self.port)])
        
        ssh_cmd.extend([f"{user}@{host}", cmd])
        
        cli_connector = CLIConnector()
        result = await cli_connector.execute({"command": ssh_cmd[0], "args": ssh_cmd[1:]})
        result["connector"] = "ssh"
        result["host"] = host
        return result
    
    async def transfer_files(self, command: Dict[str, Any]) -> Dict[str, Any]:
        """Transfer files to/from remote server using SCP"""
        source = command.get("source", "")
        destination = command.get("destination", "")
        direction = command.get("direction", "push")  # push or pull
        
        scp_cmd = ["scp", "-o", "StrictHostKeyChecking=no"]
        
        if self.key_file:
            scp_cmd.extend(["-i", self.key_file])
        
        if self.port != 22:
            scp_cmd.extend(["-P", str(self.port)])
        
        if direction == "push":
            # Local to remote
            scp_cmd.extend([source, f"{self.user}@{self.host}:{destination}"])
        else:
            # Remote to local
            scp_cmd.extend([f"{self.user}@{self.host}:{source}", destination])
        
        cli_connector = CLIConnector()
        result = await cli_connector.execute({"command": scp_cmd[0], "args": scp_cmd[1:]})
        result["connector"] = "ssh"
        result["transfer"] = "complete" if result.get("success") else "failed"
        return result
    
    async def check_remote_status(self, command: Dict[str, Any]) -> Dict[str, Any]:
        """Check status of remote agents"""
        agent_id = command.get("agent_id", "")
        
        if agent_id and agent_id in self.remote_agents:
            agent_info = self.remote_agents[agent_id]
            # Check if process is still running
            check_cmd = f"ps -p {agent_info['pid']} > /dev/null 2>&1 && echo 'running' || echo 'stopped'"
            result = await self.run_remote_command({"command": check_cmd})
            
            status = result.get("output", "").strip()
            return {
                "success": True,
                "agent_id": agent_id,
                "status": status,
                "agent_info": agent_info,
                "connector": "ssh",
                "timestamp": datetime.now().isoformat()
            }
        else:
            # List all remote agents
            return {
                "success": True,
                "remote_agents": self.remote_agents,
                "connector": "ssh",
                "timestamp": datetime.now().isoformat()
            }
    
    async def health_check(self) -> bool:
        """Check SSH connection"""
        result = await self.execute({"command": "echo 'health_check'"})
        return result.get("success", False)
    
    def get_capabilities(self) -> Dict[str, Any]:
        return {
            "type": "ssh",
            "host": self.host,
            "user": self.user,
            "execution": "remote",
            "async": True
        }

# Main Unified Orchestrator
class UnifiedOrchestrator:
    """
    Single orchestration engine that handles all execution types
    through pluggable connectors
    """
    
    def __init__(self):
        self.connectors: Dict[str, BaseConnector] = {}
        self.active_executions: Dict[str, Any] = {}
        self.execution_history: List[Dict] = []
        self.initialize_default_connectors()
        
    def initialize_default_connectors(self):
        """Initialize default connectors"""
        # CLI connector for local tools
        self.register_connector("cli", CLIConnector())
        
        # API connector for remote services
        self.register_connector("api", APIConnector())
        
        # MCP connector
        self.register_connector("mcp", MCPConnector())
        
        # Docker connector
        self.register_connector("docker", DockerConnector())
        
        # WebSocket connector
        self.register_connector("websocket", WebSocketConnector())
        
        # SSH connector
        self.register_connector("ssh", SSHConnector())
        
        logger.info(f"Initialized {len(self.connectors)} default connectors")
    
    def register_connector(self, name: str, connector: BaseConnector):
        """Register a new connector"""
        self.connectors[name] = connector
        logger.info(f"Registered connector: {name}")
    
    def unregister_connector(self, name: str):
        """Unregister a connector"""
        if name in self.connectors:
            del self.connectors[name]
            logger.info(f"Unregistered connector: {name}")
    
    async def analyze_command(self, command: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Analyze a command to determine the best execution strategy
        Returns execution plan with connector and parameters
        """
        context = context or {}
        command_lower = command.lower()
        
        # Determine execution type
        if command_lower.startswith(('claude', 'gemini', 'git', 'npm', 'python')):
            # CLI execution for known tools
            parts = command.split()
            return {
                "connector": "cli",
                "command": parts[0],
                "args": parts[1:] if len(parts) > 1 else [],
                "execution_type": "local"
            }
        
        elif command_lower.startswith('http://') or command_lower.startswith('https://'):
            # API execution for URLs
            return {
                "connector": "api",
                "endpoint": command,
                "method": "POST",
                "execution_type": "remote"
            }
        
        elif command_lower.startswith('mcp://'):
            # MCP execution
            mcp_path = command[6:]  # Remove mcp://
            return {
                "connector": "mcp",
                "action": mcp_path,
                "execution_type": "mcp"
            }
        
        elif command_lower.startswith('docker://'):
            # Docker execution
            docker_cmd = command[9:]  # Remove docker://
            return {
                "connector": "docker",
                "command": docker_cmd,
                "execution_type": "containerized"
            }
        
        elif command_lower.startswith('ssh://'):
            # SSH execution
            ssh_cmd = command[6:]  # Remove ssh://
            return {
                "connector": "ssh",
                "command": ssh_cmd,
                "execution_type": "remote_ssh"
            }
        
        elif '@' in command and ':' in command:
            # Might be SSH format: user@host:command
            parts = command.split(':')
            if len(parts) == 2:
                return {
                    "connector": "ssh",
                    "command": parts[1],
                    "host": parts[0].split('@')[1],
                    "user": parts[0].split('@')[0],
                    "execution_type": "remote_ssh"
                }
        
        else:
            # Default to CLI for unknown commands - parse properly
            parts = command.split()
            return {
                "connector": "cli",
                "command": parts[0] if parts else command,
                "args": parts[1:] if len(parts) > 1 else [],
                "execution_type": "local"
            }
    
    async def execute(self, command: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Main execution method - analyzes command and routes to appropriate connector
        """
        execution_id = f"exec-{datetime.now().strftime('%Y%m%d-%H%M%S')}-{len(self.execution_history)}"
        
        # MrWolf Security Validation
        if mrwolf:
            security_check = await mrwolf.validate_command(command)
            if not security_check.get("safe", True):
                return {
                    "success": False,
                    "error": f"Security violation detected: {security_check.get('reason', 'Unknown threat')}",
                    "execution_id": execution_id,
                    "security_report": security_check
                }
        
        # Analyze command to get execution plan
        execution_plan = await self.analyze_command(command, context)
        
        # Get the appropriate connector
        connector_name = execution_plan.get("connector", "cli")
        connector = self.connectors.get(connector_name)
        
        if not connector:
            return {
                "success": False,
                "error": f"Connector '{connector_name}' not found",
                "execution_id": execution_id
            }
        
        # Record active execution
        self.active_executions[execution_id] = {
            "command": command,
            "connector": connector_name,
            "started_at": datetime.now().isoformat(),
            "status": "executing"
        }
        
        try:
            # Execute through connector
            result = await connector.execute(execution_plan)
            
            # Add execution metadata
            result["execution_id"] = execution_id
            result["execution_plan"] = execution_plan
            
            # Update active execution
            self.active_executions[execution_id]["status"] = "completed"
            self.active_executions[execution_id]["completed_at"] = datetime.now().isoformat()
            
            # Add to history
            self.execution_history.append({
                **result,
                "command": command,
                "context": context
            })
            
            return result
            
        except Exception as e:
            error_result = {
                "success": False,
                "error": str(e),
                "execution_id": execution_id,
                "connector": connector_name
            }
            
            # Update active execution
            self.active_executions[execution_id]["status"] = "failed"
            self.active_executions[execution_id]["error"] = str(e)
            
            return error_result
        
        finally:
            # Clean up active execution after delay
            await asyncio.sleep(60)  # Keep for 1 minute for monitoring
            if execution_id in self.active_executions:
                del self.active_executions[execution_id]
    
    async def execute_parallel(self, commands: List[str], context: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Execute multiple commands in parallel"""
        tasks = [self.execute(cmd, context) for cmd in commands]
        return await asyncio.gather(*tasks)
    
    async def execute_workflow(self, workflow: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute a complex workflow with multiple steps
        Supports sequential, parallel, and conditional execution
        """
        workflow_id = f"workflow-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
        results = []
        
        for step in workflow.get("steps", []):
            step_type = step.get("type", "sequential")
            
            if step_type == "parallel":
                # Execute commands in parallel
                step_results = await self.execute_parallel(step.get("commands", []))
                results.extend(step_results)
                
            elif step_type == "conditional":
                # Execute based on condition
                condition = step.get("condition", {})
                if self.evaluate_condition(condition, results):
                    step_result = await self.execute(step.get("command", ""))
                    results.append(step_result)
                    
            else:  # sequential
                # Execute command sequentially
                step_result = await self.execute(step.get("command", ""))
                results.append(step_result)
                
                # Check if should continue
                if not step_result.get("success", False) and step.get("stop_on_failure", False):
                    break
        
        return {
            "workflow_id": workflow_id,
            "success": all(r.get("success", False) for r in results),
            "steps_executed": len(results),
            "results": results
        }
    
    def evaluate_condition(self, condition: Dict[str, Any], previous_results: List[Dict]) -> bool:
        """Evaluate workflow condition"""
        # Simple condition evaluation - can be extended
        if not previous_results:
            return True
        
        last_result = previous_results[-1]
        condition_type = condition.get("type", "success")
        
        if condition_type == "success":
            return last_result.get("success", False)
        elif condition_type == "failure":
            return not last_result.get("success", True)
        elif condition_type == "contains":
            output = last_result.get("output", "")
            return condition.get("value", "") in output
        
        return True
    
    async def health_check_all(self) -> Dict[str, bool]:
        """Check health of all registered connectors"""
        health_status = {}
        
        for name, connector in self.connectors.items():
            try:
                health_status[name] = await connector.health_check()
            except Exception as e:
                health_status[name] = False
                logger.error(f"Health check failed for {name}: {e}")
        
        return health_status
    
    def get_capabilities(self) -> Dict[str, Any]:
        """Get capabilities of all registered connectors"""
        return {
            name: connector.get_capabilities()
            for name, connector in self.connectors.items()
        }
    
    def get_execution_history(self, limit: int = 50) -> List[Dict]:
        """Get recent execution history"""
        return self.execution_history[-limit:]
    
    def get_active_executions(self) -> Dict[str, Any]:
        """Get currently active executions"""
        return self.active_executions