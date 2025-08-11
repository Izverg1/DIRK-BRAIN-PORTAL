// tests/unit/frontend/test-voice-interface.test.tsx
import VoiceCommandProcessor from '../../../frontend/src/components/VoiceCommandProcessor';
import assert from 'assert';

describe('VoiceCommandProcessor', () => {
  it('should parse a deploy command', () => {
    const processor = new VoiceCommandProcessor();
    const command = processor.parseCommand('deploy claude agent to my react project');
    assert.strictEqual(command.action, 'deployAgentToProject');
    assert.strictEqual(command.agentType, 'claude');
    assert.strictEqual(command.projectName, 'my react');
  });

  it('should parse a show status command', () => {
    const processor = new VoiceCommandProcessor();
    const command = processor.parseCommand('show me the agent status');
    assert.strictEqual(command.action, 'showStatus');
    assert.strictEqual(command.entityType, 'agent');
  });

  // Add more tests for other commands and edge cases
});
