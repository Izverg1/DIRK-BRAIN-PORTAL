class MLAnomalyDetector {
  constructor() {
    console.log('MLAnomalyDetector initialized.');
    this.patterns = new Map(); // Stores learned patterns for anomaly detection
  }

  /**
   * Learns patterns from historical data.
   * In a real ML system, this would involve training a model.
   * @param {string} patternName - Name of the pattern to learn.
   * @param {Array<any>} data - Historical data to learn from.
   */
  learnPattern(patternName, data) {
    // Simplified: just store the data as a reference pattern
    this.patterns.set(patternName, data);
    console.log(`Learned pattern: ${patternName}`);
  }

  /**
   * Detects anomalies in new data based on learned patterns.
   * @param {string} patternName - Name of the pattern to check against.
   * @param {any} newData - New data point to check for anomalies.
   * @returns {object} - Anomaly detection result.
   */
  detectAnomaly(patternName, newData) {
    const learnedData = this.patterns.get(patternName);
    if (!learnedData) {
      return { isAnomaly: false, message: `No pattern learned for ${patternName}.` };
    }

    // Simplified anomaly detection: check if newData is significantly different
    // For numerical data, could be outside a standard deviation.
    // For categorical, could be a value not seen before.

    let isAnomaly = false;
    let message = 'No anomaly detected.';

    if (Array.isArray(learnedData) && typeof newData === 'number') {
      const sum = learnedData.reduce((a, b) => a + b, 0);
      const mean = sum / learnedData.length;
      const squaredDiffs = learnedData.map(value => (value - mean) ** 2);
      const variance = squaredDiffs.reduce((a, b) => a + b, 0) / learnedDiffs.length;
      const stdDev = Math.sqrt(variance);

      if (Math.abs(newData - mean) > 2 * stdDev) { // More than 2 standard deviations away
        isAnomaly = true;
        message = `Anomaly detected: ${newData} is outside normal range (mean: ${mean.toFixed(2)}, stdDev: ${stdDev.toFixed(2)}).`;
      }
    } else if (typeof learnedData === 'string' && typeof newData === 'string') {
      // Simple string comparison for anomaly
      if (learnedData !== newData) {
        isAnomaly = true;
        message = `Anomaly detected: Expected '${learnedData}', got '${newData}'.`;
      }
    }
    // Add more complex anomaly detection logic here based on data types and patterns

    return { isAnomaly, message };
  }
}

module.exports = MLAnomalyDetector;
