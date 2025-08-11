const SystemMetricsCollector = require('./SystemMetricsCollector');
const AdaptiveLoadBalancer = require('./AdaptiveLoadBalancer');

class AgentSwarmManager {
  constructor() {
    console.log('AgentSwarmManager initialized.');
    this.agents = {}; // Stores active agents
    this.metricsCollector = new SystemMetricsCollector();
    this.loadBalancer = new AdaptiveLoadBalancer();
    this.monitorAgents(); // Start monitoring when initialized
  }

  spawnAgent(agentId, type, pid) {
    this.agents[agentId] = {
      id: agentId,
      type: type,
      status: 'active',
      createdAt: new Date(),
      pid: pid, // Process ID for real metrics
      performanceMetrics: {
        tasksCompleted: 0,
        averageTaskTime: 0,
        errors: 0
      }
    };
    this.loadBalancer.registerAgent(agentId, { skills: [type], capacity: 'medium' }); // Register with load balancer
    console.log(`Agent ${agentId} (${type}) spawned with PID: ${pid}.`);
    return this.agents[agentId];
  }

  terminateAgent(agentId) {
    if (this.agents[agentId]) {
      this.agents[agentId].status = 'terminated';
      // In a real scenario, you would kill the process associated with the agent
      console.log(`Agent ${agentId} terminated.`);
      return true;
    }
    console.log(`Agent ${agentId} not found.`);
    return false;
  }

  getAgentStatus(agentId) {
    return this.agents[agentId];
  }

  getAllAgents() {
    return Object.values(this.agents);
  }

  monitorAgents() {
    setInterval(async () => {
      for (const agentId in this.agents) {
        const agent = this.agents[agentId];
        if (agent.status === 'active' && agent.pid) {
          const processMetrics = await this.metricsCollector.getAgentProcessMetrics(agent.pid);
          if (processMetrics) {
            agent.cpuUsage = processMetrics.cpu;
            agent.memoryUsage = processMetrics.memory;
            agent.uptime = processMetrics.uptime;

            // Update load balancer with real metrics
            this.loadBalancer.updateAgentStatus(agentId, agent.performanceMetrics.tasksCompleted, { cpu: agent.cpuUsage, memory: agent.memoryUsage });

            // Simulate performance metrics (e.g., tasks completed)
            if (Math.random() < 0.1) { // 10% chance to complete a task
              agent.performanceMetrics.tasksCompleted++;
              agent.performanceMetrics.averageTaskTime = (agent.performanceMetrics.averageTaskTime * (agent.performanceMetrics.tasksCompleted - 1) + (Math.random() * 1000 + 500)) / agent.performanceMetrics.tasksCompleted;
            }
            if (Math.random() < 0.01) { // 1% chance of error
              agent.performanceMetrics.errors++;
            }
          }
        }
      }
      this.loadBalancer.optimizeResources(); // Trigger load balancer optimization
    }, 5000); // Monitor every 5 seconds
  }

  // This method would be called by the GodModeOrchestrator to assign tasks
  assignTaskToAgent(task) {
    const assignedAgentId = this.loadBalancer.assignTask(task);
    if (assignedAgentId) {
      // In a real system, you would send the task to the assigned agent process
      console.log(`Task ${task.id} assigned to agent ${assignedAgentId}.`);
      return assignedAgentId;
    }
    console.log(`No suitable agent found for task ${task.id}.`);
    return null;
  }
}

module.exports = AgentSwarmManager;
