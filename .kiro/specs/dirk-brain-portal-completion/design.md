# Design Document

## Overview

The DIRK BRAIN Portal is a **one-click deployable AI agent orchestration system**. Users run a single script that automatically generates and deploys a complete agent management platform to their local environment.

**Dual Deployment Model**:

**CLI Deployment**:
```bash
# Quick deploy
./deploy-dirk-brain.sh --project /path/to/project

# Advanced deploy with options
dirk deploy --agents claude,gemini --hooks git,file-watch --commands custom.json
```

**Web Interface Deployment**:
- Visual project selector and configuration
- Drag-and-drop agent assignment
- Real-time deployment progress
- One-click deployment to selected projects
- Template-based quick setups

**Both methods**:
- Generate complete agent orchestration system
- Auto-configure integrations (Claude, Gemini, sub-agents)
- Deploy slash commands and monitoring hooks
- Set up agent swarm coordination
- Provide immediate localhost access

**Core Value**: Deploy AI agent orchestration to any project in under 5 minutes, either via CLI automation or visual web interface.

## Architecture

### 🌟 Immersive 3D Agent Orchestration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│           🧠 DIRK BRAIN - Immersive Agent Universe          │
├─────────────────────────────────────────────────────────────┤
│  🎨 Immersive Frontend Experience (Next.js 15 + React 19)   │
│  ├── 🌌 3D Agent Universe (Three.js + R3F)                  │
│  │   ├── Interactive Agent Entities with Real-time Status   │
│  │   ├── Holographic Agent Communication Visualization      │
│  │   ├── 3D Project Workspace Representation               │
│  │   ├── Particle System for Data Flow                     │
│  │   └── Immersive Agent Swarm Coordination View           │
│  ├── 🎭 Cinematic UI (shadcn/ui + Framer Motion)           │
│  │   ├── Glassmorphism Design with Depth Layers           │
│  │   ├── Smooth Micro-interactions & Transitions          │
│  │   ├── Contextual Animations & Visual Feedback          │
│  │   ├── Adaptive Layout with Smart Responsiveness        │
│  │   └── Ambient Lighting & Dynamic Themes               │
│  ├── 🗣️ Voice & Gesture Interface                          │
│  │   ├── Web Speech API for Natural Commands              │
│  │   ├── Voice-to-Workflow Creation                       │
│  │   ├── 3D Navigation with Mouse/Touch Gestures          │
│  │   ├── Ambient AI Assistant (Always Listening)          │
│  │   └── Spatial Audio for Agent Communication            │
│  └── 📊 Advanced Data Visualization                        │
│      ├── Real-time Agent Performance in 3D Space         │
│      ├── Interactive Network Topology                     │
│      ├── Holographic Analytics Overlays                   │
│      ├── Time-series Data with Particle Effects          │
│      └── Immersive Workflow Execution Visualization       │
├─────────────────────────────────────────────────────────────┤
│  ⚡ Real-time Communication Layer (Node.js + Socket.io)     │
│  ├── 🔄 Instant Agent State Synchronization                │
│  ├── 📡 Live Workflow Execution Streaming                  │
│  ├── 🎯 Real-time Performance Metrics                      │
│  ├── 💬 Agent-to-Agent Communication Bus                   │
│  ├── 🔔 Intelligent Notification System                    │
│  └── 🌊 Event Stream Processing                            │
├─────────────────────────────────────────────────────────────┤
│  🤖 AI Agent Orchestration Engine (Python/FastAPI)         │
│  ├── 🧠 GOD Mode Intelligence                              │
│  │   ├── Advanced Task Decomposition with ML              │
│  │   ├── Intelligent Agent Selection Algorithm            │
│  │   ├── Parallel Execution with Dependency Resolution    │
│  │   ├── Predictive Failure Detection                     │
│  │   └── Self-Learning Recovery Strategies                │
│  ├── 🎪 Agent Swarm Management                             │
│  │   ├── Dynamic Agent Spawning & Lifecycle               │
│  │   ├── Load Balancing & Resource Optimization           │
│  │   ├── Health Monitoring with Auto-healing              │
│  │   ├── Performance Analytics & Optimization             │
│  │   └── Agent Personality & Behavior Modeling            │
│  └── 🛡️ Enterprise Safety & Quality                       │
│      ├── Mr. Wolf Advisory with Pattern Recognition       │
│      ├── DIRK Safety Hooks with ML Enhancement            │
│      ├── Code Quality Enforcement with AI Review          │
│      ├── Security Validation with Threat Detection        │
│      └── Compliance Monitoring & Reporting                │
├─────────────────────────────────────────────────────────────┤
│  🌐 Agent Ecosystem & Integrations                         │
│  ├── 🎭 DIRK Agent Family                                  │
│  │   ├── DIRK.c (Claude) - Implementation Specialist      │
│  │   ├── DIRK.g (Gemini) - Architecture & Analysis        │
│  │   ├── DIRK.desktop - Strategic Planning Interface      │
│  │   ├── Sub-Agents - Specialized Task Handlers           │
│  │   └── Custom Agents - User-defined Capabilities        │
│  ├── 🔗 MCP Protocol Integration                           │
│  │   ├── Desktop Commander (macOS Deep Integration)       │
│  │   ├── Docker Gateway with Container Orchestration      │
│  │   ├── Filesystem Operations with Security              │
│  │   ├── Cloud Services (Google, Brave, Supabase)         │
│  │   └── Development Tools Integration                     │
│  └── 🚀 Deployment & Automation                           │
│      ├── One-Script Deployment with Intelligence          │
│      ├── Template-based Project Setup                     │
│      ├── Git Hook Management & Automation                 │
│      ├── CI/CD Pipeline Integration                       │
│      └── Infrastructure as Code Generation                │
├─────────────────────────────────────────────────────────────┤
│  💾 Intelligent Data & Analytics Layer                     │
│  ├── 📈 Performance Analytics (PostgreSQL + Redis)         │
│  ├── 🧠 Agent Learning & Pattern Recognition               │
│  ├── 📊 Real-time Metrics & Monitoring                     │
│  ├── 🔍 Advanced Search & Indexing                         │
│  ├── 🎯 Predictive Intelligence & Forecasting              │
│  └── 🔄 Continuous Learning & Optimization                 │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**🎨 Frontend Experience (Next.js 15 + React 19)**:
- **UI Framework**: shadcn/ui components with Radix primitives
- **3D Visualization**: Three.js with React Three Fiber for immersive agent visualization
- **Styling**: Tailwind CSS 4 with custom design system
- **Animations**: Framer Motion for smooth transitions and micro-interactions
- **Real-time**: Socket.io client for live agent communication
- **State Management**: Zustand with persistence for complex state
- **Charts & Graphs**: Recharts + D3.js for advanced data visualization

