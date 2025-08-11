const { exec } = require('child_process');
const path = require('path');

class BackupManager {
  constructor() {
    this.dirkProtocolPath = path.join(__dirname, 'dirk_protocol');
    this.setupGlobalDirkScript = path.join(this.dirkProtocolPath, 'utilities', 'setup_global_dirk.sh');
    this.dirkVerifyScript = path.join(this.dirkProtocolPath, 'utilities', 'dirk_verify.sh');
  }

  async triggerBackup() {
    return new Promise((resolve, reject) => {
      // The setup_global_dirk.sh script contains the logic to create a backup
      // We need to ensure DIRK_BASE is correctly set for the script to find its paths
      const command = `DIRK_BASE='${this.dirkProtocolPath}' ${this.setupGlobalDirkScript}`;
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return reject(error);
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
        }
        console.log(`stdout: ${stdout}`);
        resolve(stdout);
      });
    });
  }

  async checkBackupStatus() {
    return new Promise((resolve, reject) => {
      const command = `DIRK_BASE='${this.dirkProtocolPath}' ${this.dirkVerifyScript}`;
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return reject(error);
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
        }
        console.log(`stdout: ${stdout}`);
        resolve(stdout);
      });
    });
  }
}

module.exports = BackupManager;
