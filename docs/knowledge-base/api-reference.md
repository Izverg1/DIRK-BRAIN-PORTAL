# DIRK BRAIN Portal - API Reference

## 🔌 Base URLs

- **Frontend:** `http://localhost:3000`
- **Backend API:** `http://localhost:8000/api/v1`
- **Real-time:** `ws://localhost:8001`

## 🔐 Authentication

All API requests require authentication via JWT tokens.

```bash
# Get authentication token
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "password"
}

# Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600
}

# Use token in requests
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🤖 Agent Management

### List All Agents
```http
GET /api/v1/agents
```

**Response:**
```json
{
  "agents": [
    {
      "id": "claude-001",
      "name": "Claude",
      "type": "claude",
      "status": "active",
      "capabilities": ["code", "analysis", "writing"],
      "performance": {
        "avg_response_time": 89,
        "success_rate": 99.7,
        "tasks_completed": 1247
      }
    }
  ]
}
```

### Deploy Agent
```http
POST /api/v1/agents/deploy
```

**Request:**
```json
{
  "agent_type": "claude",
  "configuration": {
    "model": "claude-3-sonnet",
    "max_tokens": 4000,
    "temperature": 0.7
  },
  "project_id": "proj-123"
}
```

### Get Agent Status
```http
GET /api/v1/agents/{agent_id}/status
```

**Response:**
```json
{
  "id": "claude-001",
  "status": "active",
  "current_task": "code-analysis",
  "queue_length": 3,
  "last_activity": "2024-01-15T10:30:00Z"
}
```

### Update Agent Configuration
```http
PUT /api/v1/agents/{agent_id}/config
```

**Request:**
```json
{
  "temperature": 0.8,
  "max_tokens": 8000,
  "system_prompt": "You are a specialized code analysis agent..."
}
```

## 🔄 Workflow Management

### Create Workflow
```http
POST /api/v1/workflows/create
```

**Request:**
```json
{
  "name": "Full-Stack Development",
  "description": "Build React app with authentication",
  "tasks": [
    {
      "id": "frontend",
      "agent_type": "claude",
      "description": "Create React components",
      "dependencies": []
    },
    {
      "id": "backend",
      "agent_type": "gemini",
      "description": "Build API endpoints",
      "dependencies": ["frontend"]
    }
  ],
  "coordination": {
    "parallel_execution": true,
    "failure_recovery": "automatic"
  }
}
```

### Execute Workflow
```http
POST /api/v1/workflows/{workflow_id}/execute
```

**Request:**
```json
{
  "input": "Build a full-stack React app with user authentication",
  "context": {
    "project_type": "web_application",
    "tech_stack": ["react", "node", "postgresql"]
  }
}
```

### Get Workflow Status
```http
GET /api/v1/workflows/{workflow_id}/status
```

**Response:**
```json
{
  "id": "wf-123",
  "status": "running",
  "progress": 65,
  "current_step": "backend-implementation",
  "steps": [
    {
      "id": "frontend",
      "status": "completed",
      "agent": "claude-001",
      "duration": 120,
      "result": "React components created successfully"
    },
    {
      "id": "backend",
      "status": "in_progress",
      "agent": "gemini-001",
      "progress": 45
    }
  ]
}
```

## 🧠 GOD Mode Orchestration

### Execute GOD Mode
```http
POST /api/v1/godmode/execute
```

**Request:**
```json
{
  "request": "Build a full-stack React application with authentication, testing, and deployment",
  "context": {
    "complexity": "high",
    "timeline": "1 week",
    "requirements": ["responsive design", "secure auth", "automated testing"]
  },
  "preferences": {
    "parallel_execution": true,
    "auto_recovery": true,
    "quality_gates": true
  }
}
```

**Response:**
```json
{
  "execution_id": "god-exec-123",
  "task_decomposition": [
    {
      "task": "Frontend Development",
      "assigned_agent": "claude",
      "estimated_duration": "2 hours",
      "subtasks": ["components", "routing", "styling"]
    },
    {
      "task": "Backend API",
      "assigned_agent": "gemini",
      "estimated_duration": "3 hours",
      "subtasks": ["endpoints", "middleware", "auth"]
    }
  ],
  "coordination_plan": {
    "parallel_tasks": ["frontend", "testing"],
    "dependencies": {"deployment": ["frontend", "backend", "testing"]}
  }
}
```

### Get GOD Mode Status
```http
GET /api/v1/godmode/status/{execution_id}
```

## 📊 Monitoring & Analytics

### System Health
```http
GET /api/v1/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "agents": "healthy"
  },
  "metrics": {
    "active_agents": 5,
    "running_workflows": 12,
    "avg_response_time": 89
  }
}
```

### Performance Metrics
```http
GET /api/v1/metrics
```

**Response:**
```json
{
  "system": {
    "cpu_usage": 23.5,
    "memory_usage": 67.2,
    "disk_usage": 45.1
  },
  "agents": {
    "total_requests": 15420,
    "successful_requests": 15367,
    "failed_requests": 53,
    "avg_response_time": 89.3
  },
  "workflows": {
    "total_executed": 1247,
    "successful": 1239,
    "failed": 8,
    "avg_duration": 342
  }
}
```

### Agent Performance
```http
GET /api/v1/agents/{agent_id}/metrics
```

**Response:**
```json
{
  "agent_id": "claude-001",
  "performance": {
    "requests_per_minute": 12.5,
    "avg_response_time": 76,
    "success_rate": 99.8,
    "error_rate": 0.2
  },
  "resource_usage": {
    "cpu": 15.2,
    "memory": 512,
    "tokens_used": 45230
  },
  "task_distribution": {
    "code_generation": 45,
    "analysis": 30,
    "documentation": 25
  }
}
```

## 🔄 Real-time WebSocket Events

### Connection
```javascript
const socket = io('ws://localhost:8001');

