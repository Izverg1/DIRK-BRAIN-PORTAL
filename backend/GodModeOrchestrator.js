const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../proto/godmode.proto');
const GODMODE_SERVICE_ADDR = 'localhost:50051';

class GodModeOrchestrator {
  constructor() {
    console.log('GodModeOrchestrator initialized.');

    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });
    const godmodeProto = grpc.loadPackageDefinition(packageDefinition).godmode;
    this.client = new godmodeProto.GodModeService(GODMODE_SERVICE_ADDR, grpc.credentials.createInsecure());
  }

  async decomposeTask(taskDescription) {
    console.log(`Node.js gRPC client: Requesting decomposition for: ${taskDescription}`);

    return new Promise((resolve, reject) => {
      this.client.DecomposeTask({ task_description: taskDescription }, (error, response) => {
        if (error) {
          console.error('Error calling DecomposeTask:', error);
          return reject(error);
        }
        console.log('Node.js gRPC client: Received decomposition response.');
        // Transform the gRPC response to match the expected output format
        const subtasks = response.subtasks.map(subtask => ({
          name: subtask.name,
          description: subtask.description,
          complexity: subtask.complexity,
          assignedAgent: subtask.assigned_agent,
          agentConfidence: subtask.agent_confidence,
          agentReasoning: subtask.agent_reasoning,
          dependencies: subtask.dependencies,
        }));

        resolve({
          originalTask: response.original_task,
          complexity: response.complexity,
          estimatedTime: response.estimated_time,
          extractedRequirements: {
            technologies: response.extracted_requirements.technologies,
            patterns: response.extracted_requirements.patterns,
            constraints: response.extracted_requirements.constraints,
          },
          subtasks: subtasks,
        });
      });
    });
  }
}

module.exports = GodModeOrchestrator;

module.exports = GodModeOrchestrator;
