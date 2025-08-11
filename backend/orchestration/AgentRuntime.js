/**
 * Agent Runtime Orchestration Engine
 * Manages actual execution of agents from different providers
 */

const { spawn } = require('child_process');
const EventEmitter = require('events');
const WebSocket = require('ws');

class AgentRuntime extends EventEmitter {
  constructor() {
    super();
    this.runningAgents = new Map();
    this.agentQueues = new Map();
    this.orchestrationRules = new Map();
    this.wsServer = null;
  }

  /**
   * Initialize WebSocket server for real-time communication
   */
  initializeWebSocket(port = 8080) {
    this.wsServer = new WebSocket.Server({ port });
    
    this.wsServer.on('connection', (ws) => {
      console.log('New WebSocket connection established');
      
      ws.on('message', (message) => {
        const data = JSON.parse(message);
        this.handleWebSocketMessage(ws, data);
      });
    });
    
    console.log(`WebSocket server running on port ${port}`);
  }

  /**
   * Deploy an agent pod with orchestration
   */
  async deployPod(podConfig) {
    const { id, name, type, agents, deployment } = podConfig;
    
    console.log(`Deploying pod: ${name} (${type})`);
    
    // Create orchestration rules based on pod type
    const orchestration = this.createOrchestrationRules(type, agents);
    this.orchestrationRules.set(id, orchestration);
    
    // Deploy each agent
    const deploymentPromises = agents.map(agent => 
      this.deployAgent(agent, podConfig)
    );
    
    const results = await Promise.all(deploymentPromises);
    
    // Initialize inter-agent communication
    this.setupInterAgentCommunication(id, agents);
    
    return {
      podId: id,
      deploymentResults: results,
      orchestration: orchestration
    };
  }

  /**
   * Deploy individual agent with provider-specific logic
   */
  async deployAgent(agentConfig, podConfig) {
    const { id, provider, model, role, framework } = agentConfig;
    
    try {
      let runtime;
      
      switch (provider) {
        case 'anthropic_claude':
          runtime = await this.deployClaudeAgent(agentConfig);
          break;
        case 'google_gemini':
          runtime = await this.deployGeminiAgent(agentConfig);
          break;
        case 'openai_gpt':
          runtime = await this.deployOpenAIAgent(agentConfig);
          break;
        case 'local_models':
          runtime = await this.deployLocalAgent(agentConfig);
          break;
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }
      
      // Store runtime info
      this.runningAgents.set(id, {
        ...agentConfig,
        runtime,
        podId: podConfig.id,
        status: 'active',
        startTime: Date.now(),
        metrics: {
          requestsProcessed: 0,
          errors: 0,
          avgLatency: 0
        }
      });
      
      // Initialize task queue for agent
      this.agentQueues.set(id, []);
      
      return {
        success: true,
        agentId: id,
        runtime: runtime.type,
        endpoint: runtime.endpoint
      };
      
    } catch (error) {
      console.error(`Failed to deploy agent ${id}:`, error);
      return {
        success: false,
        agentId: id,
        error: error.message
      };
    }
  }

  /**
   * Deploy Claude agent using Anthropic API
   */
  async deployClaudeAgent(config) {
    const { model, role } = config;
    
    // Create specialized endpoint for Claude agent
    const endpoint = `http://localhost:8001/claude/${config.id}`;
    
    // Initialize Claude-specific runtime
    const runtime = {
      type: 'claude_api',
      endpoint,
      apiKey: process.env.ANTHROPIC_API_KEY,
      model,
      systemPrompt: this.getSystemPromptForRole(role),
      maxTokens: 200000,
      temperature: 0.7
    };
    
    // Spawn worker process for Claude agent
    const worker = spawn('node', [
      `${__dirname}/workers/ClaudeWorker.js`,
      JSON.stringify(runtime)
    ]);
    
    worker.on('error', (err) => {
      console.error(`Claude worker error: ${err}`);
      this.emit('agentError', { agentId: config.id, error: err });
    });
    
    runtime.worker = worker;
    return runtime;
  }

