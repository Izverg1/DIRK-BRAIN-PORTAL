class AdaptiveLoadBalancer {
  constructor() {
    console.log('AdaptiveLoadBalancer initialized.');
    this.agents = {}; // Stores agent status and workload
  }

  /**
   * Registers an agent with the load balancer.
   * @param {string} agentId - Unique ID of the agent.
   * @param {object} capabilities - Agent's capabilities (e.g., skills, capacity).
   */
  registerAgent(agentId, capabilities) {
    this.agents[agentId] = { ...capabilities, workload: 0, lastUpdated: Date.now() };
    console.log(`Agent ${agentId} registered.`);
  }

  /**
   * Updates an agent's workload and status.
   * @param {string} agentId - Unique ID of the agent.
   * @param {number} workload - Current workload of the agent (e.g., number of active tasks).
   * @param {object} metrics - Current resource metrics (e.g., cpu, memory).
   */
  updateAgentStatus(agentId, workload, metrics) {
    if (this.agents[agentId]) {
      this.agents[agentId].workload = workload;
      this.agents[agentId].metrics = metrics;
      this.agents[agentId].lastUpdated = Date.now();
      // Simple health check based on metrics
      if (metrics.cpu > 80 || metrics.memory > 80) {
        this.agents[agentId].health = 'stressed';
      } else {
        this.agents[agentId].health = 'healthy';
      }
    }
  }

  /**
   * Assigns a task to the most suitable agent based on current workload and capabilities.
   * @param {object} task - The task to be assigned.
   * @returns {string|null} - The ID of the assigned agent, or null if no suitable agent is found.
   */
  assignTask(task) {
    let bestAgentId = null;
    let minWorkload = Infinity;

    for (const agentId in this.agents) {
      const agent = this.agents[agentId];
      // Consider only healthy agents with matching capabilities (simplified)
      if (agent.health === 'healthy' && agent.capabilities.skills.includes(task.requiredSkill)) {
        if (agent.workload < minWorkload) {
          minWorkload = agent.workload;
          bestAgentId = agentId;
        }
      }
    }

    if (bestAgentId) {
      this.agents[bestAgentId].workload++; // Increment workload for assigned agent
      console.log(`Task assigned to agent ${bestAgentId}.`);
    }
    return bestAgentId;
  }

  /**
   * Optimizes resource distribution by re-assigning tasks or scaling agents.
   * This is a placeholder for more complex optimization algorithms.
   */
  optimizeResources() {
    console.log('Optimizing resources...');
    // Identify overloaded agents and underutilized agents
    const overloadedAgents = Object.values(this.agents).filter(agent => agent.health === 'stressed');
    const underutilizedAgents = Object.values(this.agents).filter(agent => agent.workload === 0 && agent.health === 'healthy');

    if (overloadedAgents.length > 0 && underutilizedAgents.length > 0) {
      console.log('Attempting to re-distribute tasks from overloaded to underutilized agents.');
      // In a real system, this would involve task migration logic
    } else if (overloadedAgents.length > 0) {
      console.log('Consider spawning new agents to handle load.');
      // Trigger agent spawning mechanism
    } else if (underutilizedAgents.length > 1) {
      console.log('Consider terminating underutilized agents.');
      // Trigger agent termination mechanism
    }
  }
}

module.exports = AdaptiveLoadBalancer;
