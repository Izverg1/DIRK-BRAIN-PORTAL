class MLAgentSelector {
  constructor() {
    this.agentScores = {}; // Stores historical performance scores for agents
  }

  /**
   * Selects the optimal agent for a given task based on capabilities and historical performance.
   * @param {object} task - The task object, potentially including complexity, required technologies, etc.
   * @param {Array<object>} agentCapabilities - An array of agent capability objects (e.g., [{ id: 'agent1', skills: ['react', 'frontend'] }])
   * @param {Array<object>} historicalPerformance - An array of historical performance data (e.g., [{ agentId: 'agent1', tasksCompleted: 10, successRate: 0.9 }])
   * @returns {object} - An object containing the selected agentId, confidence, and reasoning.
   */
  selectOptimalAgent(task, agentCapabilities, historicalPerformance) {
    let bestAgent = null;
    let highestScore = -1;

    // Update historical performance scores
    historicalPerformance.forEach(perf => {
      this.agentScores[perf.agentId] = perf.successRate * perf.tasksCompleted; // Simple scoring
    });

    for (const agent of agentCapabilities) {
      let currentScore = 0;
      let reasoning = [];

      // Factor in agent skills/capabilities matching task requirements
      if (task.requiredTechnologies) {
        const skillMatch = task.requiredTechnologies.filter(tech => agent.skills.includes(tech)).length;
        currentScore += skillMatch * 10; // Higher score for more matching skills
        if (skillMatch > 0) reasoning.push(`Matched ${skillMatch} required technologies.`);
      }

      // Factor in historical performance
      if (this.agentScores[agent.id]) {
        currentScore += this.agentScores[agent.id] * 50; // Scale historical performance
        reasoning.push(`Historical performance score: ${this.agentScores[agent.id].toFixed(2)}.`);
      }

      // Factor in task complexity (prefer agents with higher capacity for complex tasks)
      if (task.complexity === 'complex' && agent.capacity === 'high') {
        currentScore += 20;
        reasoning.push('Agent has high capacity for complex tasks.');
      } else if (task.complexity === 'medium' && (agent.capacity === 'high' || agent.capacity === 'medium')) {
        currentScore += 10;
        reasoning.push('Agent has suitable capacity for medium tasks.');
      }

      if (currentScore > highestScore) {
        highestScore = currentScore;
        bestAgent = { agentId: agent.id, confidence: currentScore / 100, reasoning: reasoning.join(' ') };
      }
    }

    if (!bestAgent) {
      // Fallback to a default agent if no optimal agent is found
      const defaultAgent = agentCapabilities[Math.floor(Math.random() * agentCapabilities.length)];
      return { agentId: defaultAgent.id, confidence: 0.1, reasoning: 'No specific optimal agent found, assigned default.' };
    }

    return bestAgent;
  }
}

module.exports = MLAgentSelector;