  /**
   * Deploy Gemini agent using Google API
   */
  async deployGeminiAgent(config) {
    const { model, role } = config;
    
    const endpoint = `http://localhost:8002/gemini/${config.id}`;
    
    const runtime = {
      type: 'gemini_api',
      endpoint,
      apiKey: process.env.GOOGLE_API_KEY,
      model,
      systemPrompt: this.getSystemPromptForRole(role),
      capabilities: ['multimodal', 'verification']
    };
    
    // Spawn worker for Gemini
    const worker = spawn('node', [
      `${__dirname}/workers/GeminiWorker.js`,
      JSON.stringify(runtime)
    ]);
    
    runtime.worker = worker;
    return runtime;
  }

  /**
   * Deploy OpenAI GPT agent
   */
  async deployOpenAIAgent(config) {
    const { model, role } = config;
    
    const endpoint = `http://localhost:8003/openai/${config.id}`;
    
    const runtime = {
      type: 'openai_api',
      endpoint,
      apiKey: process.env.OPENAI_API_KEY,
      model,
      systemPrompt: this.getSystemPromptForRole(role),
      functions: this.getFunctionsForRole(role)
    };
    
    const worker = spawn('node', [
      `${__dirname}/workers/OpenAIWorker.js`,
      JSON.stringify(runtime)
    ]);
    
    runtime.worker = worker;
    return runtime;
  }

  /**
   * Deploy local model agent
   */
  async deployLocalAgent(config) {
    const { model, role } = config;
    
    const endpoint = `http://localhost:8004/local/${config.id}`;
    
    const runtime = {
      type: 'local_llm',
      endpoint,
      modelPath: `/models/${model}`,
      device: 'cuda',
      contextLength: 4096
    };
    
    // For local models, use Python worker
    const worker = spawn('python3', [
      `${__dirname}/workers/local_worker.py`,
      JSON.stringify(runtime)
    ]);
    
    runtime.worker = worker;
    return runtime;
  }

  /**
   * Create orchestration rules based on pod type
   */
  createOrchestrationRules(podType, agents) {
    switch (podType) {
      case 'swarm':
        return {
          type: 'parallel',
          consensus: 'majority_vote',
          minAgents: Math.ceil(agents.length / 2),
          timeout: 30000
        };
      
      case 'pipeline':
        return {
          type: 'sequential',
          stages: agents.map((agent, index) => ({
            stage: index + 1,
            agentId: agent.id,
            role: agent.role,
            passthrough: true
          })),
          errorHandling: 'halt'
        };
      
      case 'mesh':
        return {
          type: 'peer_to_peer',
          allowBroadcast: true,
          routingTable: this.createMeshRouting(agents)
        };
      
      case 'hierarchical':
        return {
          type: 'manager_worker',
          manager: agents[0].id,
          workers: agents.slice(1).map(a => a.id),
          delegation: 'load_balanced'
        };
      
      default:
        return {
          type: 'basic',
          parallel: false
        };
    }
  }

  /**
   * Setup inter-agent communication channels
   */
  setupInterAgentCommunication(podId, agents) {
    const orchestration = this.orchestrationRules.get(podId);
    
    agents.forEach(agent => {
      const runtime = this.runningAgents.get(agent.id);
      if (!runtime) return;
      
      // Setup message passing based on orchestration type
      runtime.runtime.worker.on('message', (message) => {
        this.handleAgentMessage(podId, agent.id, message, orchestration);
      });
    });
  }

  /**
   * Handle messages between agents
   */
  handleAgentMessage(podId, agentId, message, orchestration) {
    const { type, data } = message;
    
    switch (orchestration.type) {
      case 'sequential':
        // Pass to next stage in pipeline
        const currentStage = orchestration.stages.find(s => s.agentId === agentId);
        if (currentStage && currentStage.stage < orchestration.stages.length) {
          const nextStage = orchestration.stages[currentStage.stage];
          this.sendToAgent(nextStage.agentId, data);
        }
        break;
      
      case 'parallel':
        // Collect for consensus
        this.collectForConsensus(podId, agentId, data);
        break;
      
      case 'peer_to_peer':
        // Route based on mesh topology
        this.routeInMesh(podId, agentId, data, orchestration.routingTable);
        break;
      
      case 'manager_worker':
        // Handle delegation
        if (agentId === orchestration.manager) {
          this.delegateToWorker(orchestration.workers, data);
        } else {
          this.reportToManager(orchestration.manager, agentId, data);
        }
        break;
    }
    
    // Emit event for monitoring
    this.emit('agentMessage', {
      podId,
      agentId,
      type,
      timestamp: Date.now()
    });
  }

