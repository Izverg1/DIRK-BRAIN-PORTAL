#!/bin/bash

# DIRK Brain Portal Startup Script
# This script starts both backend and frontend servers

# Get the project root directory (parent of scripts folder)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🧠 Starting DIRK Brain Portal..."
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null
}

# Function to kill process on port
kill_port() {
    if check_port $1; then
        echo -e "${YELLOW}Port $1 is in use. Killing existing process...${NC}"
        lsof -ti:$1 | xargs kill -9 2>/dev/null
        sleep 1
    fi
}

# Clean up any existing processes
echo -e "${BLUE}Cleaning up existing processes...${NC}"
kill_port 3000
kill_port 3001

# Start Backend
echo -e "\n${BLUE}Starting Backend Server (FastAPI)...${NC}"
cd "$PROJECT_ROOT/backend"

# Check if venv exists
if [ -d "venv" ]; then
    source venv/bin/activate
    nohup python main.py > "$PROJECT_ROOT/logs/backend.log" 2>&1 &
    BACKEND_PID=$!
    echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
else
    echo -e "${RED}✗ Virtual environment not found!${NC}"
    echo "Please run: python3 -m venv venv && source venv/bin/activate && pip install fastapi uvicorn"
    exit 1
fi

# Start Frontend
echo -e "\n${BLUE}Starting Frontend Server (Next.js)...${NC}"
cd "$PROJECT_ROOT/frontend"

# Check if node_modules exists
if [ -d "node_modules" ]; then
    nohup pnpm dev > "$PROJECT_ROOT/logs/frontend.log" 2>&1 &
    FRONTEND_PID=$!
    echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"
else
    echo -e "${RED}✗ Node modules not found!${NC}"
    echo "Please run: pnpm install"
    exit 1
fi

# Wait for servers to start
echo -e "\n${BLUE}Waiting for servers to initialize...${NC}"
sleep 5

# Check if servers are running
echo -e "\n${BLUE}Checking server status...${NC}"

if curl -s http://localhost:3001/api/status > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend API is running at http://localhost:3001${NC}"
else
    echo -e "${RED}✗ Backend API failed to start${NC}"
    echo "Check logs/backend.log for errors"
fi

if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend is running at http://localhost:3000${NC}"
else
    echo -e "${RED}✗ Frontend failed to start${NC}"
    echo "Check logs/frontend.log for errors"
fi

echo -e "\n================================"
echo -e "${GREEN}🚀 CEREBRO is ready!${NC}"
echo -e "================================"
echo -e "${BLUE}Frontend (Cerebro UI):${NC} http://localhost:3000"
echo -e "${BLUE}Backend (API):${NC} http://localhost:3001"
echo -e "\n${YELLOW}Commands:${NC}"
echo "• deploy [agent] - Deploy a new agent"
echo "• analyze [task] - Analyze a task"
echo "• start godmode - Start the orchestrator"
echo "• status - Refresh system status"
echo -e "\n${YELLOW}To stop servers:${NC}"
echo "Run: ./scripts/stop.sh (or kill PIDs: $BACKEND_PID, $FRONTEND_PID)"
echo -e "\n${GREEN}Happy commanding your AI agents! 🧠⚡${NC}"