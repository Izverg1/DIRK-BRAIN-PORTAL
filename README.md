# DIRK Brain Portal 🧠

AI Agent Orchestration Platform - Unified CLI & API Execution with 3D Visualization

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Python](https://img.shields.io/badge/python-3.8+-green.svg)
![Node](https://img.shields.io/badge/node-18+-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🚀 Quick Start

```bash
# Run the interactive setup wizard
python setup_wizard.py

# Start all services
./start.sh  # Linux/Mac
.\start.bat # Windows
```

Access the portal at: **http://localhost:3000**

## 📋 Features

### Core Capabilities
- **Unified Command Center** - Execute commands via CLI or API with intelligent routing
- **3D Visualization** - Elegant hexagonal grid showing agents and data flows
- **AI Swarm Generation** - Create agent teams using natural language
- **MrWolf Security** - Comprehensive code validation and threat detection
- **Real-time Streaming** - WebSocket-based live updates and monitoring
- **Project Discovery** - Automatic detection from local, GitHub, and GitLab sources

### View Modes
- **Command Mode** - Focus on execution and terminal output
- **Monitor Mode** - Full 3D visualization of agent universe
- **Hybrid Mode** - Split view with both command and visualization

### Agent Types
- **DIRK.c** - Coding agents for development tasks
- **DIRK.g** - Creative agents for design and content
- **DIRK.a** - Analysis agents for data and business intelligence

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         Frontend (Next.js + React)       │
│   UnifiedCommandCenter | 3D Viz | AI Box │
└─────────────────────────────────────────┘
                    ↕ WebSocket/HTTP
┌─────────────────────────────────────────┐
│          Backend (FastAPI + Python)      │
│   Orchestrator | Connectors | Security   │
└─────────────────────────────────────────┘
                    ↕ gRPC
┌─────────────────────────────────────────┐
│    External Services (AI Providers)      │
│   Claude | GPT | Gemini | Docker | SSH   │
└─────────────────────────────────────────┘
```

## 📦 Installation

### Prerequisites
- Python 3.8+
- Node.js 18+
- Git
- Docker (optional, for containerized agents)

### Manual Installation

```bash
# Clone the repository
git clone https://github.com/your-org/dirk-brain-portal
cd dirk-brain-portal

# Install frontend dependencies
cd frontend
pnpm install  # or npm install

# Install backend dependencies
cd ../backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your API keys and settings

# Start services
python godmode_server.py &
python main.py &
cd ../frontend && pnpm dev
```

## 🔧 Configuration

### Environment Variables

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:8080
NEXT_PUBLIC_GRPC_URL=localhost:50051
```

#### Backend (.env)
```env
# API Keys
ANTHROPIC_API_KEY=your_claude_key
OPENAI_API_KEY=your_openai_key
GOOGLE_API_KEY=your_gemini_key

# Database
DATABASE_URL=postgresql://user:pass@localhost/dirk

# Ports
PORT=3001
GRPC_PORT=50051
WS_PORT=8080
```

## 🎯 Usage Examples

### Generate Agent Swarm
```javascript
// Natural language command in AI Prompt Box
"Create a full-stack development team with testing capabilities"

// Or via API
POST /api/ai/generate-agents
{
  "prompt": "Build e-commerce platform team",
  "project": "my-store"
}
```

### Execute Commands
```bash
# CLI execution
claude code "Create a React component for user authentication"

# API execution
curl -X POST http://localhost:3001/api/unified/execute \
  -H "Content-Type: application/json" \
  -d '{"command": "gemini analyze requirements.txt"}'
```

### Security Validation
```python
# Validate code with MrWolf
POST /api/security/validate-code
{
  "code": "def process_data(user_input): ...",
  "language": "python"
}
```

## 🔒 Security

- **MrWolf Validation** - Comprehensive threat detection
- **Dependency Scanning** - Vulnerability checking
- **Compliance Checking** - OWASP, PCI DSS, GDPR
- **API Key Encryption** - Secure credential storage
- **Rate Limiting** - Protection against abuse

## 📊 Monitoring

- Real-time WebSocket updates
- Performance metrics tracking
- Agent status monitoring
- Task execution history
- System health checks

## 🧪 Testing

```bash
# Run frontend tests
cd frontend && pnpm test

# Run backend tests
cd backend && pytest

# Security scan
curl -X POST http://localhost:3001/api/security/full-report
```

## 📚 Documentation

- **Tutorial**: Open `tutorial.html` in your browser
- **Architecture**: View `architecture.html` for system design
- **API Docs**: http://localhost:3001/docs (when running)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Three.js for 3D visualization
- FastAPI for backend framework
- Anthropic, OpenAI, and Google for AI capabilities
- The open-source community

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/your-org/dirk-brain-portal/issues)
- **Discord**: [Join our community](https://discord.gg/dirk-brain)
- **Email**: support@dirkbrain.ai

---

Built with ❤️ by the DIRK Team