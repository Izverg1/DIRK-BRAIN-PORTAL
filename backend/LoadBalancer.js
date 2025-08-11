class LoadBalancer {
  constructor() {
    console.log('LoadBalancer initialized.');
    this.agents = {}; // Stores agent resources and load
  }

  /**
   * Registers an agent with the load balancer.
   * @param {string} agentId - The ID of the agent.
   * @param {object} resources - The resources available to the agent (e.g., { cpu: 100, memory: 1024 }).
   */
  registerAgent(agentId, resources) {
    this.agents[agentId] = { resources, currentLoad: 0, tasks: [] };
    console.log(`Agent ${agentId} registered with resources:`, resources);
  }

  /**
   * Assigns a task to an agent based on a simple load balancing algorithm (e.g., least loaded).
   * @param {object} task - The task to assign.
   * @returns {string | null} - The ID of the assigned agent, or null if no suitable agent is found.
   */
  assignTask(task) {
    let bestAgentId = null;
    let minLoad = Infinity;

    for (const agentId in this.agents) {
      const agent = this.agents[agentId];
      // Simple load calculation: number of tasks currently assigned
      if (agent.currentLoad < minLoad) {
        minLoad = agent.currentLoad;
        bestAgentId = agentId;
      }
    }

    if (bestAgentId) {
      this.agents[bestAgentId].currentLoad++;
      this.agents[bestAgentId].tasks.push(task.id);
      console.log(`Task ${task.id} assigned to agent ${bestAgentId}. Current load: ${this.agents[bestAgentId].currentLoad}`);
      return bestAgentId;
    } else {
      console.log('No suitable agent found for task assignment.');
      return null;
    }
  }

  /**
   * Releases a task from an agent, reducing its load.
   * @param {string} agentId - The ID of the agent.
   * @param {string} taskId - The ID of the task to release.
   */
  releaseTask(agentId, taskId) {
    if (this.agents[agentId]) {
      this.agents[agentId].currentLoad--;
      this.agents[agentId].tasks = this.agents[agentId].tasks.filter(id => id !== taskId);
      console.log(`Task ${taskId} released from agent ${agentId}. Current load: ${this.agents[agentId].currentLoad}`);
    }
  }

  /**
   * Simulates resource optimization (e.g., scaling up/down based on load).
   */
  optimizeResources() {
    console.log('Optimizing resources...');
    for (const agentId in this.agents) {
      const agent = this.agents[agentId];
      if (agent.currentLoad > 5 && agent.resources.cpu < 100) {
        console.log(`Agent ${agentId} is heavily loaded. Suggesting CPU scale-up.`);
        // In a real system, this would trigger a scaling action.
      } else if (agent.currentLoad < 2 && agent.resources.cpu > 50) {
        console.log(`Agent ${agentId} is underutilized. Suggesting CPU scale-down.`);
      }
    }
  }
}

module.exports = LoadBalancer;
