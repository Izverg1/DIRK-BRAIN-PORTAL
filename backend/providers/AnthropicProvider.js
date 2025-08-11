const axios = require('axios');

class AnthropicProvider {
  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY;
    this.baseURL = 'https://api.anthropic.com/v1';
    this.models = {
      'claude-opus-4.1': { maxTokens: 200000, capabilities: ['code', 'analysis', 'planning'] },
      'claude-sonnet-4': { maxTokens: 200000, capabilities: ['code', 'documentation'] },
      'claude-haiku-3.5': { maxTokens: 200000, capabilities: ['quick_tasks', 'validation'] }
    };
  }

  async createAgent(config) {
    const agent = {
      id: `anthropic-${Date.now()}`,
      provider: 'anthropic',
      model: config.model || 'claude-sonnet-4',
      role: config.role,
      capabilities: this.models[config.model]?.capabilities || [],
      status: 'ready',
      config: config
    };

    return agent;
  }

  async executeTask(agent, task) {
    try {
      const response = await axios.post(
        `${this.baseURL}/messages`,
        {
          model: agent.model,
          max_tokens: 4096,
          messages: [
            {
              role: 'user',
              content: this.formatTaskPrompt(task, agent.role)
            }
          ],
          system: this.getSystemPrompt(agent.role)
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
        success: true,
        output: response.data.content[0].text,
        usage: response.data.usage,
        model: agent.model,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Anthropic API error:', error);
      return {
        success: false,
        error: error.message,
        model: agent.model,
        timestamp: new Date().toISOString()
      };
    }
  }

  formatTaskPrompt(task, role) {
    return `
Role: ${role}
Task: ${task.description}
Requirements: ${JSON.stringify(task.requirements, null, 2)}
${task.context ? `Context: ${task.context}` : ''}

Please complete this task according to your role and provide detailed output.
    `;
  }

  getSystemPrompt(role) {
    const prompts = {
      'architect': 'You are a senior software architect. Design scalable, maintainable solutions.',
      'developer': 'You are an expert developer. Write clean, efficient, well-tested code.',
      'reviewer': 'You are a code reviewer. Analyze code for bugs, security issues, and best practices.',
      'documenter': 'You are a technical writer. Create clear, comprehensive documentation.',
      'tester': 'You are a QA engineer. Design and implement thorough test cases.'
    };
    
    return prompts[role] || 'You are an AI assistant helping with software development tasks.';
  }

  async verifyOutput(output, criteria) {
    // Use Claude to self-verify its output
    const verificationTask = {
      description: 'Verify the following output meets the specified criteria',
      requirements: criteria,
      context: output
    };

    const verifier = await this.createAgent({ model: 'claude-haiku-3.5', role: 'reviewer' });
    return await this.executeTask(verifier, verificationTask);
  }
}

module.exports = AnthropicProvider;