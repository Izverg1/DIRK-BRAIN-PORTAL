# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Frontend (Next.js + React + Three.js)
- **Development**: `cd frontend && pnpm dev` - Runs development server on port 3000
- **Build**: `cd frontend && pnpm build` - Creates production build in `frontend/out`
- **Lint**: `cd frontend && pnpm lint` - Runs ESLint checks
- **Start**: `cd frontend && pnpm start` - Starts production server

### Backend (FastAPI + Python)
- **Development**: `cd backend && python main.py` - Runs FastAPI server on port 3001
- **Development (uvicorn)**: `cd backend && uvicorn main:app --reload --port 3001`

### Testing
- Tests are organized in `/tests` directory with unit, integration, e2e, performance, and security suites
- Test files use standard Node.js testing patterns but no specific test runner is configured in package.json

## Architecture Overview

### DIRK BRAIN Portal - Universal AI Agent Orchestration Platform
A sophisticated AI agent orchestration platform that can deploy and manage agents from multiple providers (Anthropic Claude, Google Gemini, OpenAI GPT, local models) working together in configurable pods/swarms.

### NEW FEATURES (2025)
1. **Drag-and-Drop Pod Builder** (`/frontend/src/components/DragDropPodBuilder.tsx`)
   - Visual canvas for creating agent pods
   - Mix different providers (Claude for coding + Gemini for BA)
   - Multiple pod types: Swarm, Pipeline, Mesh, Hierarchical

2. **Multi-Provider Support** (`/backend/providers/UniversalAgentProvider.js`)
   - Anthropic Claude (best for coding/reasoning)
   - Google Gemini (business analysis, verification)
   - OpenAI GPT (general purpose)
   - Local models (privacy-focused)

3. **Agent Runtime Orchestration** (`/backend/orchestration/AgentRuntime.js`)
   - Actual process spawning for agents
   - Inter-agent communication
   - Consensus mechanisms for swarms
   - Real-time metrics via WebSocket

### Key API Endpoints
- `POST /api/pods/generate` - Generate pod from requirements
- `POST /api/pods/deploy` - Deploy agent pod
- `POST /api/pods/{pod_id}/execute` - Execute task on pod
- `GET /api/runtime/status` - Runtime orchestration status
- `GET /api/analytics/global` - Global analytics data

### Core Components

1. **Frontend Stack**
   - Next.js 15 with React 19
   - Three.js for 3D visualizations
   - Framer Motion for animations
   - TailwindCSS for styling
   - Zustand for state management

2. **Backend Stack**
   - FastAPI (Python) as main API server
   - gRPC for inter-service communication
   - Multiple specialized Node.js services for agent management
   - Redis for caching/session management
   - Supabase/PostgreSQL for persistence

3. **Agent System Architecture**
   - **GodModeOrchestrator**: Central task decomposition and workflow management
   - **AgentSwarmManager**: Manages pools of specialized AI agents
   - **MrWolfAdvisor**: Code quality and security validation ("The Wolf" from Pulp Fiction)
   - **NLPTaskAnalyzer**: Natural language processing for task understanding
   - **MLAgentSelector**: Machine learning-based agent selection
   - **DirkContextLogger**: Comprehensive context and audit logging

4. **Specialized Agents**
   - **DIRK.c**: General computational agents (rendered as cubes)
   - **DIRK.g**: Graphical/generative task agents (rendered as cylinders)
   - **DIRK.desktop**: Desktop interaction agents (rendered as spheres)

5. **Key Features**
   - Real-time 3D visualization of agent universe
   - Voice command processing
   - Task flow visualization with particle effects
   - Holographic dashboard interface
   - Deployment automation (Docker, Kubernetes, AWS)

### DIRK Framework
Enterprise-grade development framework with:
- Case-based development methodology (CCMS - Case Context Management System)
- 8 core philosophical principles for systematic development
- Multi-language/platform support
- Comprehensive quality gates and validation

### Directory Structure
```
/frontend           - Next.js application
/backend           - FastAPI server and Node.js services
/docs              - Documentation (architecture, user guides, deployment)
/tests             - Test suites
/DIRK BRAIN        - DIRK protocol implementation and utilities
/proto             - Protocol buffer definitions
/scripts           - Deployment scripts
/supabase          - Database migrations and config
```

## Important Patterns

1. **Inter-Service Communication**: Use gRPC for backend services communication
2. **State Management**: Frontend uses Zustand stores in `/frontend/src/lib/store.ts`
3. **3D Components**: All Three.js components in `/frontend/src/components/` follow React Three Fiber patterns
4. **API Endpoints**: FastAPI routes in `/backend/main.py`, additional services expose gRPC interfaces
5. **Task Management**: Tasks follow DIRK protocol with JSON format in `/backend/dirk_protocol/active_tasks/`

## Security Considerations

- ServiceCredentialManager handles all credential encryption/decryption
- SecurityValidator performs comprehensive security checks
- ComplianceMonitor ensures regulatory compliance
- All API endpoints should validate input and use proper authentication

## Development Notes

- Frontend build outputs to `/frontend/out` for static hosting
- Backend expects frontend build at specific path (see main.py)
- Voice commands processed through VoiceCommandProcessor component
- Real-time updates use WebSocket connections for agent status
- 3D visualizations optimized for performance with instanced meshes
- never mock to avoid a challange
- activate test agent when done with a task
- important: all features must fit into the browswer frame, no cutoffs, no scrollbars allowed. performance analytics must be a seperate section