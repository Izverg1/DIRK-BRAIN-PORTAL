class AgentSelector {
  constructor() {
    console.log('AgentSelector initialized.');
    this.availableAgents = [
      { id: 'agent-alpha', skills: ['coding', 'testing'], performance: 0.8 },
      { id: 'agent-beta', skills: ['design', 'documentation'], performance: 0.9 },
      { id: 'agent-gamma', skills: ['coding', 'deployment'], performance: 0.7 },
    ];
  }

  /**
   * Simulates machine learning-based agent selection.
   * In a real scenario, this would involve a trained ML model.
   * @param {object} task - The task object to select an agent for.
   * @returns {object | null} - The selected agent or null if no suitable agent is found.
   */
  selectAgent(task) {
    console.log(`Selecting agent for task: ${task.name || task.description}`);

    // Simple heuristic for demonstration: select agent with highest performance
    // and relevant skills.
    let bestAgent = null;
    let highestScore = -1;

    for (const agent of this.availableAgents) {
      let score = agent.performance;

      // Boost score if agent has relevant skills (placeholder for ML feature matching)
      if (task.requiredSkills) {
        for (const skill of task.requiredSkills) {
          if (agent.skills.includes(skill)) {
            score += 0.1; // Small boost for each matching skill
          }
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestAgent = agent;
      }
    }

    if (bestAgent) {
      console.log(`Selected agent: ${bestAgent.id}`);
      return bestAgent;
    } else {
      console.log('No suitable agent found.');
      return null;
    }
  }
}

module.exports = AgentSelector;