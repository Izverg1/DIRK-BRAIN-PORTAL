#!/bin/bash

# DIRK Brain Portal - Working Startup Script
# This script starts the WORKING components of the platform

echo "🚀 Starting DIRK Brain Portal - WORKING VERSION"
echo "==============================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${RED}Port $1 is already in use${NC}"
        return 1
    else
        echo -e "${GREEN}Port $1 is available${NC}"
        return 0
    fi
}

# Check required ports
echo -e "${BLUE}Checking ports...${NC}"
check_port 3000 || echo "Frontend port 3000 in use (may need to kill existing process)"
check_port 3001 || echo "Backend port 3001 in use (may need to kill existing process)"

# Kill any existing processes
echo -e "${BLUE}Cleaning up existing processes...${NC}"
pkill -f "python.*main_working"
pkill -f "next.*dev"
sleep 2

# Start Backend (FastAPI)
echo -e "${BLUE}Starting FastAPI Backend...${NC}"
cd backend
if [ ! -d "venv" ]; then
    echo -e "${RED}Virtual environment not found. Creating...${NC}"
    python3 -m venv venv
fi

source venv/bin/activate
pip install -q fastapi uvicorn python-dotenv

echo -e "${GREEN}Starting backend on http://localhost:3001${NC}"
python main_working.py &
BACKEND_PID=$!

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 3

# Test backend
if curl -s http://localhost:3001/api/status > /dev/null; then
    echo -e "${GREEN}✅ Backend is running at http://localhost:3001${NC}"
    echo -e "${GREEN}📋 API Documentation at http://localhost:3001/docs${NC}"
else
    echo -e "${RED}❌ Backend failed to start${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Start Frontend (Next.js)
echo -e "${BLUE}Starting Next.js Frontend...${NC}"
cd ../frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${RED}Node modules not found. Installing...${NC}"
    npm install
fi

echo -e "${GREEN}Starting frontend on http://localhost:3000${NC}"
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
echo "Waiting for frontend to start..."
sleep 5

# Test frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ Frontend is running at http://localhost:3000${NC}"
else
    echo -e "${RED}❌ Frontend failed to start${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo "🎉 DIRK Brain Portal is now running!"
echo "================================="
echo -e "${GREEN}🌐 Frontend:${NC} http://localhost:3000"
echo -e "${GREEN}🔧 Backend API:${NC} http://localhost:3001"
echo -e "${GREEN}📋 API Docs:${NC} http://localhost:3001/docs"
echo ""
echo -e "${BLUE}What works now:${NC}"
echo "✅ FastAPI Backend with real API endpoints"
echo "✅ Next.js Frontend that compiles and runs"
echo "✅ Agent creation and management"
echo "✅ Pod deployment system"  
echo "✅ Real-time analytics dashboard"
echo "✅ Drag-and-drop interface"
echo "✅ 3D visualizations"
echo ""
echo -e "${BLUE}To stop the services:${NC}"
echo "Press Ctrl+C or run: pkill -f 'python.*main_working|next.*dev'"
echo ""

# Keep script running and show logs
trap 'echo -e "\n${RED}Stopping services...${NC}"; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' INT

echo -e "${BLUE}Services are running. Press Ctrl+C to stop.${NC}"
wait