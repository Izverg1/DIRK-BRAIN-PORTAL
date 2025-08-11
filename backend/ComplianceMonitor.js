class ComplianceMonitor {
  constructor() {
    console.log('ComplianceMonitor initialized.');
    this.complianceRules = [
      { id: 'data_encryption', description: 'All sensitive data must be encrypted.', compliant: true },
      { id: 'access_logs', description: 'All access to critical systems must be logged.', compliant: true },
    ];
    this.reports = [];
  }

  /**
   * Simulates checking compliance against defined rules.
   * @param {object} activity - The activity to check for compliance.
   * @returns {object} - An object indicating compliance status and any violations.
   */
  checkCompliance(activity) {
    console.log('Checking compliance for activity...', activity);
    const violations = [];
    let overallCompliant = true;

    // Simulate compliance checks based on activity properties
    if (activity.type === 'data_access' && activity.data.sensitive && !activity.data.encrypted) {
      violations.push({ ruleId: 'data_encryption', message: 'Sensitive data accessed without encryption.' });
      overallCompliant = false;
    }
    if (activity.type === 'system_login' && !activity.logged) {
      violations.push({ ruleId: 'access_logs', message: 'Critical system login not logged.' });
      overallCompliant = false;
    }

    const result = { timestamp: Date.now(), activity, overallCompliant, violations };
    this.reports.push(result);
    return result;
  }

  /**
   * Generates a compliance report.
   * @returns {Array<object>} - A list of all recorded compliance check results.
   */
  generateReport() {
    console.log('Generating compliance report...');
    return this.reports;
  }
}

module.exports = ComplianceMonitor;