  /**
   * Execute task on pod
   */
  async executeTask(podId, task) {
    const orchestration = this.orchestrationRules.get(podId);
    const agents = Array.from(this.runningAgents.values()).filter(a => a.podId === podId);
    
    if (!orchestration || agents.length === 0) {
      throw new Error(`Pod ${podId} not found or not active`);
    }
    
    console.log(`Executing task on pod ${podId} with ${orchestration.type} orchestration`);
    
    let result;
    
    switch (orchestration.type) {
      case 'sequential':
        result = await this.executeSequential(agents, task, orchestration);
        break;
      
      case 'parallel':
        result = await this.executeParallel(agents, task, orchestration);
        break;
      
      case 'peer_to_peer':
        result = await this.executeMesh(agents, task, orchestration);
        break;
      
      case 'manager_worker':
        result = await this.executeHierarchical(agents, task, orchestration);
        break;
      
      default:
        result = await this.executeBasic(agents[0], task);
    }
    
    // Update metrics
    this.updatePodMetrics(podId, result);
    
    return result;
  }

  /**
   * Execute task in sequential pipeline
   */
  async executeSequential(agents, task, orchestration) {
    let currentData = task;
    const results = [];
    
    for (const stage of orchestration.stages) {
      const agent = agents.find(a => a.id === stage.agentId);
      if (!agent) continue;
      
      const stageResult = await this.executeOnAgent(agent, currentData);
      results.push({
        stage: stage.stage,
        agentId: agent.id,
        result: stageResult
      });
      
      if (stage.passthrough) {
        currentData = stageResult;
      }
    }
    
    return {
      type: 'pipeline',
      stages: results,
      finalOutput: currentData
    };
  }

  /**
   * Execute task in parallel with consensus
   */
  async executeParallel(agents, task, orchestration) {
    const promises = agents.map(agent => 
      this.executeOnAgent(agent, task)
    );
    
    const results = await Promise.all(promises);
    
    // Apply consensus mechanism
    const consensus = this.applyConsensus(results, orchestration.consensus);
    
    return {
      type: 'swarm',
      individualResults: results,
      consensus,
      agreement: this.calculateAgreement(results)
    };
  }

  /**
   * Execute on individual agent
   */
  async executeOnAgent(agent, task) {
    const startTime = Date.now();
    
    try {
      // Send task to agent worker
      const result = await this.sendTaskToWorker(agent.runtime.worker, task);
      
      // Update agent metrics
      const latency = Date.now() - startTime;
      agent.metrics.requestsProcessed++;
      agent.metrics.avgLatency = 
        (agent.metrics.avgLatency * (agent.metrics.requestsProcessed - 1) + latency) / 
        agent.metrics.requestsProcessed;
      
      return {
        success: true,
        agentId: agent.id,
        output: result,
        latency
      };
      
    } catch (error) {
      agent.metrics.errors++;
      
      return {
        success: false,
        agentId: agent.id,
        error: error.message,
        latency: Date.now() - startTime
      };
    }
  }

  /**
   * Send task to worker process
   */
  sendTaskToWorker(worker, task) {
    return new Promise((resolve, reject) => {
      const messageId = Date.now().toString();
      
      const handler = (message) => {
        if (message.id === messageId) {
          worker.removeListener('message', handler);
          if (message.error) {
            reject(new Error(message.error));
          } else {
            resolve(message.result);
          }
        }
      };
      
      worker.on('message', handler);
      worker.send({ id: messageId, task });
      
      // Timeout after 30 seconds
      setTimeout(() => {
        worker.removeListener('message', handler);
        reject(new Error('Task timeout'));
      }, 30000);
    });
  }

  /**
   * Apply consensus mechanism to parallel results
   */
  applyConsensus(results, consensusType) {
    const validResults = results.filter(r => r.success);
    
    switch (consensusType) {
      case 'majority_vote':
        // Group by similar outputs
        const votes = new Map();
        validResults.forEach(r => {
          const key = JSON.stringify(r.output);
          votes.set(key, (votes.get(key) || 0) + 1);
        });
        
        // Find majority
        let maxVotes = 0;
        let consensus = null;
        votes.forEach((count, output) => {
          if (count > maxVotes) {
            maxVotes = count;
            consensus = JSON.parse(output);
          }
        });
        
        return consensus;
      
      case 'average':
        // For numerical outputs
        const sum = validResults.reduce((acc, r) => acc + (r.output || 0), 0);
        return sum / validResults.length;
      
      case 'unanimous':
        // All must agree
        const first = JSON.stringify(validResults[0]?.output);
        const unanimous = validResults.every(r => JSON.stringify(r.output) === first);
        return unanimous ? validResults[0].output : null;
      
      default:
        // Return first valid result
        return validResults[0]?.output;
    }
  }

