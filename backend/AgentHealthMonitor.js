class AgentHealthMonitor {
  constructor() {
    console.log('AgentHealthMonitor initialized.');
    this.agentsHealth = {}; // Stores health status of agents
    this.monitoringInterval = 5000; // Check every 5 seconds
    this.healthCheckTimer = null;
  }

  /**
   * Registers an agent for health monitoring.
   * @param {string} agentId - The ID of the agent.
   */
  registerAgent(agentId) {
    this.agentsHealth[agentId] = { isHealthy: true, lastCheck: Date.now(), failures: 0 };
    console.log(`Agent ${agentId} registered for health monitoring.`);
  }

  /**
   * Simulates a health check for a given agent.
   * In a real scenario, this would involve pinging the agent, checking its logs, etc.
   * @param {string} agentId - The ID of the agent.
   * @returns {boolean} - True if healthy, false otherwise.
   */
  _performHealthCheck(agentId) {
    // Simulate random failures for demonstration
    const isHealthy = Math.random() > 0.1; 
    if (!isHealthy) {
      this.agentsHealth[agentId].failures++;
      console.warn(`Agent ${agentId} failed health check. Total failures: ${this.agentsHealth[agentId].failures}`);
    }
    this.agentsHealth[agentId].isHealthy = isHealthy;
    this.agentsHealth[agentId].lastCheck = Date.now();
    return isHealthy;
  }

  /**
   * Attempts to auto-heal an unhealthy agent.
   * @param {string} agentId - The ID of the agent.
   * @returns {boolean} - True if healing was attempted, false otherwise.
   */
  _attemptAutoHeal(agentId) {
    console.log(`Attempting auto-heal for agent ${agentId}...`);
    // Simulate healing process (e.g., restarting the agent process)
    this.agentsHealth[agentId].isHealthy = true; // Assume healing is successful for now
    this.agentsHealth[agentId].failures = 0;
    console.log(`Agent ${agentId} auto-healed.`);
    return true;
  }

  /**
   * Starts the periodic health monitoring.
   */
  startMonitoring() {
    if (this.healthCheckTimer) {
      console.log('Agent health monitor already running.');
      return;
    }

    console.log(`Starting agent health monitor (interval: ${this.monitoringInterval / 1000} seconds).`);
    this.healthCheckTimer = setInterval(() => {
      for (const agentId in this.agentsHealth) {
        if (!this._performHealthCheck(agentId)) {
          // If agent is unhealthy, attempt to heal
          this._attemptAutoHeal(agentId);
        }
      }
    }, this.monitoringInterval);
  }

  /**
   * Stops the periodic health monitoring.
   */
  stopMonitoring() {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
      console.log('Agent health monitor stopped.');
    }
  }

  /**
   * Gets the current health status of all monitored agents.
   * @returns {object} - An object containing the health status of all agents.
   */
  getAgentsHealth() {
    return this.agentsHealth;
  }
}

module.exports = AgentHealthMonitor;
