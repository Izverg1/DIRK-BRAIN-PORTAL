#!/bin/bash

# Start the DIRK Brain Portal backend server

echo "🚀 Starting DIRK Brain Portal Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    echo "📦 Installing dependencies..."
    pip install fastapi uvicorn python-multipart
else
    source venv/bin/activate
fi

# Kill any existing process on port 3001
lsof -ti:3001 | xargs kill -9 2>/dev/null

# Start the server
echo "✅ Backend server starting on http://localhost:3001"
python main.py