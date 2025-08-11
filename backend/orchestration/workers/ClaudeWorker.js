/**
 * Claude Worker Process
 * Handles Anthropic Claude API interactions
 */

const axios = require('axios');

// Parse runtime configuration from command line
const runtime = JSON.parse(process.argv[2]);

class ClaudeWorker {
  constructor(config) {
    this.config = config;
    this.apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;
    this.model = config.model || 'claude-sonnet-4';
    this.systemPrompt = config.systemPrompt;
    this.maxTokens = config.maxTokens || 4096;
    this.temperature = config.temperature || 0.7;
  }

  async processTask(task) {
    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: this.model,
          max_tokens: this.maxTokens,
          temperature: this.temperature,
          system: this.systemPrompt,
          messages: [
            {
              role: 'user',
              content: this.formatTaskContent(task)
            }
          ]
        },
        {
          headers: {
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        content: response.data.content[0].text,
        usage: response.data.usage,
        model: this.model
      };
    } catch (error) {
      console.error('Claude API error:', error.response?.data || error.message);
      throw error;
    }
  }

  formatTaskContent(task) {
    if (typeof task === 'string') {
      return task;
    }
    
    return `
Task: ${task.description || 'Process the following'}
${task.requirements ? `Requirements: ${JSON.stringify(task.requirements, null, 2)}` : ''}
${task.context ? `Context: ${task.context}` : ''}
${task.data ? `Data: ${JSON.stringify(task.data, null, 2)}` : ''}

Please complete this task according to your role and provide detailed output.
    `;
  }
}

// Initialize worker
const worker = new ClaudeWorker(runtime);

// Handle messages from parent process
process.on('message', async (message) => {
  const { id, task } = message;
  
  try {
    const result = await worker.processTask(task);
    process.send({ id, result });
  } catch (error) {
    process.send({ id, error: error.message });
  }
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Claude worker shutting down');
  process.exit(0);
});

console.log(`Claude worker initialized with model: ${worker.model}`);