**🚀 Backend Powerhouse (Node.js + Python Hybrid)**:
- **Primary API**: Node.js with Express/Fastify for real-time performance
- **Agent Engine**: Python 3.11+ with FastAPI for AI orchestration
- **Database**: PostgreSQL with Prisma ORM + Redis for caching
- **Real-time**: Socket.io server for instant agent communication
- **File Processing**: Node.js streams for high-performance file operations

**🤖 Agent Ecosystem**:
- **Claude Integration**: Anthropic API + Claude Code hooks
- **Gemini Integration**: Google AI API with streaming responses
- **Sub-Agents**: Anthropic sub-agent framework + custom plugins
- **Agent Visualization**: Real-time 3D agent representations
- **Communication Bus**: WebSocket + Server-Sent Events

**🎮 Immersive Experience**:
- **3D Agent World**: Three.js scene with interactive agent entities and particle systems
- **Holographic UI**: Advanced glassmorphism with depth, shadows, and ambient lighting
- **Voice Interface**: Web Speech API with natural language workflow creation
- **Gesture Controls**: Intuitive 3D navigation with spatial interactions
- **Ambient Intelligence**: Always-on AI assistant with contextual awareness
- **Spatial Audio**: 3D positioned audio for agent communication and feedback
- **Dynamic Themes**: Adaptive UI that responds to agent activity and time of day
- **Particle Effects**: Visual representation of data flow and agent communication
- **Immersive Analytics**: 3D data visualization with interactive exploration

## 🎨 Immersive User Experience Design

### 🌌 3D Agent Universe

**Vision**: Transform agent management into an immersive 3D experience where agents exist as living entities in a virtual space.

