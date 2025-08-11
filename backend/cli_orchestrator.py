"""
CLI Orchestrator - Python implementation for managing CLI tool execution
"""

import subprocess
import asyncio
import json
import os
from typing import Dict, List, Optional, Any
from datetime import datetime
import shutil

class CLIOrchestrator:
    def __init__(self):
        self.active_processes = {}
        self.command_history = []
        self.templates = self.load_templates()
    
    def load_templates(self) -> Dict:
        """Load command templates for common workflows"""
        return {
            "claude": {
                "generateCode": {
                    "name": "Generate Code with Claude",
                    "command": "claude",
                    "args": ["code"],
                    "description": "Use Claude to generate code based on a prompt"
                },
                "reviewCode": {
                    "name": "Review Code with Claude",
                    "command": "claude",
                    "args": ["review", "{{file}}"],
                    "description": "Have Claude review a specific file"
                }
            },
            "gemini": {
                "analyze": {
                    "name": "Analyze with Gemini",
                    "command": "gemini",
                    "args": ["analyze", "{{file}}"],
                    "description": "Analyze code or requirements with Gemini"
                },
                "generateTests": {
                    "name": "Generate Tests with Gemini",
                    "command": "gemini",
                    "args": ["test", "{{file}}"],
                    "description": "Generate test cases using Gemini"
                }
            },
            "git": {
                "status": {
                    "name": "Git Status",
                    "command": "git",
                    "args": ["status"],
                    "description": "Check repository status"
                },
                "diff": {
                    "name": "Git Diff",
                    "command": "git",
                    "args": ["diff"],
                    "description": "View uncommitted changes"
                }
            }
        }
    
    def executeCommand(self, config: Dict) -> Dict:
        """Execute a CLI command synchronously"""
        command = config.get("command", "")
        args = config.get("args", [])
        stdin = config.get("stdin", "")
        cwd = config.get("cwd", os.getcwd())
        env = {**os.environ, **config.get("env", {})}
        
        command_id = f"cmd-{datetime.now().timestamp()}"
        full_command = [command] + args if args else [command]
        
        try:
            # Check if command exists
            if not shutil.which(command):
                return {
                    "commandId": command_id,
                    "command": " ".join(full_command),
                    "exitCode": 1,
                    "output": "",
                    "errorOutput": f"Command '{command}' not found",
                    "timestamp": datetime.now().isoformat()
                }
            
            # Execute command
            process = subprocess.run(
                full_command,
                input=stdin.encode() if stdin else None,
                capture_output=True,
                text=True,
                cwd=cwd,
                env=env,
                timeout=60  # 60 second timeout
            )
            
            result = {
                "commandId": command_id,
                "command": " ".join(full_command),
                "exitCode": process.returncode,
                "output": process.stdout,
                "errorOutput": process.stderr,
                "timestamp": datetime.now().isoformat()
            }
            
            self.command_history.append(result)
            return result
            
        except subprocess.TimeoutExpired:
            return {
                "commandId": command_id,
                "command": " ".join(full_command),
                "exitCode": -1,
                "output": "",
                "errorOutput": "Command timed out after 60 seconds",
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            return {
                "commandId": command_id,
                "command": " ".join(full_command),
                "exitCode": -1,
                "output": "",
                "errorOutput": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    async def executeCommandAsync(self, config: Dict) -> Dict:
        """Execute a CLI command asynchronously"""
        return await asyncio.to_thread(self.executeCommand, config)
    
    def executeTemplate(self, tool: str, template_name: str, variables: Dict = None) -> Dict:
        """Execute a command template with variable substitution"""
        variables = variables or {}
        template = self.templates.get(tool, {}).get(template_name)
        
        if not template:
            raise ValueError(f"Template '{template_name}' not found for tool '{tool}'")
        
        # Substitute variables
        args = []
        for arg in template.get("args", []):
            if "{{" in arg:
                for key, value in variables.items():
                    arg = arg.replace(f"{{{{{key}}}}}", str(value))
            args.append(arg)
        
        config = {
            "command": template["command"],
            "args": args,
            "stdin": variables.get("stdin", ""),
            "cwd": variables.get("projectPath", os.getcwd())
        }
        
        return self.executeCommand(config)
    
    def executeWorkflow(self, workflow_name: str, variables: Dict = None) -> List[Dict]:
        """Execute a workflow (multiple commands in sequence)"""
        # For now, return empty list - workflows would be defined separately
        return []
    
    def getHistory(self, limit: int = 50) -> List[Dict]:
        """Get command history"""
        return self.command_history[-limit:]
    
    def getTemplates(self) -> Dict:
        """Get all templates"""
        return self.templates
    
    def getAvailableTools(self) -> Dict[str, bool]:
        """Check which CLI tools are available"""
        tools = ["claude", "gemini", "git", "npm", "python", "python3", "docker"]
        availability = {}
        
        for tool in tools:
            availability[tool] = shutil.which(tool) is not None
        
        return availability