const { exec } = require('child_process');

class KubernetesDeployer {
  constructor() {
    console.log('KubernetesDeployer initialized.');
  }

  async applyManifest(manifestPath) {
    console.log(`Applying Kubernetes manifest: ${manifestPath}`);
    const command = `kubectl apply -f ${manifestPath}`;
    return this._runCommand(command);
  }

  async deleteManifest(manifestPath) {
    console.log(`Deleting Kubernetes manifest: ${manifestPath}`);
    const command = `kubectl delete -f ${manifestPath}`;
    return this._runCommand(command);
  }

  async scaleDeployment(deploymentName, replicas) {
    console.log(`Scaling deployment ${deploymentName} to ${replicas} replicas.`);
    const command = `kubectl scale deployment/${deploymentName} --replicas=${replicas}`;
    return this._runCommand(command);
  }

  async getDeploymentStatus(deploymentName) {
    console.log(`Getting status for deployment: ${deploymentName}`);
    const command = `kubectl get deployment ${deploymentName}`;
    return this._runCommand(command);
  }

  async _runCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return reject(error);
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
        }
        resolve(stdout);
      });
    });
  }
}

module.exports = KubernetesDeployer;
