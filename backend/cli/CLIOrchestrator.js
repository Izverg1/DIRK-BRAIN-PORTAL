/**
 * CLI Orchestrator - Manages execution of CLI tools like Claude Code CLI, Gemini CLI, etc.
 * This replaces the complex agent orchestration with practical CLI tool integration
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const EventEmitter = require('events');

class CLIOrchestrator extends EventEmitter {
  constructor() {
    super();
    this.activeProcesses = new Map();
    this.commandHistory = [];
    this.templates = this.loadTemplates();
  }

  /**
   * Load command templates for common workflows
   */
  loadTemplates() {
    return {
      // Claude Code CLI templates
      claude: {
        generateCode: {
          name: 'Generate Code with Claude',
          command: 'claude',
          args: ['code'],
          stdin: '{{prompt}}',
          description: 'Use Claude to generate code based on a prompt'
        },
        reviewCode: {
          name: 'Review Code with Claude',
          command: 'claude',
          args: ['review', '{{file}}'],
          description: 'Have Claude review a specific file'
        },
        refactorCode: {
          name: 'Refactor with Claude',
          command: 'claude',
          args: ['refactor'],
          stdin: '{{code}}',
          description: 'Refactor code using Claude'
        }
      },
      
      // Gemini CLI templates (assuming similar interface)
      gemini: {
        analyze: {
          name: 'Analyze with Gemini',
          command: 'gemini',
          args: ['analyze', '{{file}}'],
          description: 'Analyze code or requirements with Gemini'
        },
        generateTests: {
          name: 'Generate Tests with Gemini',
          command: 'gemini',
          args: ['test', '{{file}}'],
          description: 'Generate test cases using Gemini'
        }
      },
      
      // Combined workflows
      workflows: {
        fullStackFeature: {
          name: 'Full Stack Feature Development',
          steps: [
            { tool: 'claude', template: 'generateCode', prompt: 'Create backend API: {{description}}' },
            { tool: 'claude', template: 'generateCode', prompt: 'Create frontend components: {{description}}' },
            { tool: 'gemini', template: 'generateTests' }
          ],
          description: 'Generate complete full-stack feature with tests'
        },
        codeReviewPipeline: {
          name: 'Code Review Pipeline',
          steps: [
            { tool: 'claude', template: 'reviewCode' },
            { tool: 'gemini', template: 'analyze' },
            { tool: 'claude', template: 'refactorCode', conditional: true }
          ],
          description: 'Comprehensive code review using multiple AI tools'
        }
      }
    };
  }

  /**
   * Execute a CLI command with proper handling
   */
  async executeCommand(config) {
    const { command, args = [], stdin = '', cwd = process.cwd(), env = {} } = config;
    const commandId = `cmd-${Date.now()}`;

    return new Promise((resolve, reject) => {
      try {
        // Check if command exists
        const checkCommand = process.platform === 'win32' ? 'where' : 'which';
        exec(`${checkCommand} ${command}`, (error) => {
          if (error) {
            reject(new Error(`Command '${command}' not found. Please install it first.`));
            return;
          }

          // Spawn the process
          const childProcess = spawn(command, args, {
            cwd,
            env: { ...process.env, ...env },
            shell: true
          });

          this.activeProcesses.set(commandId, childProcess);

          let output = '';
          let errorOutput = '';

          // Handle stdout
          childProcess.stdout.on('data', (data) => {
            const chunk = data.toString();
            output += chunk;
            this.emit('output', { commandId, data: chunk, stream: 'stdout' });
          });

          // Handle stderr
          childProcess.stderr.on('data', (data) => {
            const chunk = data.toString();
            errorOutput += chunk;
            this.emit('output', { commandId, data: chunk, stream: 'stderr' });
          });

          // Send stdin if provided
          if (stdin) {
            childProcess.stdin.write(stdin);
            childProcess.stdin.end();
          }

          // Handle process completion
          childProcess.on('close', (code) => {
            this.activeProcesses.delete(commandId);
            
            const result = {
              commandId,
              command: `${command} ${args.join(' ')}`,
              exitCode: code,
              output,
              errorOutput,
              timestamp: new Date().toISOString()
            };

            this.commandHistory.push(result);

            if (code === 0) {
              resolve(result);
            } else {
              reject(new Error(`Command failed with exit code ${code}: ${errorOutput}`));
            }
          });

          // Handle errors
          childProcess.on('error', (error) => {
            this.activeProcesses.delete(commandId);
            reject(error);
          });
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Execute a command template with variable substitution
   */
  async executeTemplate(tool, templateName, variables = {}) {
    const template = this.templates[tool]?.[templateName];
    if (!template) {
      throw new Error(`Template '${templateName}' not found for tool '${tool}'`);
    }

    // Substitute variables in template
    const config = {
      command: template.command,
      args: template.args?.map(arg => this.substituteVariables(arg, variables)),
      stdin: template.stdin ? this.substituteVariables(template.stdin, variables) : '',
      cwd: variables.projectPath || process.cwd()
    };

    return this.executeCommand(config);
  }

  /**
   * Execute a workflow (multiple commands in sequence)
   */
  async executeWorkflow(workflowName, variables = {}) {
    const workflow = this.templates.workflows[workflowName];
    if (!workflow) {
      throw new Error(`Workflow '${workflowName}' not found`);
    }

    const results = [];
    
    for (const step of workflow.steps) {
      try {
        // Check if step is conditional and should be skipped
        if (step.conditional && !variables[step.conditionVariable]) {
          continue;
        }

        // Prepare variables for this step
        const stepVariables = {
          ...variables,
          previousOutput: results[results.length - 1]?.output || ''
        };

        // Substitute variables in prompt if present
        if (step.prompt) {
          stepVariables.prompt = this.substituteVariables(step.prompt, stepVariables);
        }

        // Execute the step
        const result = await this.executeTemplate(step.tool, step.template, stepVariables);
        results.push(result);

        // Emit progress event
        this.emit('workflowProgress', {
          workflow: workflowName,
          step: results.length,
          totalSteps: workflow.steps.length,
          result
        });
      } catch (error) {
        this.emit('workflowError', {
          workflow: workflowName,
          step: results.length + 1,
          error: error.message
        });
        throw error;
      }
    }

    return results;
  }

  /**
   * Substitute variables in a string
   */
  substituteVariables(str, variables) {
    return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match;
    });
  }

  /**
   * Kill a running process
   */
  killProcess(commandId) {
    const process = this.activeProcesses.get(commandId);
    if (process) {
      process.kill();
      this.activeProcesses.delete(commandId);
      return true;
    }
    return false;
  }

  /**
   * Get command history
   */
  getHistory(limit = 50) {
    return this.commandHistory.slice(-limit);
  }

  /**
   * Clear command history
   */
  clearHistory() {
    this.commandHistory = [];
  }

  /**
   * Check if a CLI tool is available
   */
  async checkToolAvailability(toolName) {
    const checkCommand = process.platform === 'win32' ? 'where' : 'which';
    
    return new Promise((resolve) => {
      exec(`${checkCommand} ${toolName}`, (error) => {
        resolve(!error);
      });
    });
  }

  /**
   * Get available tools and their status
   */
  async getAvailableTools() {
    const tools = ['claude', 'gemini', 'git', 'npm', 'python', 'docker'];
    const availability = {};

    for (const tool of tools) {
      availability[tool] = await this.checkToolAvailability(tool);
    }

    return availability;
  }

  /**
   * Save custom template
   */
  addCustomTemplate(tool, name, template) {
    if (!this.templates[tool]) {
      this.templates[tool] = {};
    }
    this.templates[tool][name] = template;
  }

  /**
   * Get all templates
   */
  getTemplates() {
    return this.templates;
  }
}

module.exports = CLIOrchestrator;