**Core Features**:
- **Agent Avatars**: Each agent (DIRK.c, DIRK.g, etc.) represented as unique 3D entities with personality-driven animations
- **Real-time Activity**: Agents glow, move, and interact based on their current tasks and performance
- **Communication Visualization**: Data flows between agents shown as particle streams and energy connections
- **Project Spaces**: Each project exists as a 3D environment that agents can enter and work within
- **Swarm Coordination**: Visual representation of agent collaboration with synchronized movements

**Technical Implementation**:
```typescript
// Three.js + React Three Fiber setup
const AgentUniverse = () => {
  const { agents, projects, communications } = useAgentStore()
  
  return (
    <Canvas camera={{ position: [0, 0, 10] }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      
      {agents.map(agent => (
        <AgentEntity 
          key={agent.id}
          agent={agent}
          position={agent.position}
          activity={agent.currentActivity}
        />
      ))}
      
      <ParticleSystem communications={communications} />
      <ProjectEnvironments projects={projects} />
      <OrbitControls enablePan enableZoom enableRotate />
    </Canvas>
  )
}
```

### 🎭 Cinematic UI Components

**Design Philosophy**: Every interaction should feel like a scene from a sci-fi movie - smooth, intelligent, and visually stunning.

**Component Library**:
- **Holographic Cards**: Glassmorphism cards with depth, blur, and ambient lighting
- **Animated Buttons**: Micro-interactions with particle effects and sound feedback
- **Smart Modals**: Context-aware dialogs that adapt to user intent
- **Fluid Navigation**: Seamless transitions between 3D and 2D interfaces
- **Ambient Notifications**: Subtle, non-intrusive alerts integrated into the 3D space

**shadcn/ui Integration**:
```typescript
// Enhanced shadcn components with 3D effects
const HolographicCard = ({ children, ...props }) => {
  return (
    <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg" />
      <CardContent className="relative z-10">
        {children}
      </CardContent>
    </Card>
  )
}
```

### 🗣️ Voice & Gesture Interface

**Natural Interaction**: Users can control the entire system through voice commands and intuitive gestures.

**Voice Commands**:
- "Deploy Claude to my React project"
- "Show me agent performance for the last hour"
- "Create a workflow for full-stack development"
- "Switch to GOD Mode and analyze this task"

**Gesture Controls**:
- **Pinch to Zoom**: Navigate through the 3D agent space
- **Swipe to Switch**: Move between different project environments
- **Tap to Select**: Interact with agents and UI elements
- **Voice + Gesture**: Combined interactions for complex commands

### 📊 Immersive Data Visualization

**3D Analytics**: Transform boring charts into immersive data experiences.

**Visualization Types**:
- **Agent Performance Spheres**: 3D spheres that grow/shrink based on performance metrics
- **Network Topology**: Interactive 3D network showing agent connections and data flow
- **Time-series Tunnels**: Navigate through time by moving through 3D tunnels of data
- **Holographic Dashboards**: Floating analytics panels in 3D space
- **Particle Data Streams**: Real-time data represented as flowing particle systems

## Components and Interfaces

### 1. Backend Migration Foundation

**Purpose**: Complete the Node.js to Python/FastAPI migration and integrate with existing DIRK ecosystem
**Priority**: Critical (blocks all other features)

**Components**:
- `main.py` - FastAPI application entry point with DIRK protocol integration
- `api/` - REST endpoint definitions for agent orchestration
- `services/` - Business logic layer with GOD Mode integration
- `models/` - Data models for agents, tasks, and workflows
- `config/` - Configuration management with MCP integration
- `dirk_integration/` - Direct integration with existing DIRK protocol files

**Key Interfaces**:
```python
# FastAPI app structure with DIRK integration
app = FastAPI(title="DIRK BRAIN Portal", version="1.0.0")

# Core endpoints
@app.get("/api/status")
@app.get("/api/agents")  # DIRK.c, DIRK.g, DIRK.desktop status
@app.post("/api/agents/deploy")  # Deploy agents to projects
@app.get("/api/tasks")  # Active/completed tasks from DIRK protocol
@app.post("/api/godmode/analyze")  # GOD Mode task analysis
@app.get("/api/hooks")  # Git hooks, file watchers, GOD Mode hooks
@app.post("/api/workflows/create")  # Dynamic workflow creation
@app.get("/api/mcp/servers")  # MCP server status and configuration
```

### 2. DIRK Protocol Integration Service

