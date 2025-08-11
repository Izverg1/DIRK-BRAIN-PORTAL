const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class DockerIntegration {
  constructor() {
    console.log('DockerIntegration initialized.');
  }

  async buildImage(contextPath, imageName, dockerfilePath = 'Dockerfile') {
    console.log(`Building Docker image: ${imageName} from ${contextPath}`);
    const command = `docker build -t ${imageName} -f ${dockerfilePath} ${contextPath}`;
    return this._runCommand(command);
  }

  async runContainer(imageName, containerName, ports = [], volumes = [], envs = []) {
    console.log(`Running Docker container: ${containerName} from ${imageName}`);
    let portMaps = ports.map(p => `-p ${p}`).join(' ');
    let volumeMaps = volumes.map(v => `-v ${v}`).join(' ');
    let envVars = envs.map(e => `-e ${e}`).join(' ');
    const command = `docker run -d --name ${containerName} ${portMaps} ${volumeMaps} ${envVars} ${imageName}`;
    return this._runCommand(command);
  }

  async stopContainer(containerName) {
    console.log(`Stopping Docker container: ${containerName}`);
    const command = `docker stop ${containerName}`;
    return this._runCommand(command);
  }

  async removeContainer(containerName) {
    console.log(`Removing Docker container: ${containerName}`);
    const command = `docker rm ${containerName}`;
    return this._runCommand(command);
  }

  async removeImage(imageName) {
    console.log(`Removing Docker image: ${imageName}`);
    const command = `docker rmi ${imageName}`;
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

module.exports = DockerIntegration;
