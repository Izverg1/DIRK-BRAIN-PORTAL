class PerformanceAnalytics {
  constructor(io) {
    console.log('PerformanceAnalytics initialized.');
    this.io = io;
    this.metrics = {}; // Stores performance metrics per agent/task
  }

  /**
   * Records performance metrics for an agent or task.
   * @param {string} id - Agent ID or Task ID.
   * @param {object} data - Performance data (e.g., { cpuUsage: 0.7, memoryUsage: 0.6, latency: 50 }).
   */
  recordMetrics(id, data) {
    if (!this.metrics[id]) {
      this.metrics[id] = [];
    }
    this.metrics[id].push({ timestamp: Date.now(), ...data });
    console.log(`Recorded metrics for ${id}:`, data);
    this.io.emit('performance_metrics', { id, data: { timestamp: Date.now(), ...data } });
  }

  /**
   * Analyzes collected metrics and provides optimization suggestions.
   * @param {string} id - Agent ID or Task ID to analyze. If null, analyzes all.
   * @returns {object} - Analysis and optimization suggestions.
   */
  analyzeAndOptimize(id = null) {
    console.log(`Analyzing performance for ${id || 'all'}...`);
    const analysis = {};

    const targets = id ? { [id]: this.metrics[id] } : this.metrics;

    for (const key in targets) {
      const dataPoints = targets[key];
      if (!dataPoints || dataPoints.length === 0) {
        analysis[key] = 'No data available.';
        continue;
      }

      // Simple average calculation for demonstration
      const avgCpu = dataPoints.reduce((sum, d) => sum + (d.cpuUsage || 0), 0) / dataPoints.length;
      const avgMemory = dataPoints.reduce((sum, d) => sum + (d.memoryUsage || 0), 0) / dataPoints.length;
      const avgLatency = dataPoints.reduce((sum, d) => sum + (d.latency || 0), 0) / dataPoints.length;

      let suggestion = 'Optimal performance.';
      if (avgCpu > 0.8) {
        suggestion = 'High CPU usage detected. Consider optimizing code or scaling resources.';
      } else if (avgMemory > 0.7) {
        suggestion = 'High memory usage. Check for memory leaks or increase allocation.';
      } else if (avgLatency > 100) {
        suggestion = 'High latency detected. Investigate network or processing bottlenecks.';
      }

      analysis[key] = {
        averageMetrics: { cpuUsage: avgCpu, memoryUsage: avgMemory, latency: avgLatency },
        suggestion,
      };
    }

    console.log('Performance analysis complete:', analysis);
    return analysis;
  }
}

module.exports = PerformanceAnalytics;