**Purpose**: Integrate with existing comprehensive DIRK ecosystem
**Integration**: Direct integration with existing DIRK protocol files and agent registry

**Components**:
- `DirkProtocolManager` - Interfaces with existing DIRK protocol structure
- `TaskRegistryManager` - Manages active/completed tasks from task_registry.json
- `AgentCoordinator` - Coordinates DIRK.c, DIRK.g, DIRK.desktop agents
- `ContextManager` - Integrates with existing DIRK_CONTEXT.md logging
- `BackupManager` - Integrates with existing backup system
- `HookManager` - Manages existing Claude hooks and GOD Mode hooks

**Key Interfaces**:
```python
class DirkProtocolManager:
    def get_active_tasks(self) -> List[DirkTask]
    def create_task(self, task: TaskSpec) -> str
    def assign_agent(self, task_id: str, agent: DirkAgent) -> bool
    def get_agent_status(self, agent_type: str) -> AgentStatus
    def trigger_godmode_analysis(self, request: str) -> GodModeResult
    def get_context_history(self, project_path: str) -> List[ContextEntry]
```

### 3. GOD Mode Orchestration Engine

**Purpose**: Intelligent task distribution and multi-agent coordination
**Integration**: Integrates with existing GOD Mode hooks and safety mechanisms

**Components**:
- `GodModeOrchestrator` - Analyzes complex tasks and distributes to optimal agents
- `AgentSelector` - Chooses optimal DIRK variant based on task type and history
- `ParallelExecutor` - Manages parallel agent execution with dependency tracking
- `FailureRecovery` - Detects failures and implements recovery strategies
- `SafetyValidator` - Integrates with existing safety hooks and Mr. Wolf protocol
- `ResultAggregator` - Combines outputs from multiple agents

**Key Interfaces**:
```python
class GodModeOrchestrator:
    def analyze_request(self, request: str) -> TaskDecomposition
    def select_agents(self, tasks: List[Task]) -> Dict[Task, DirkAgent]
    def execute_parallel(self, assignments: Dict[Task, DirkAgent]) -> ExecutionResult
    def handle_failure(self, failed_task: Task, agent: DirkAgent) -> RecoveryAction
    def aggregate_results(self, results: List[AgentResult]) -> FinalResult
```

### 4. MCP Integration & Service Management

**Purpose**: Integrate with Model Context Protocol servers and manage AI service credentials
**Integration**: Supports existing MCP configuration and extends with new capabilities

**Components**:
- `MCPServerManager` - Manages MCP server lifecycle and configuration
- `ServiceCredentialManager` - Secure storage for API keys and OAuth tokens
- `MCPConfigValidator` - Validates and fixes MCP configurations
- `ServiceIntegrator` - Integrates with Google, Brave, Supabase, etc.
- `DesktopCommanderInterface` - Direct macOS integration via MCP

**Key Interfaces**:
```python
class MCPServerManager:
    def get_server_status(self, server_name: str) -> MCPServerStatus
    def restart_server(self, server_name: str) -> bool
    def validate_config(self, config: MCPConfig) -> ValidationResult
    def fix_configuration_issues(self) -> List[ConfigFix]
    def integrate_with_agents(self, agent: DirkAgent) -> bool
```

### 5. Deployment & Workflow Engine

**Purpose**: Handle dual CLI/Web deployment and dynamic workflow creation
**Integration**: Integrates with existing DIRK utilities and deployment scripts

**Components**:
- `DeploymentEngine` - Handles both CLI and web-based deployments
- `WorkflowBuilder` - Creates dynamic workflows through AI chatbot interface
- `TemplateManager` - Manages deployment templates for different project types
- `ProjectAnalyzer` - Auto-detects project types and suggests optimal configurations
- `SlashCommandProcessor` - Processes and routes slash commands to agents
- `HookInstaller` - Installs Git hooks, file watchers, and GOD Mode hooks

**Key Interfaces**:
```python
class DeploymentEngine:
    def deploy_via_cli(self, project_path: str, config: DeployConfig) -> DeployResult
    def deploy_via_web(self, project_id: str, selections: WebConfig) -> DeployResult
    def create_workflow(self, natural_language: str) -> Workflow
    def install_to_project(self, project_path: str, components: List[str]) -> bool
    def generate_deployment_script(self, config: DeployConfig) -> str
```

## Data Models

### Core Data Models

