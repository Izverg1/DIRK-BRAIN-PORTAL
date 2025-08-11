# Troubleshooting DIRK BRAIN Portal

This guide provides solutions to common issues you might encounter while using or deploying the DIRK BRAIN Portal.

## Table of Contents

1.  [General Troubleshooting Steps](#1-general-troubleshooting-steps)
2.  [Backend Issues](#2-backend-issues)
3.  [Frontend Issues](#3-frontend-issues)
4.  [Deployment Issues](#4-deployment-issues)
5.  [Voice Command Issues](#5-voice-command-issues)
6.  [Mr. Wolf Advisories](#6-mr-wolf-advisories)

## 1. General Troubleshooting Steps

Before diving into specific issues, try these general steps:

*   **Restart Services:** Often, simply restarting the Node.js backend and Next.js frontend can resolve transient issues.
*   **Check Console Logs:** Both the backend and frontend provide detailed logs in their respective console windows. Look for `ERROR` or `WARNING` messages.
*   **Verify Network Connection:** Ensure your machine has a stable internet connection if external services are being accessed.
*   **Check Port Availability:** Make sure that ports `3000` (frontend) and `3002` (Node.js backend) are not being used by other applications.

## 2. Backend Issues

### 2.1 Backend Server Not Starting

*   **Error Message:** `Error: listen EADDRINUSE: address already in use :::3002`
    *   **Solution:** Another process is using port 3002. Find and terminate that process, or change the port in `backend/index.js`.
*   **Error Message:** `Cannot find module 'natural'` (or similar for `compromise`, `sentiment`, `eslint`, etc.)
    *   **Solution:** The required Node.js dependencies are not installed. Navigate to the `backend/` directory and run `pnpm install`.
*   **Error Message:** `Error: connect ECONNREFUSED 127.0.0.1:3001` (if using FastAPI backend)
    *   **Solution:** The Python FastAPI backend is not running or is not accessible. Ensure it's started on `http://localhost:3001`.

### 2.2 API Endpoints Not Responding

*   **Symptom:** Frontend requests to `/api/...` endpoints fail or return unexpected data.
*   **Solution:**
    *   Verify the Node.js backend is running.
    *   Check the backend console for any errors related to the specific API endpoint.
    *   Use a tool like Postman or `curl` to directly test the API endpoint to isolate the issue.

## 3. Frontend Issues

### 3.1 Frontend Not Loading or Blank Screen

*   **Symptom:** Browser shows a blank page or an error when navigating to `http://localhost:3000`.
*   **Solution:**
    *   Check the frontend development server console for errors.
    *   Ensure all frontend dependencies are installed (`pnpm install` in `frontend/`).
    *   Clear your browser cache.

### 3.2 3D Agent Universe Not Displaying Correctly

*   **Symptom:** 3D models are missing, animations are choppy, or the canvas is blank.
*   **Solution:**
    *   Ensure your graphics drivers are up to date.
    *   Check for WebGL support in your browser. You can usually find this in `chrome://gpu` for Chrome or `about:support` for Firefox.
    *   Verify that the backend is sending valid agent data to the frontend. Check your browser's network tab for requests to `/api/agents`.
    *   Reduce the number of simulated agents or particles in the code for lower-end hardware.

## 4. Deployment Issues

### 4.1 Docker Deployment Failures

*   **Error Message:** `docker build failed` or `docker run failed`
    *   **Solution:**
        *   Ensure Docker Desktop (or Docker Engine) is running.
        *   Check the `Dockerfile` for syntax errors.
        *   Verify that the project path provided to the deployment script is correct.
        *   Check for port conflicts if the container fails to start.

### 4.2 Kubernetes Deployment Failures

*   **Error Message:** `kubectl apply failed`
    *   **Solution:**
        *   Ensure your Kubernetes cluster is running and `kubectl` is configured correctly.
        *   Validate your Kubernetes manifest file (`.yaml`) for syntax errors or incorrect configurations.
        *   Check `kubectl describe pod <pod-name>` for more detailed error messages.

### 4.3 Cloud Deployment Issues

*   **Symptom:** Deployment to AWS, GCP, or Azure fails or resources are not created.
*   **Solution:**
    *   Verify your cloud provider CLI is installed and configured with the correct credentials and region.
    *   Check the cloud provider's console for deployment logs and error messages.
    *   Ensure you have the necessary IAM permissions for the deployment actions.

## 5. Voice Command Issues

### 5.1 Voice Recognition Not Working

*   **Symptom:** Clicking "Start Listening" does nothing, or no transcript appears.
*   **Solution:**
    *   **Browser Support:** The Web Speech API is primarily supported in Chrome. Try using Chrome if you are not already.
    *   **Microphone Access:** Ensure your browser has permission to access your microphone. Check your browser's site settings.
    *   **Microphone Hardware:** Verify your microphone is connected and working correctly.

### 5.2 Commands Not Recognized

*   **Symptom:** Voice commands are transcribed, but the system responds with "Command not recognized."
*   **Solution:**
    *   **Clarity:** Speak clearly and articulate your words.
    *   **Exact Phrasing:** Refer to the [User Guide](user-guide/README.md) for the exact phrasing of supported commands. The `VoiceCommandProcessor` is pattern-based and requires specific syntax.
    *   **Backend Logs:** Check the backend logs for what the `VoiceCommandProcessor` is receiving and how it's attempting to parse it.

## 6. Mr. Wolf Advisories

### 6.1 Understanding Advisories

Mr. Wolf provides advisories on code quality, security, and performance. These are not always errors but suggestions for improvement.

*   **Severity Levels:**
    *   `INFO`: Minor suggestions, good practices.
    *   `WARNING`: Potential issues that should be reviewed.
    *   `CRITICAL`: High-priority issues, especially security vulnerabilities, that require immediate attention.

### 6.2 Addressing Advisories

*   **Code Quality:** Refactor long functions, implement proper logging instead of `console.log`, address `FIXME` comments.
*   **Security:** Sanitize all user inputs, avoid hardcoded credentials, use secure coding practices.
*   **Performance:** Optimize loops, use appropriate data structures, manage asynchronous operations efficiently.

If you encounter an issue not covered here, please consult the project's issue tracker or contact the development team for support.
