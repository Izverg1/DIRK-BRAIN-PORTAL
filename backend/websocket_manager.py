"""
WebSocket Manager for Real-time Command Streaming
Handles bidirectional communication for live updates
"""

import asyncio
import json
import logging
from typing import Dict, Set, Any
from datetime import datetime
import subprocess
from fastapi import WebSocket

logger = logging.getLogger(__name__)

class WebSocketManager:
    """Manages WebSocket connections and real-time streaming"""
    
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self.command_sessions: Dict[str, Dict[str, Any]] = {}
        self.agent_status: Dict[str, Dict[str, Any]] = {}
        
    async def connect(self, websocket: WebSocket):
        """Accept new WebSocket connection"""
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(f"WebSocket connected. Total connections: {len(self.active_connections)}")
        
        # Send initial connection message
        await self.send_to_client(websocket, {
            "type": "connection",
            "status": "connected",
            "timestamp": datetime.now().isoformat()
        })
        
    async def disconnect(self, websocket: WebSocket):
        """Remove WebSocket connection"""
        self.active_connections.discard(websocket)
        logger.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")
        
    async def send_to_client(self, websocket: WebSocket, data: Dict[str, Any]):
        """Send data to specific client"""
        try:
            await websocket.send_json(data)
        except Exception as e:
            logger.error(f"Error sending to client: {e}")
            await self.disconnect(websocket)
            
    async def broadcast(self, data: Dict[str, Any]):
        """Broadcast data to all connected clients"""
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(data)
            except Exception as e:
                logger.error(f"Error broadcasting: {e}")
                disconnected.append(connection)
        
        # Clean up disconnected clients
        for conn in disconnected:
            await self.disconnect(conn)
            
    async def handle_message(self, websocket: WebSocket, message: Dict[str, Any]):
        """Handle incoming WebSocket message"""
        msg_type = message.get("type", "")
        
        if msg_type == "ping":
            await self.send_to_client(websocket, {"type": "pong"})
            
        elif msg_type == "execute_command":
            await self.stream_command_execution(websocket, message)
            
        elif msg_type == "subscribe_agent":
            agent_id = message.get("agent_id")
            await self.subscribe_to_agent(websocket, agent_id)
            
        elif msg_type == "get_status":
            await self.send_status(websocket)
            
    async def stream_command_execution(self, websocket: WebSocket, message: Dict[str, Any]):
        """Stream command execution output in real-time"""
        command = message.get("command", "")
        session_id = message.get("session_id", f"session-{datetime.now().timestamp()}")
        
        # Store session
        self.command_sessions[session_id] = {
            "command": command,
            "started_at": datetime.now().isoformat(),
            "websocket": websocket,
            "status": "running"
        }
        
        # Send start message
        await self.send_to_client(websocket, {
            "type": "command_start",
            "session_id": session_id,
            "command": command,
            "timestamp": datetime.now().isoformat()
        })
        
        try:
            # Execute command with streaming output
            process = await asyncio.create_subprocess_shell(
                command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                stdin=asyncio.subprocess.PIPE
            )
            
            # Stream output line by line
            async def stream_output(stream, stream_type):
                async for line in stream:
                    output = line.decode('utf-8', errors='replace')
                    await self.send_to_client(websocket, {
                        "type": "command_output",
                        "session_id": session_id,
                        "stream": stream_type,
                        "data": output,
                        "timestamp": datetime.now().isoformat()
                    })
                    
                    # Also broadcast to other clients for monitoring
                    await self.broadcast({
                        "type": "command_activity",
                        "session_id": session_id,
                        "command": command[:50] + "..." if len(command) > 50 else command,
                        "stream": stream_type
                    })
            
            # Create tasks for stdout and stderr
            stdout_task = asyncio.create_task(stream_output(process.stdout, "stdout"))
            stderr_task = asyncio.create_task(stream_output(process.stderr, "stderr"))
            
            # Wait for process to complete
            await asyncio.gather(stdout_task, stderr_task)
            await process.wait()
            
            # Send completion message
            await self.send_to_client(websocket, {
                "type": "command_complete",
                "session_id": session_id,
                "exit_code": process.returncode,
                "timestamp": datetime.now().isoformat()
            })
            
            # Update session status
            self.command_sessions[session_id]["status"] = "completed"
            self.command_sessions[session_id]["exit_code"] = process.returncode
            self.command_sessions[session_id]["completed_at"] = datetime.now().isoformat()
            
        except Exception as e:
            logger.error(f"Command execution error: {e}")
            await self.send_to_client(websocket, {
                "type": "command_error",
                "session_id": session_id,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            })
            
            self.command_sessions[session_id]["status"] = "error"
            self.command_sessions[session_id]["error"] = str(e)
            
    async def subscribe_to_agent(self, websocket: WebSocket, agent_id: str):
        """Subscribe to real-time agent status updates"""
        # Send current agent status
        if agent_id in self.agent_status:
            await self.send_to_client(websocket, {
                "type": "agent_status",
                "agent_id": agent_id,
                "status": self.agent_status[agent_id],
                "timestamp": datetime.now().isoformat()
            })
        
        # Mark subscription (would need proper subscription management in production)
        await self.send_to_client(websocket, {
            "type": "subscription_confirmed",
            "agent_id": agent_id,
            "timestamp": datetime.now().isoformat()
        })
        
    async def update_agent_status(self, agent_id: str, status: Dict[str, Any]):
        """Update agent status and notify subscribers"""
        self.agent_status[agent_id] = {
            **status,
            "updated_at": datetime.now().isoformat()
        }
        
        # Broadcast status update to all connections
        await self.broadcast({
            "type": "agent_status_update",
            "agent_id": agent_id,
            "status": self.agent_status[agent_id],
            "timestamp": datetime.now().isoformat()
        })
        
    async def send_status(self, websocket: WebSocket):
        """Send current system status"""
        status = {
            "type": "system_status",
            "active_connections": len(self.active_connections),
            "active_sessions": len([s for s in self.command_sessions.values() if s["status"] == "running"]),
            "total_sessions": len(self.command_sessions),
            "monitored_agents": len(self.agent_status),
            "timestamp": datetime.now().isoformat()
        }
        await self.send_to_client(websocket, status)
        
    async def send_task_progress(self, task_id: str, progress: float, details: Dict[str, Any] = None):
        """Send task progress updates to all clients"""
        await self.broadcast({
            "type": "task_progress",
            "task_id": task_id,
            "progress": progress,
            "details": details or {},
            "timestamp": datetime.now().isoformat()
        })
        
    async def send_workflow_update(self, workflow_id: str, status: str, current_step: str = None):
        """Send workflow status updates"""
        await self.broadcast({
            "type": "workflow_update",
            "workflow_id": workflow_id,
            "status": status,
            "current_step": current_step,
            "timestamp": datetime.now().isoformat()
        })
        
    async def send_metrics_update(self, metrics: Dict[str, Any]):
        """Send real-time metrics updates"""
        await self.broadcast({
            "type": "metrics_update",
            "metrics": metrics,
            "timestamp": datetime.now().isoformat()
        })
        
# Global WebSocket manager instance
ws_manager = WebSocketManager()