# DIRK BRAIN Portal: New Developer Setup Guide

Welcome to the DIRK BRAIN Portal project! This guide will walk you through setting up your development environment and getting the application running.

## Project Overview

The DIRK BRAIN Portal is a local web application designed to augment software development workflows. It provides a web-based interface for managing AI-augmented development, including API key management, custom command/hook creation, and AI orchestration.

This project is structured as follows:
-   **`frontend/`**: Contains the Next.js (React) application for the web user interface.
-   **`backend/`**: Contains the server-side application that handles API requests, interacts with the local system, and orchestrates AI agents.
-   **`dirk_protocol/`**: (Located within `backend/`) Contains the core DIRK Brain scripts and utilities, copied from the original DIRK Brain project.

### Key Technology Decisions

Initially, the backend was planned with Node.js. However, due to persistent environment-specific issues encountered with Node.js and its native module compilation on the development system, we have made a strategic decision to **pivot the backend technology to Python with FastAPI**. This ensures a more robust and reliable development experience.

## Your Mission: Get the Portal Running

Your primary task is to set up this project, ensuring the Python/FastAPI backend is operational and serving the Next.js frontend.

---

## Step-by-Step Setup Instructions

**Important:** All commands should be executed from the root of the `dirk-brain-portal` project (`/Users/izverg/projects/dirk-brain-portal`).

### Phase 1: Backend Setup (Python/FastAPI)

This phase involves cleaning up any old Node.js artifacts and setting up the new Python-based backend.

**1. Clean Up Old Node.js Artifacts**

Navigate into the `backend/` directory and remove all Node.js-related files and dependencies.

```bash
rm -rf backend/node_modules backend/package.json backend/pnpm-lock.yaml backend/index.js backend/db.json backend/server.log backend/heartbeat.js
```

**2. Set Up Python Virtual Environment**

Create and activate a Python virtual environment within the `backend/` directory.

```bash
python3 -m venv backend/venv
source backend/venv/bin/activate
```

**3. Install Python Dependencies**

Install FastAPI and Uvicorn (the ASGI server for FastAPI) into your virtual environment.

```bash
pip install fastapi "uvicorn[standard]"
```

**4. Create FastAPI Application File (`main.py`)**

Create the main application file for your FastAPI backend. This file will contain the server logic, including serving the frontend.

```python
# File: backend/main.py
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

app = FastAPI()

# Serve static files from the frontend build directory
# Ensure this path is correct relative to where main.py is executed
frontend_dist_path = os.path.join(os.path.dirname(__file__), '../frontend/out')

# Check if the frontend_dist_path exists
if not os.path.exists(frontend_dist_path):
    print(f"Warning: Frontend build directory not found at {frontend_dist_path}")
    print("Please ensure you have run 'pnpm build' in the frontend directory.")

app.mount("/static", StaticFiles(directory=frontend_dist_path), name="static")

@app.get("/api/status")
async def get_status():
    return {"status": "DIRK BRAIN Portal Backend (FastAPI) is running!"}

@app.get("/")
async def serve_frontend():
    # Serve the main index.html for the frontend
    index_html_path = os.path.join(frontend_dist_path, 'index.html')
    # Fallback for Next.js static export: serve the root directory's index.html if it exists
    # Next.js app router static export might place index.html directly in 'out' or in a subdirectory
    if os.path.exists(index_html_path):
        return FileResponse(index_html_path)
    else:
        # If index.html is not directly at root, try serving the default page.html or similar
        # This is a common pattern for Next.js static exports with app router
        # You might need to adjust this based on the exact Next.js build output
        return FileResponse(os.path.join(frontend_dist_path, 'page.html')) # Common fallback
        # Or, if your root page is a directory, you might need to serve out/index/page.html or similar
        # For now, we'll assume index.html or page.html at the root of 'out'

# You will add more API endpoints here for API key management, commands, etc.

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3001)
```

### Phase 2: Frontend Build

This phase ensures the Next.js frontend is built and ready to be served by the FastAPI backend.

**1. Install Frontend Dependencies**

Navigate into the `frontend/` directory and install its dependencies.

```bash
pnpm install
```

**2. Build Frontend Application**

Build the Next.js frontend application for production. This will generate the static files in `frontend/out`.

```bash
pnpm build
```

### Phase 3: Start the Portal

Once both backend and frontend are set up, you can start the FastAPI server.

**1. Start Backend Server**

Navigate back to the `backend/` directory (if you're not already there) and start the FastAPI server.

```bash
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 3001
```

---

You should now be able to access the DIRK BRAIN Portal by navigating to `http://localhost:3001` in your web browser.

Remember to keep the FastAPI server running in your terminal while developing. For background execution, you might use `nohup` or a process manager like `pm2` (after installation).