```python
# Project tracking
class Project(BaseModel):
    id: str
    name: str
    path: str
    type: ProjectType  # Node.js, Python, Rust, etc.
    last_activity: datetime
    context_summary: str
    active_tasks: List[str]

# AI interaction logging
class AIInteraction(BaseModel):
    id: str
    project_id: str
    timestamp: datetime
    agent_type: str  # Claude, Gemini, etc.
    action: str
    files_modified: List[str]
    context_used: str
    result: str

# API key storage
class APIKey(BaseModel):
    id: str
    service: str  # OpenAI, Anthropic, Google, etc.
    encrypted_key: str
    created_at: datetime
    last_used: datetime
    is_active: bool

# Custom commands
class CustomCommand(BaseModel):
    id: str
    name: str
    description: str
    trigger: str
    ai_instructions: str
    parameters: Dict[str, Any]
    created_by: str
    usage_count: int
```

### Database Schema

```sql
-- Projects table
CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    path TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL,
    last_activity TIMESTAMP,
    context_summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI interactions log
CREATE TABLE ai_interactions (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES projects(id),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    agent_type TEXT NOT NULL,
    action TEXT NOT NULL,
    files_modified TEXT, -- JSON array
    context_used TEXT,
    result TEXT
);

-- Encrypted API keys
CREATE TABLE api_keys (
    id TEXT PRIMARY KEY,
    service TEXT NOT NULL,
    encrypted_key TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Custom commands
CREATE TABLE custom_commands (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    trigger TEXT,
    ai_instructions TEXT NOT NULL,
    parameters TEXT, -- JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usage_count INTEGER DEFAULT 0
);
```

## Error Handling

### Error Categories

1. **Migration Errors**: Node.js artifact conflicts, Python dependency issues
2. **Context Errors**: File access permissions, corrupted context data
3. **Security Errors**: API key encryption failures, unauthorized access
4. **Integration Errors**: DIRK protocol file conflicts, Git hook failures
5. **Performance Errors**: Context overload, database connection issues

### Error Handling Strategy

```python
class DirkError(Exception):
    """Base exception for DIRK Portal errors"""
    pass

class MigrationError(DirkError):
    """Errors during Node.js to Python migration"""
    pass

class ContextError(DirkError):
    """Errors in context management"""
    pass

class SecurityError(DirkError):
    """Security-related errors"""
    pass

# Global error handler
@app.exception_handler(DirkError)
async def dirk_error_handler(request: Request, exc: DirkError):
    return JSONResponse(
        status_code=500,
        content={"error": str(exc), "type": type(exc).__name__}
    )
```

## Testing Strategy

### Test Categories

1. **Migration Tests**: Verify complete Node.js removal and Python setup
2. **Integration Tests**: Test DIRK protocol file integration
3. **Security Tests**: Validate API key encryption and access controls
4. **Context Tests**: Verify context persistence and summarization
5. **End-to-End Tests**: Full workflow testing with real AI interactions

### Test Structure

```
tests/
├── unit/
│   ├── test_context_manager.py
│   ├── test_key_vault.py
│   ├── test_mr_wolf.py
│   └── test_command_engine.py
├── integration/
│   ├── test_dirk_integration.py
│   ├── test_database.py
│   └── test_api_endpoints.py
├── security/
│   ├── test_encryption.py
│   └── test_access_control.py
└── e2e/
    ├── test_complete_workflow.py
    └── test_frontend_integration.py
```

## Implementation Plan

### Phase 1: Foundation (Critical)
1. Complete Node.js artifact removal
2. Set up Python/FastAPI backend structure
3. Create database schema and models
4. Implement basic API endpoints
5. Serve Next.js frontend

### Phase 2: Core Services
1. Implement Context Management Service
2. Build API Key Vault with encryption
3. Create basic Mr. Wolf policy engine
4. Set up project discovery and monitoring

### Phase 3: Advanced Features
1. Complete Mr. Wolf advisory system
2. Implement custom command engine
3. Add Git hook integration
4. Build context summarization

### Phase 4: Integration & Polish
1. Full DIRK protocol integration
2. Frontend feature completion
3. Comprehensive testing
4. Performance optimization
5. Documentation and deployment

This design provides a clear roadmap for transforming the incomplete DIRK BRAIN Portal into a fully functional AI workflow management system that solves real developer productivity problems.