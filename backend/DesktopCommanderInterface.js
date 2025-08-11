const { exec } = require('child_process');

class DesktopCommanderInterface {
  constructor() {
    console.log('DesktopCommanderInterface initialized.');
  }

  /**
   * Executes an AppleScript command.
   * @param {string} script - The AppleScript code to execute.
   * @returns {Promise<string>} - The stdout from the AppleScript execution.
   */
  async executeAppleScript(script) {
    return new Promise((resolve, reject) => {
      exec(`osascript -e '${script}'`, (error, stdout, stderr) => {
        if (error) {
          console.error(`AppleScript execution error: ${error.message}`);
          return reject(new Error(`AppleScript execution failed: ${stderr || error.message}`));
        }
        if (stderr) {
          console.warn(`AppleScript stderr: ${stderr}`);
        }
        resolve(stdout.trim());
      });
    });
  }

  /**
   * Opens a specified macOS application.
   * @param {string} appName - The name of the application to open (e.g., "Safari", "Terminal").
   * @returns {Promise<string>} - A success message.
   */
  async openApplication(appName) {
    return new Promise((resolve, reject) => {
      exec(`open -a "${appName}"`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error opening application ${appName}: ${error.message}`);
          return reject(new Error(`Failed to open ${appName}: ${stderr || error.message}`));
        }
        if (stderr) {
          console.warn(`Open application stderr: ${stderr}`);
        }
        resolve(`Application ${appName} opened successfully.`);
      });
    });
  }

  /**
   * Executes a shell command on macOS.
   * @param {string} command - The shell command to execute.
   * @returns {Promise<string>} - The stdout from the shell command execution.
   */
  async runShellCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Shell command execution error: ${error.message}`);
          return reject(new Error(`Shell command failed: ${stderr || error.message}`));
        }
        if (stderr) {
          console.warn(`Shell command stderr: ${stderr}`);
        }
        resolve(stdout.trim());
      });
    });
  }
}

module.exports = DesktopCommanderInterface;
