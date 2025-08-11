import { useState } from 'react';

interface VoiceCommand {
  action: string;
  target?: string;
  details?: any;
  agentType?: string;
  projectName?: string;
  entityType?: string;
  modeName?: string;
  requirementType?: string;
  taskDescription?: string;
  processName?: string;
  [key: string]: any;
}

class VoiceCommandProcessor {
  private commandPatterns: Array<{
    regex: RegExp;
    action: string;
    groups?: string[];
  }>;

  constructor() {
    // Define a simple set of command patterns and their corresponding actions
    this.commandPatterns = [
      { regex: /deploy (.*) agent to (.*) project/, action: 'deployAgentToProject', groups: ['agentType', 'projectName'] },
      { regex: /show me the (.*) status/, action: 'showStatus', groups: ['entityType'] },
      { regex: /switch to (.*) mode/, action: 'switchMode', groups: ['modeName'] },
      { regex: /analyze this (.*) requirement/, action: 'analyzeRequirement', groups: ['requirementType'] },
      { regex: /show help|help me/, action: 'showHelp' },
      { regex: /create (.*) task/, action: 'createTask', groups: ['taskDescription'] },
      { regex: /start (.*)/, action: 'startProcess', groups: ['processName'] },
      { regex: /stop (.*)/, action: 'stopProcess', groups: ['processName'] },
    ];
  }

  parseCommand(transcript: string): VoiceCommand | null {
    for (const pattern of this.commandPatterns) {
      const match = transcript.match(pattern.regex);
      if (match) {
        const command: VoiceCommand = { action: pattern.action };
        if (pattern.groups) {
          pattern.groups.forEach((groupName, index) => {
            command[groupName] = match[index + 1];
          });
        }
        return command;
      }
    }
    return null; // No matching command found
  }
}

export default VoiceCommandProcessor;