// Authentication
socket.emit('authenticate', { token: 'your-jwt-token' });
```

### Agent Status Updates
```javascript
socket.on('agent:status', (data) => {
  console.log('Agent status update:', data);
  // {
  //   agent_id: 'claude-001',
  //   status: 'busy',
  //   current_task: 'code-generation',
  //   progress: 65
  // }
});
```

### Workflow Progress
```javascript
socket.on('workflow:progress', (data) => {
  console.log('Workflow progress:', data);
  // {
  //   workflow_id: 'wf-123',
  //   step: 'backend-implementation',
  //   progress: 75,
  //   estimated_completion: '2024-01-15T11:30:00Z'
  // }
});
```

### GOD Mode Events
```javascript
socket.on('godmode:task_assigned', (data) => {
  console.log('Task assigned:', data);
  // {
  //   execution_id: 'god-exec-123',
  //   task_id: 'frontend-dev',
  //   agent_id: 'claude-001',
  //   estimated_duration: 120
  // }
});

socket.on('godmode:task_completed', (data) => {
  console.log('Task completed:', data);
  // {
  //   execution_id: 'god-exec-123',
  //   task_id: 'frontend-dev',
  //   result: 'success',
  //   duration: 118,
  //   output: 'React components created successfully'
  // }
});
```

## 🛡️ Security & Administration

### User Management
```http
# Create user
POST /api/v1/admin/users
{
  "email": "user@example.com",
  "role": "developer",
  "permissions": ["agents:read", "workflows:create"]
}

# List users
GET /api/v1/admin/users

# Update user permissions
PUT /api/v1/admin/users/{user_id}/permissions
{
  "permissions": ["agents:read", "agents:write", "workflows:create"]
}
```

### Audit Logs
```http
GET /api/v1/admin/audit-logs?start_date=2024-01-01&end_date=2024-01-15
```

**Response:**
```json
{
  "logs": [
    {
      "timestamp": "2024-01-15T10:30:00Z",
      "user_id": "user-123",
      "action": "agent:deploy",
      "resource": "claude-001",
      "ip_address": "192.168.1.100",
      "user_agent": "Mozilla/5.0..."
    }
  ]
}
```

## 📝 Configuration Management

### Get System Configuration
```http
GET /api/v1/config
```

### Update Configuration
```http
PUT /api/v1/config
{
  "features": {
    "voice_control": true,
    "predictive_analytics": true
  },
  "limits": {
    "max_concurrent_workflows": 50,
    "max_agents_per_user": 10
  }
}
```

## 🔧 Development & Testing

### Test Agent Connection
```http
POST /api/v1/agents/test
{
  "agent_type": "claude",
  "test_prompt": "Hello, can you respond?"
}
```

### Validate Workflow
```http
POST /api/v1/workflows/validate
{
  "workflow_definition": { /* workflow JSON */ }
}
```

## 📚 Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Rate Limited - Too many requests |
| 500 | Internal Error - Server error |
| 503 | Service Unavailable - Agent offline |

## 🚀 Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/v1/agents/*` | 100 req/min | Per user |
| `/api/v1/workflows/*` | 50 req/min | Per user |
| `/api/v1/godmode/*` | 10 req/min | Per user |
| `/api/v1/metrics` | 200 req/min | Per user |

---

**API Version:** v1  
**Documentation:** Auto-generated from OpenAPI spec  
**Support:** api-support@dirk-brain.com