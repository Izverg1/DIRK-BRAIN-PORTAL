class AgentPersonalityModel {
  constructor() {
    console.log('AgentPersonalityModel initialized.');
    this.personalities = {}; // Stores personality profiles for agents
  }

  /**
   * Defines or updates an agent's personality.
   * @param {string} agentId - The ID of the agent.
   * @param {object} traits - An object defining personality traits (e.g., { adventurous: 0.8, cautious: 0.2 }).
   */
  definePersonality(agentId, traits) {
    this.personalities[agentId] = { ...traits };
    console.log(`Personality defined for agent ${agentId}:`, traits);
  }

  /**
   * Simulates how an agent's personality might influence its behavior for a given task.
   * @param {string} agentId - The ID of the agent.
   * @param {object} task - The task the agent is considering.
   * @returns {object} - Suggested behavior modifications based on personality.
   */
  predictBehavior(agentId, task) {
    const personality = this.personalities[agentId];
    if (!personality) {
      console.log(`No personality defined for agent ${agentId}.`);
      return { modification: 'none' };
    }

    console.log(`Predicting behavior for agent ${agentId} on task ${task.name || task.id} with personality:`, personality);

    let modification = 'none';
    if (personality.adventurous > 0.7 && task.riskLevel === 'high') {
      modification = 'Agent is likely to take on high-risk tasks with enthusiasm.';
    } else if (personality.cautious > 0.7 && task.riskLevel === 'high') {
      modification = 'Agent is likely to approach high-risk tasks with caution and seek more data.';
    }

    return { modification };
  }
}

module.exports = AgentPersonalityModel;