  /**
   * Get system prompt for role
   */
  getSystemPromptForRole(role) {
    const prompts = {
      'fullstack_developer': 'You are an expert full-stack developer. Write clean, efficient, well-tested code.',
      'business_analyst': 'You are a business analyst. Analyze requirements, identify gaps, and provide insights.',
      'security_specialist': 'You are a security expert. Review code for vulnerabilities and ensure compliance.',
      'technical_writer': 'You are a technical writer. Create clear, comprehensive documentation.',
      'qa_engineer': 'You are a QA engineer. Design thorough test cases and identify potential issues.',
      'architect': 'You are a software architect. Design scalable, maintainable system architectures.',
      'devops': 'You are a DevOps engineer. Optimize deployment, monitoring, and infrastructure.'
    };
    
    return prompts[role] || 'You are an AI assistant helping with software development tasks.';
  }

  /**
   * Get function definitions for role (OpenAI function calling)
   */
  getFunctionsForRole(role) {
    if (role === 'fullstack_developer') {
      return [
        {
          name: 'write_code',
          description: 'Write code for a given specification',
          parameters: {
            type: 'object',
            properties: {
              language: { type: 'string' },
              code: { type: 'string' },
              description: { type: 'string' }
            }
          }
        },
        {
          name: 'review_code',
          description: 'Review code for issues',
          parameters: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              language: { type: 'string' }
            }
          }
        }
      ];
    }
    
    return [];
  }

  /**
   * Update pod performance metrics
   */
  updatePodMetrics(podId, result) {
    // Aggregate metrics from all agents in pod
    const agents = Array.from(this.runningAgents.values()).filter(a => a.podId === podId);
    
    const metrics = {
      totalRequests: agents.reduce((sum, a) => sum + a.metrics.requestsProcessed, 0),
      totalErrors: agents.reduce((sum, a) => sum + a.metrics.errors, 0),
      avgLatency: agents.reduce((sum, a) => sum + a.metrics.avgLatency, 0) / agents.length,
      successRate: 0
    };
    
    if (metrics.totalRequests > 0) {
      metrics.successRate = ((metrics.totalRequests - metrics.totalErrors) / metrics.totalRequests) * 100;
    }
    
    // Broadcast metrics via WebSocket
    if (this.wsServer) {
      this.broadcastMetrics(podId, metrics);
    }
    
    return metrics;
  }

  /**
   * Broadcast metrics to connected clients
   */
  broadcastMetrics(podId, metrics) {
    const message = JSON.stringify({
      type: 'pod_metrics',
      podId,
      metrics,
      timestamp: Date.now()
    });
    
    this.wsServer.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  /**
   * Shutdown pod and cleanup resources
   */
  async shutdownPod(podId) {
    const agents = Array.from(this.runningAgents.values()).filter(a => a.podId === podId);
    
    for (const agent of agents) {
      if (agent.runtime.worker) {
        agent.runtime.worker.kill();
      }
      this.runningAgents.delete(agent.id);
      this.agentQueues.delete(agent.id);
    }
    
    this.orchestrationRules.delete(podId);
    
    console.log(`Pod ${podId} shutdown complete`);
  }

  /**
   * Get runtime status
   */
  getStatus() {
    const pods = new Map();
    
    // Group agents by pod
    this.runningAgents.forEach(agent => {
      if (!pods.has(agent.podId)) {
        pods.set(agent.podId, {
          id: agent.podId,
          agents: [],
          orchestration: this.orchestrationRules.get(agent.podId)
        });
      }
      pods.get(agent.podId).agents.push({
        id: agent.id,
        provider: agent.provider,
        status: agent.status,
        metrics: agent.metrics
      });
    });
    
    return {
      activePods: pods.size,
      totalAgents: this.runningAgents.size,
      pods: Array.from(pods.values())
    };
  }
}

module.exports = AgentRuntime;