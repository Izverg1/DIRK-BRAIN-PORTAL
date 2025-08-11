const os = require('os');
const process = require('process');

class SystemMetricsCollector {
  constructor() {
    console.log('SystemMetricsCollector initialized.');
  }

  /**
   * Collects overall system metrics.
   * @returns {object} - CPU, memory, disk, and network usage (simulated for network and disk).
   */
  async getSystemMetrics() {
    const cpuUsage = os.loadavg()[0]; // 1-minute load average
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsage = (usedMemory / totalMemory) * 100;

    // Simulate disk and network usage for now
    const diskUsage = Math.random() * 100; // 0-100%
    const networkUsage = Math.random() * 100; // 0-100%

    return {
      cpu: parseFloat(cpuUsage.toFixed(2)),
      memory: parseFloat(memoryUsage.toFixed(2)),
      disk: parseFloat(diskUsage.toFixed(2)),
      network: parseFloat(networkUsage.toFixed(2)),
    };
  }

  /**
   * Tracks actual process resource consumption for a given PID.
   * This is a simplified example. Real-world process monitoring would involve
   * more robust libraries or direct OS interaction.
   * @param {number} pid - The process ID to monitor.
   * @returns {object} - CPU, memory, and uptime for the process.
   */
  async getAgentProcessMetrics(pid) {
    try {
      // This is a placeholder. In a real scenario, you'd use a library like 'pidusage'
      // or execute system commands to get process-specific metrics.
      // For demonstration, we'll return simulated data.
      const cpu = Math.random() * 50; // Simulated CPU usage for process
      const memory = Math.random() * 500; // Simulated memory usage in MB
      const uptime = process.uptime(); // System uptime, not process uptime

      return {
        pid: pid,
        cpu: parseFloat(cpu.toFixed(2)),
        memory: parseFloat(memory.toFixed(2)), // MB
        uptime: parseFloat(uptime.toFixed(2)), // seconds
      };
    } catch (error) {
      console.error(`Error getting process metrics for PID ${pid}:`, error);
      return null;
    }
  }
}

module.exports = SystemMetricsCollector;
