# DIRK BRAIN Portal API Reference

This document provides a comprehensive reference for the DIRK BRAIN Portal's backend API endpoints. The API is designed to allow programmatic interaction with the portal's AI agent orchestration, task management, and deployment functionalities.

## Base URL

`http://localhost:3002/api` (Node.js Backend)
`http://localhost:3001/api/python` (Python FastAPI Backend - accessed via Node.js API Gateway)

## Authentication

(Authentication details to be added here once implemented)

## Endpoints

### 1. Task Management

#### `GET /api/tasks`

Retrieves a list of all active and completed tasks.

*   **Response:** `200 OK` - `application/json` array of task objects.

#### `POST /api/tasks`

Adds a new task to the registry.

*   **Request Body:** `application/json`
    ```json
    {
      "task": {
        "name": "string",
        "description": "string",
        "priority": "low|medium|high"
      }
    }
    ```
*   **Response:** `201 Created` - `application/json` with the created task object.

#### `PUT /api/tasks/{taskId}`

Marks a task as complete.

*   **Parameters:**
    *   `taskId` (path): The ID of the task to complete.
*   **Response:** `200 OK` - `application/json` with the updated task object.

### 2. Agent Management

#### `GET /api/agents`

Retrieves the status of all active AI agents.

*   **Response:** `200 OK` - `application/json` array of agent status objects.

#### `POST /api/swarm/spawn`

Spawns a new AI agent.

*   **Request Body:** `application/json`
    ```json
    {
      "agentId": "string",
      "type": "DIRK.c|DIRK.g|DIRK.desktop"
    }
    ```
*   **Response:** `200 OK` - `application/json` with the spawned agent's details.

#### `POST /api/swarm/terminate/{agentId}`

Terminates an AI agent.

*   **Parameters:**
    *   `agentId` (path): The ID of the agent to terminate.
*   **Response:** `200 OK` - `text/plain` confirmation.

#### `GET /api/swarm/status`

Retrieves the status of all agents in the swarm.

*   **Response:** `200 OK` - `application/json` array of agent status objects.

### 3. GOD Mode Orchestration

#### `POST /api/godmode/decompose`

Decomposes a natural language task description into structured subtasks.

*   **Request Body:** `application/json`
    ```json
    {
      "taskDescription": "string"
    }
    ```
*   **Response:** `200 OK` - `application/json` with the decomposed task structure, including subtasks, complexity, and assigned agents.

### 4. Mr. Wolf Advisory

#### `POST /api/mrwolf/analyze`

Analyzes provided code for security vulnerabilities, code quality issues, and performance anti-patterns.

*   **Request Body:** `application/json`
    ```json
    {
      "code": "string" (the code to analyze)
    }
    ```
*   **Response:** `200 OK` - `application/json` array of advisory objects.

### 5. Credential Management

#### `POST /api/credentials/store`

Stores an encrypted service credential.

*   **Request Body:** `application/json`
    ```json
    {
      "serviceName": "string",
      "key": "string",
      "value": "string"
    }
    ```
*   **Response:** `200 OK` - `text/plain` confirmation.

#### `GET /api/credentials/list/{serviceName?}`

Lists stored credential keys for a given service, or all services if `serviceName` is omitted.

*   **Parameters:**
    *   `serviceName` (path, optional): The name of the service.
*   **Response:** `200 OK` - `application/json` array of credential keys.

#### `DELETE /api/credentials/remove/{serviceName}/{key}`

Removes a stored credential.

*   **Parameters:**
    *   `serviceName` (path): The name of the service.
    *   `key` (path): The key of the credential to remove.
*   **Response:** `200 OK` - `text/plain` confirmation.

### 6. Deployment

#### `POST /api/deploy/project`

Initiates a project deployment to a specified target.

*   **Request Body:** `application/json`
    ```json
    {
      "projectPath": "string",
      "projectType": "react|python|node.js",
      "target": "local|docker|kubernetes|aws|gcp|azure",
      "options": {} (target-specific options, e.g., ports, manifestPath)
    }
    ```
*   **Response:** `200 OK` - `application/json` with deployment status and details.

#### `POST /api/deploy/analyze`

Analyzes a project to determine its type and suggest deployment templates.

*   **Request Body:** `application/json`
    ```json
    {
      "projectPath": "string"
    }
    ```
*   **Response:** `200 OK` - `application/json` with `projectType` and `suggestedTemplates`.

### 7. Other Endpoints

*   `/api/log` (POST): Logs activity.
*   `/api/backup/trigger` (POST): Triggers a backup.
*   `/api/backup/status` (GET): Checks backup status.
*   `/api/redis/*`: Redis management endpoints.
*   `/api/integrate/*`: Service integration endpoints (Google, Brave, Supabase).
*   `/api/macos/*`: macOS desktop interaction endpoints.
*   `/api/agent-selector/select` (POST): Selects an optimal agent for a task.
*   `/api/predictive-failure/analyze` (POST): Analyzes system metrics for predictive failures.
*   `/api/self-learning-recovery/analyze-and-recover` (POST): Analyzes failure events and suggests recovery actions.
*   `/api/load-balancer/*`: Load balancer management endpoints.
*   `/api/performance-analytics/*`: Performance analytics endpoints.
*   `/api/agent-personality/*`: Agent personality modeling endpoints.
*   `/api/dirk-safety-hooks/evaluate-action` (POST): Evaluates actions against safety hooks.
*   `/api/code-quality-review/review` (POST): Performs code quality review.
*   `/api/security-validation/validate` (POST): Performs security validation.
*   `/api/workflow/execute` (POST): Executes a workflow.
