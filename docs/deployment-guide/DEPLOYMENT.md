# DIRK BRAIN Portal Deployment Guide

This guide provides instructions for deploying the DIRK BRAIN Portal to various environments.

## Table of Contents

1.  [Prerequisites](#1-prerequisites)
2.  [Local Development Deployment](#2-local-development-deployment)
3.  [Docker Deployment](#3-docker-deployment)
4.  [Kubernetes Deployment](#4-kubernetes-deployment)
5.  [Cloud Deployment (AWS, GCP, Azure)](#5-cloud-deployment-aws-gcp-azure)
6.  [Troubleshooting Deployment Issues](#6-troubleshooting-deployment-issues)

## 1. Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js (LTS version):** Required for the backend and frontend.
*   **pnpm:** Our preferred package manager (`npm install -g pnpm`).
*   **Python 3.x:** Required for the FastAPI backend.
*   **Docker (Optional):** For Docker deployments.
*   **kubectl (Optional):** For Kubernetes deployments.
*   **Cloud Provider CLI (Optional):** AWS CLI, gcloud CLI, Azure CLI for cloud deployments.

## 2. Local Development Deployment

For local development and testing, you can run the Node.js backend and Next.js frontend directly.

### 2.1 Backend Setup

1.  Navigate to the `backend/` directory:
    ```bash
    cd backend
    ```
2.  Install Node.js dependencies:
    ```bash
    pnpm install
    ```
3.  Start the Node.js backend server:
    ```bash
    node index.js
    ```
    The backend will typically run on `http://localhost:3002`.

### 2.2 Frontend Setup

1.  Open a new terminal and navigate to the `frontend/` directory:
    ```bash
    cd frontend
    ```
2.  Install Next.js dependencies:
    ```bash
    pnpm install
    ```
3.  Start the Next.js development server:
    ```bash
    pnpm run dev
    ```
    The frontend will typically run on `http://localhost:3000`.

### 2.3 Python FastAPI Backend (Optional)

If you plan to use the Python FastAPI backend, ensure you have Python 3.x and pip installed.

1.  Navigate to the `backend/` directory.
2.  Create and activate a Python virtual environment:
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```
3.  Install Python dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Start the FastAPI server:
    ```bash
    uvicorn main:app --host 0.0.0.0 --port 3001
    ```
    The FastAPI backend will typically run on `http://localhost:3001`.

## 3. Docker Deployment

To deploy the DIRK BRAIN Portal using Docker, you will need Docker installed and running on your system.

1.  **Build Docker Images:**
    Navigate to the respective `backend/` and `frontend/` directories and create `Dockerfile`s if they don't exist. Then build your images:
    ```bash
    # Example for backend
    docker build -t dirk-brain-backend:latest ./backend
    # Example for frontend
    docker build -t dirk-brain-frontend:latest ./frontend
    ```
2.  **Run Containers:**
    You can use `docker run` commands or `docker-compose` for multi-container deployments.
    ```bash
    # Example for backend
    docker run -d --name dirk-brain-backend -p 3002:3002 dirk-brain-backend:latest
    # Example for frontend
    docker run -d --name dirk-brain-frontend -p 3000:3000 dirk-brain-frontend:latest
    ```

    Alternatively, use the provided `scripts/deploy-to-docker.sh` script:
    ```bash
    ./scripts/deploy-to-docker.sh <project_path> <image_name> <container_name> [ports]
    ```

## 4. Kubernetes Deployment

For Kubernetes deployments, you will need a running Kubernetes cluster and `kubectl` configured to connect to it.

1.  **Prepare Kubernetes Manifests:**
    Review and customize the example Kubernetes manifest `scripts/deploy-to-k8s.yaml`.
    Replace placeholders like `<APP_NAME>`, `<REPLICA_COUNT>`, `<IMAGE_NAME>`, `<CONTAINER_PORT>`, and `<SERVICE_PORT>` with your specific values.

2.  **Apply Manifests:**
    ```bash
    kubectl apply -f scripts/deploy-to-k8s.yaml
    ```

## 5. Cloud Deployment (AWS, GCP, Azure)

Cloud deployments are more complex and typically involve specific cloud services (e.g., AWS ECS/EKS, GCP GKE/Cloud Run, Azure AKS/App Service).

*   **AWS:** Use `scripts/deploy-to-aws.sh` as a starting point. This script simulates the process of building and pushing Docker images to ECR and deploying to ECS.
    ```bash
    ./scripts/deploy-to-aws.sh <project_path> <aws_region> <ecr_repo_uri> <ecs_cluster_name> <ecs_service_name>
    ```
*   **GCP/Azure:** Placeholder scripts are not provided, but the `backend/CloudPlatformAdapters.js` class contains methods for simulated deployments to these platforms. You would typically use their respective CLIs or SDKs.

## 6. Troubleshooting Deployment Issues

*   **Check Logs:** Always check the logs of your backend and frontend services for error messages.
*   **Port Conflicts:** Ensure that the ports your applications are trying to use are not already in use.
*   **Dependency Issues:** Verify that all project dependencies are correctly installed.
*   **Environment Variables:** Confirm that all necessary environment variables are set correctly for your deployment environment.
*   **Firewall Rules:** Ensure that your firewall rules allow traffic to the ports your applications are listening on.
