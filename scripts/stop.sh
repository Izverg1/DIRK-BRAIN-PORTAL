#!/bin/bash

# DIRK Brain Portal Stop Script
# This script stops both backend and frontend servers

echo "🛑 Stopping DIRK Brain Portal..."
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to kill process on port
kill_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        lsof -ti:$1 | xargs kill -9 2>/dev/null
        echo -e "${GREEN}✓ Stopped process on port $1${NC}"
    else
        echo -e "${BLUE}No process found on port $1${NC}"
    fi
}

# Stop Frontend
echo -e "${BLUE}Stopping Frontend (port 3000)...${NC}"
kill_port 3000

# Stop Backend
echo -e "${BLUE}Stopping Backend (port 3001)...${NC}"
kill_port 3001

# Also kill by process name as backup
pkill -f "pnpm dev" 2>/dev/null
pkill -f "python main.py" 2>/dev/null

echo -e "\n================================"
echo -e "${GREEN}✓ All servers stopped${NC}"
echo "================================"