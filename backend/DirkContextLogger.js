const fs = require('fs').promises;
const path = require('path');

class DirkContextLogger {
  constructor() {
    this.logFilePath = path.join(__dirname, 'dirk_protocol', 'context', 'DIRK_CONTEXT.md');
  }

  async logActivity(activity) {
    const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'); // Format to YYYY-MM-DDTHH:mm:ssZ
    const logEntry = `\n#DIRK-GLOBAL-${timestamp.replace(/[-:.]/g, '')}: ${activity}\n`;
    try {
      await fs.appendFile(this.logFilePath, logEntry, 'utf8');
      console.log(`Logged activity: ${activity}`);
    } catch (error) {
      console.error('Error logging activity to DIRK_CONTEXT.md:', error);
    }
  }
}

module.exports = DirkContextLogger;
