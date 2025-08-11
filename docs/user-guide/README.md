# DIRK BRAIN Portal User Guide

Welcome to the DIRK BRAIN Portal! This guide will help you navigate and utilize the powerful features of our AI agent orchestration platform.

## Table of Contents

1.  [Getting Started](#getting-started)
2.  [Managing AI Agents](#managing-ai-agents)
3.  [Task Orchestration (GOD Mode)](#task-orchestration-god-mode)
4.  [Real-time Monitoring](#real-time-monitoring)
5.  [Deployment](#deployment)
6.  [Voice Commands](#voice-commands)
7.  [Troubleshooting](#troubleshooting)

## 1. Getting Started

### 1.1 Installation and Setup

Refer to the [Deployment Guide](DEPLOYMENT.md) for detailed instructions on setting up the DIRK BRAIN Portal on your system.

### 1.2 First Login

Upon successful installation, open your web browser and navigate to `http://localhost:3000` (or your configured address). You will be presented with the login screen.

## 2. Managing AI Agents

The Agent Universe provides a real-time 3D visualization of your AI agents. Each agent is represented by a unique 3D entity, with its size, color, and animations reflecting its current status, workload, and performance.

### 2.1 Agent Types

*   **DIRK.c (Cube):** Represents general-purpose computational agents.
*   **DIRK.g (Cylinder):** Represents agents specialized in graphical or generative tasks.
*   **DIRK.desktop (Sphere):** Represents agents with direct desktop interaction capabilities.

### 2.2 Monitoring Agent Status

*   **Workload:** The size of an agent entity dynamically adjusts based on its current workload. Larger agents indicate higher utilization.
*   **Performance:** The glow intensity and color of an agent indicate its performance. Green glow signifies high performance, while yellow or red may indicate stress or issues.
*   **Communication:** Pulsing animations and particle emissions around agents visualize active communication.

### 2.3 Interacting with Agents

*   **Hover:** Hovering over an agent will display its ID and basic information.
*   **Voice Commands:** Use voice commands to interact with agents, such as assigning tasks or requesting status updates.

## 3. Task Orchestration (GOD Mode)

The GOD Mode Orchestrator allows you to define complex tasks using natural language, which are then automatically decomposed into subtasks, assigned to optimal agents, and executed.

### 3.1 Decomposing Tasks

To decompose a task, use the voice command: "Analyze this [your task description] requirement."

Example: "Analyze this build a full-stack React app with authentication and real-time chat requirement."

The system will provide a structured breakdown of subtasks, their estimated complexity, and suggested agent assignments.

### 3.2 Managing Subtasks

Each subtask will have a status (pending, in-progress, completed) and dependencies on other subtasks. The system automatically manages the execution order based on these dependencies.

## 4. Real-time Monitoring

The portal provides immersive real-time visualizations of your AI operations.

### 4.1 Workflow Execution Stream

Observe tasks flowing between agents as animated particle streams. The color and speed of these streams indicate task status and data volume.

### 4.2 Data Tunnels

Visualize data transfer between agents as dynamic tunnels. Different colors represent different data types (e.g., red for code, green for metrics, blue for logs).

### 4.3 System Metrics Sphere

A central sphere dynamically changes size and color to reflect overall system CPU, memory, and network usage.

### 4.4 Interactive Network Topology

View the connections and communication strength between your agents in a dynamic network graph.

## 5. Deployment

The Deployment Engine allows you to deploy your projects to various environments.

### 5.1 Supported Targets

*   **Local:** For local development and testing.
*   **Docker:** Deploy your application as Docker containers.
*   **Kubernetes:** Deploy to a Kubernetes cluster.
*   **Cloud Platforms:** (Future) AWS, GCP, Azure integration.

### 5.2 Initiating Deployment

Use voice commands or the API to initiate deployments. Example voice command: "Deploy [project name] to [target environment]."

## 6. Voice Commands

The portal supports natural language voice commands for hands-free interaction.

### 6.1 General Commands

*   "Show help" or "Help me": Displays a list of available commands.
*   "Show me the [entity] status": e.g., "Show me the agent status."
*   "Switch to [mode] mode": e.g., "Switch to GOD mode."

### 6.2 Task Management

*   "Analyze this [task description] requirement."
*   "Create [task description] task."

### 6.3 Deployment

*   "Deploy [agent type] agent to [project name] project."

### 6.4 Process Control

*   "Start [process name]."
*   "Stop [process name]."

## 7. Troubleshooting

If you encounter issues, refer to the following:

*   **Logs:** Check the backend and frontend logs for error messages.
*   **Mr. Wolf Advisories:** Review Mr. Wolf's code analysis reports for potential issues.
*   **System Metrics:** Monitor the system metrics sphere for resource bottlenecks.

For further assistance, please contact support.