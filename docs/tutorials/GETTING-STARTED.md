# Getting Started with DIRK BRAIN Portal

Welcome to the DIRK BRAIN Portal! This tutorial will guide you through the initial steps to get your environment set up and run your first task.

## 1. Prerequisites

Before you begin, make sure you have followed the [Deployment Guide](DEPLOYMENT.md) to set up the DIRK BRAIN Portal locally. You should have:

*   The Node.js backend running (typically on `http://localhost:3002`).
*   The Next.js frontend running (typically on `http://localhost:3000`).

## 2. Exploring the Agent Universe

Open your web browser and navigate to `http://localhost:3000`. You will see the main portal interface, featuring the 3D Agent Universe.

*   **Observe Agents:** Notice the different 3D shapes representing various AI agents (cubes for DIRK.c, cylinders for DIRK.g, spheres for DIRK.desktop).
*   **Dynamic Visuals:** Observe how agent size, glow, and particle effects change. These visuals reflect simulated workload, performance, and communication volume.
*   **Hover for Info:** Move your mouse over an agent to see its ID.

## 3. Your First Voice Command

The DIRK BRAIN Portal is designed for natural language interaction. Let's try a simple voice command.

1.  **Enable Listening:** Click the "Start Listening" button on the portal interface. The button will change to "Stop Listening" and you should see a "Listening..." indicator.
2.  **Speak a Command:** Clearly say one of the following commands:
    *   "Show help"
    *   "Show me the agent status"
3.  **Observe Feedback:** After you speak, the system will process your command and provide voice feedback (displayed as text on the screen).

## 4. Decomposing a Task with GOD Mode

Now, let's use the powerful GOD Mode Orchestrator to break down a complex task.

1.  **Enable Listening:** Ensure the "Start Listening" button is active.
2.  **Speak the Task:** Say the following command:
    *   "Analyze this build a simple login form requirement."
3.  **Review Output:** The system will process your request. In the backend console (where you ran `node index.js`), you should see logs indicating the task decomposition, including subtasks, their estimated complexity, and assigned agents.

    *Expected Backend Log Output (simplified example):*
    ```
    Decomposing task: Build a simple login form
    ... (NLP analysis details)
    ... (Subtask breakdown with assigned agents and dependencies)
    ```

## 5. Next Steps

You've successfully interacted with the DIRK BRAIN Portal! Here are some ideas for what to explore next:

*   **Experiment with Voice Commands:** Try other commands listed in the [User Guide](user-guide/README.md).
*   **Explore the API:** Refer to the [API Reference](API-REFERENCE.md) to understand how to interact with the backend programmatically.
*   **Simulate Deployments:** Use the deployment features to simulate deploying a project.
*   **Review Mr. Wolf Advisories:** Understand how Mr. Wolf analyzes code for quality and security issues.

For more advanced features and troubleshooting, refer to the other documentation sections.
