// tests/unit/backend/test-godmode-orchestrator.js
const assert = require('assert');
const GodModeOrchestrator = require('../../../backend/GodModeOrchestrator');

describe('GodModeOrchestrator', () => {
  it('should decompose a simple task', async () => {
    const orchestrator = new GodModeOrchestrator();
    const result = await orchestrator.decomposeTask('Build a simple landing page');
    assert.strictEqual(result.complexity, 'simple');
    assert(result.subtasks.length > 0);
  });

  it('should decompose a complex React app task', async () => {
    const orchestrator = new GodModeOrchestrator();
    const result = await orchestrator.decomposeTask('Build a full-stack React app with authentication and real-time chat');
    assert.strictEqual(result.complexity, 'complex');
    assert(result.subtasks.some(s => s.name.includes('React project')));
    assert(result.subtasks.some(s => s.name.includes('authentication UI')));
    assert(result.subtasks.some(s => s.name.includes('backend authentication API')));
    assert(result.subtasks.some(s => s.name.includes('real-time chat')));
  });

  // Add more tests for different task types and edge cases
});
