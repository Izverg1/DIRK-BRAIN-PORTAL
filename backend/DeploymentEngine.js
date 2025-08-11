const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const DockerIntegration = require('./DockerIntegration');
const KubernetesDeployer = require('./KubernetesDeployer');
const CloudPlatformAdapters = require('./CloudPlatformAdapters');

class DeploymentEngine {
  constructor() {
    console.log('DeploymentEngine initialized.');
    this.docker = new DockerIntegration();
    this.kubernetes = new KubernetesDeployer();
    this.cloud = new CloudPlatformAdapters();
    this.deploymentHistory = {}; // Simple in-memory history for rollback
  }

  async deployProject(projectPath, projectType, target = 'local', options = {}) {
    console.log(`Deploying project at ${projectPath} of type ${projectType} to ${target} target.`);
    const deploymentId = `deploy_${Date.now()}`;
    this.deploymentHistory[deploymentId] = { projectPath, projectType, target, options, status: 'in-progress', timestamp: new Date() };

    try {
      // Step 1: Build/Install dependencies based on project type
      switch (projectType) {
        case 'react':
          await this._runCommand('npm install', projectPath);
          await this._runCommand('npm run build', projectPath);
          console.log('React project built successfully.');
          break;
        case 'python':
          await this._runCommand('pip install -r requirements.txt', projectPath);
          console.log('Python dependencies installed.');
          break;
        case 'node.js':
          await this._runCommand('npm install', projectPath);
          console.log('Node.js dependencies installed.');
          break;
        default:
          console.log('Unknown project type. Skipping build steps.');
      }

      // Step 2: Deploy to specified target
      let deploymentResult;
      switch (target) {
        case 'local':
          console.log(`Project ${projectPath} deployed successfully to simulated local environment.`);
          deploymentResult = { success: true, message: 'Local deployment successful.' };
          break;
        case 'docker':
          // Assuming Dockerfile is in projectPath
          await this.docker.buildImage(projectPath, `${projectType}-app:${deploymentId}`);
          deploymentResult = await this.docker.runContainer(`${projectType}-app:${deploymentId}`, `${projectType}-container-${deploymentId}`, options.ports, options.volumes, options.env);
          break;
        case 'kubernetes':
          // Assuming manifestPath is provided in options
          deploymentResult = await this.kubernetes.applyManifest(options.manifestPath);
          break;
        case 'aws':
        case 'gcp':
        case 'azure':
          deploymentResult = await this.cloud.deploy(target, { projectPath, projectType, options });
          break;
        default:
          throw new Error(`Unsupported deployment target: ${target}`);
      }

      this.deploymentHistory[deploymentId].status = 'completed';
      return { deploymentId, success: true, message: 'Deployment successful.', details: deploymentResult };

    } catch (error) {
      console.error(`Deployment failed: ${error.message}`);
      this.deploymentHistory[deploymentId].status = 'failed';
      this.deploymentHistory[deploymentId].error = error.message;
      return { deploymentId, success: false, message: `Deployment failed: ${error.message}` };
    }
  }

  async _runCommand(command, cwd) {
    return new Promise((resolve, reject) => {
      exec(command, { cwd }, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return reject(error);
        }
        console.log(`stdout: ${stdout}`);
        if (stderr) {
          console.error(`stderr: ${stderr}`);
        }
        resolve(stdout);
      });
    });
  }

  async rollback(deploymentId) {
    console.log(`Initiating rollback for deployment ${deploymentId}`);
    const deployment = this.deploymentHistory[deploymentId];

    if (!deployment) {
      throw new Error(`Deployment ${deploymentId} not found in history.`);
    }
    if (deployment.status !== 'completed') {
      console.warn(`Deployment ${deploymentId} was not completed successfully. Rollback might not be effective.`);
    }

    try {
      let rollbackResult;
      switch (deployment.target) {
        case 'local':
          console.log(`Simulating local rollback for ${deploymentId}.`);
          rollbackResult = { success: true, message: 'Local rollback simulated.' };
          break;
        case 'docker':
          rollbackResult = await this.docker.stopContainer(`${deployment.projectType}-container-${deploymentId}`);
          await this.docker.removeContainer(`${deployment.projectType}-container-${deploymentId}`);
          break;
        case 'kubernetes':
          rollbackResult = await this.kubernetes.deleteManifest(deployment.options.manifestPath);
          break;
        case 'aws':
        case 'gcp':
        case 'azure':
          // Cloud platform rollback would be highly specific and complex
          console.warn(`Automated rollback for ${deployment.target} is not fully implemented. Manual intervention may be required.`);
          rollbackResult = { success: true, message: `Simulated ${deployment.target} rollback. Manual steps may be needed.` };
          break;
        default:
          throw new Error(`Unsupported rollback target: ${deployment.target}`);
      }
      deployment.status = 'rolled-back';
      return { success: true, message: `Rollback for ${deploymentId} successful.`, details: rollbackResult };
    } catch (error) {
      console.error(`Rollback failed for ${deploymentId}: ${error.message}`);
      deployment.status = 'rollback-failed';
      deployment.rollbackError = error.message;
      return { success: false, message: `Rollback failed for ${deploymentId}: ${error.message}` };
    }
  }
}

module.exports = DeploymentEngine;
