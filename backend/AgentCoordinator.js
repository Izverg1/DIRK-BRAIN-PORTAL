const fs = require('fs').promises;
const path = require('path');

class AgentCoordinator {
  constructor() {
    this.taskRegistryPath = path.join(__dirname, 'dirk_protocol', 'task_registry.json');
  }

  async _readRegistry() {
    const data = await fs.readFile(this.taskRegistryPath, 'utf8');
    return JSON.parse(data);
  }

  async getAgentStatus() {
    try {
      const registry = await this._readRegistry();
      return registry.agents;
    } catch (error) {
      console.error('Error reading agent status:', error);
      return null;
    }
  }
}

module.exports = AgentCoordinator;
