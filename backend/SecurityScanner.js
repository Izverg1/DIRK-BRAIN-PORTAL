class SecurityScanner {
  constructor() {
    console.log('SecurityScanner initialized.');
  }

  /**
   * Scans code for common security vulnerabilities.
   * This is a simplified example. Real-world security scanners are far more complex.
   * @param {string} code - The code to scan.
   * @returns {object} - Detected vulnerabilities and their severity.
   */
  async scanSecurity(code) {
    const vulnerabilities = [];

    // SQL Injection patterns
    if (code.match(/(SELECT\s+\*\s+FROM|DROP\s+TABLE|UNION\s+SELECT|INSERT\s+INTO|DELETE\s+FROM)/i)) {
      vulnerabilities.push({ type: 'SQL Injection', severity: 'critical', message: 'Potential SQL injection pattern detected.' });
    }

    // XSS (Cross-Site Scripting) patterns
    if (code.match(/(<script>|onerror=|javascript:|eval\()/i)) {
      vulnerabilities.push({ type: 'XSS', severity: 'high', message: 'Potential Cross-Site Scripting (XSS) vulnerability detected.' });
    }

    // Command Injection patterns
    if (code.match(/(exec\(|spawn\(|system\(|passthru\()/i)) {
      vulnerabilities.push({ type: 'Command Injection', severity: 'high', message: 'Potential command injection vulnerability detected.' });
    }

    // Hardcoded credentials
    if (code.match(/(password|secret|api_key|token)\s*=\s*['"](?!\s*process\.env)[a-zA-Z0-9_!@#$%^&*()-+=]*['"]/i)) {
      vulnerabilities.push({ type: 'Hardcoded Credentials', severity: 'critical', message: 'Hardcoded sensitive information detected.' });
    }

    // Insecure direct object references (IDOR) - very basic check
    if (code.match(/req\.query\.id|req\.params\.id|req\.body\.id/i) && !code.match(/\b(parseInt|Number)\b/i)) {
      vulnerabilities.push({ type: 'IDOR', severity: 'medium', message: 'Potential Insecure Direct Object Reference (IDOR) detected. Consider input validation.' });
    }

    let overallSeverity = 'none';
    if (vulnerabilities.some(v => v.severity === 'critical')) overallSeverity = 'critical';
    else if (vulnerabilities.some(v => v.severity === 'high')) overallSeverity = 'high';
    else if (vulnerabilities.some(v => v.severity === 'medium')) overallSeverity = 'medium';
    else if (vulnerabilities.some(v => v.severity === 'low')) overallSeverity = 'low';

    return { vulnerabilities, severity: overallSeverity };
  }
}

module.exports = SecurityScanner;
