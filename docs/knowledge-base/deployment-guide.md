# DIRK BRAIN Portal - Deployment Guide

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- **Docker** 20.10+ and Docker Compose
- **Node.js** 18+ and npm/yarn
- **Python** 3.11+ and pip
- **Git** for repository access

### One-Script Deployment (Recommended)

```bash
# Download and run the installer
curl -sSL https://dirk-brain.com/install | bash

# Or manual download
wget https://dirk-brain.com/install.sh
chmod +x install.sh
./install.sh
```

### Manual Deployment

```bash
# 1. Clone the repository
git clone https://github.com/dirk-brain/portal.git
cd dirk-brain-portal

# 2. Run deployment script
chmod +x deploy-dirk-brain.sh
./deploy-dirk-brain.sh

# 3. Access the portal
open http://localhost:3000
```

## ⚙️ Configuration

### Environment Variables

Create `.env` file in the project root:

```bash
# API Keys (Required)
CLAUDE_API_KEY=your_claude_key_here
GEMINI_API_KEY=your_gemini_key_here
OPENAI_API_KEY=your_openai_key_here

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/dirkbrain
REDIS_URL=redis://localhost:6379

# Application Settings
NODE_ENV=production
PORT=3000
API_PORT=8000

# Security
JWT_SECRET=your_secure_jwt_secret
ENCRYPTION_KEY=your_encryption_key

# Features (Optional)
ENABLE_VOICE_CONTROL=true
ENABLE_3D_VISUALIZATION=true
ENABLE_PREDICTIVE_AI=true
```

### Advanced Configuration

```yaml
# dirk-brain-config.yml
deployment:
  mode: "production"  # development, staging, production
  port: 3000
  ssl: true
  domain: "your-domain.com"

agents:
  claude:
    enabled: true
    model: "claude-3-sonnet"
    max_tokens: 4000
  gemini:
    enabled: true
    model: "gemini-pro"
    temperature: 0.7
  gpt4:
    enabled: true
    model: "gpt-4-turbo"
    max_tokens: 4000

features:
  voice_control: true
  gesture_recognition: false
  holographic_ui: true
  predictive_analytics: true
  enterprise_security: true

database:
  postgresql:
    host: "localhost"
    port: 5432
    database: "dirkbrain"
    pool_size: 20
  redis:
    host: "localhost"
    port: 6379
    db: 0

monitoring:
  enabled: true
  metrics_port: 9090
  health_check_interval: 30
```

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - backend
      - realtime

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/dirkbrain
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  realtime:
    build: ./realtime
    ports:
      - "8001:8001"
    depends_on:
      - redis

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=dirkbrain
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Deploy with Docker

```bash
# Build and start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## ☸️ Kubernetes Deployment

### Kubernetes Manifests

```yaml
# k8s/deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dirk-brain-portal
spec:
  replicas: 3
  selector:
    matchLabels:
      app: dirk-brain-portal
  template:
    metadata:
      labels:
        app: dirk-brain-portal
    spec:
      containers:
      - name: frontend
        image: dirkbrain/portal-frontend:latest
        ports:
        - containerPort: 3000
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
      - name: backend
        image: dirkbrain/portal-backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
```

### Deploy to Kubernetes

```bash
# Apply configurations
kubectl apply -f k8s/

# Check deployment status
kubectl get deployments
kubectl get pods
kubectl get services

# Access the application
kubectl port-forward service/dirk-brain-portal 3000:3000
```

## 🏢 Enterprise Deployment

### High Availability Setup

```bash
# Deploy with load balancing and auto-scaling
dirk deploy --environment enterprise \
  --replicas 5 \
  --load-balancer nginx \
  --auto-scaling enabled \
  --monitoring prometheus \
  --logging elasticsearch

# Configure SSL/TLS
dirk ssl --domain your-domain.com \
  --cert-manager letsencrypt \
  --force-https true

# Set up backup and disaster recovery
dirk backup --schedule "0 2 * * *" \
  --retention 30d \
  --storage s3://your-backup-bucket
```

### Security Hardening

```bash
# Enable enterprise security features
dirk security --enable-all \
  --audit-logging true \
  --encryption-at-rest true \
  --network-policies strict \
  --rbac enabled

# Configure OAuth providers
dirk auth --provider google \
  --client-id your-client-id \
  --client-secret your-client-secret

dirk auth --provider azure \
  --tenant-id your-tenant-id \
  --client-id your-client-id
```

## 🔧 Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check what's using port 3000
lsof -i :3000

# Kill process if needed
kill -9 $(lsof -t -i:3000)

# Use different port
PORT=3001 npm start
```

#### Database Connection Issues
```bash
# Check PostgreSQL status
pg_isready -h localhost -p 5432

# Reset database
dropdb dirkbrain
createdb dirkbrain
npm run db:migrate
```

#### Agent API Key Issues
```bash
# Test API keys
dirk test-agents --verbose

# Update API keys
dirk config set CLAUDE_API_KEY "new-key"
dirk config set GEMINI_API_KEY "new-key"
```

### Health Checks

```bash
# System health check
curl http://localhost:3000/health

# API health check
curl http://localhost:8000/api/health

# Agent status check
curl http://localhost:8000/api/agents/status
```

### Logs and Monitoring

```bash
# View application logs
docker-compose logs -f frontend
docker-compose logs -f backend

# Monitor system resources
docker stats

# Check agent performance
curl http://localhost:8000/api/metrics
```

## 📊 Performance Optimization

### Production Optimizations

```bash
# Enable production optimizations
NODE_ENV=production npm run build

# Configure caching
REDIS_CACHE_TTL=3600
ENABLE_QUERY_CACHE=true

# Optimize database
npm run db:optimize
npm run db:index
```

### Scaling Configuration

```yaml
# Auto-scaling configuration
scaling:
  min_replicas: 2
  max_replicas: 10
  target_cpu: 70
  target_memory: 80
  
load_balancer:
  algorithm: "round_robin"
  health_check: "/health"
  timeout: 30s
```

---

## 🎯 Quick Reference

| Command | Description |
|---------|-------------|
| `dirk status` | Check system status |
| `dirk logs` | View application logs |
| `dirk restart` | Restart all services |
| `dirk update` | Update to latest version |
| `dirk backup` | Create system backup |
| `dirk restore` | Restore from backup |

**Support:** For deployment issues, check the troubleshooting guide or contact support at support@dirk-brain.com