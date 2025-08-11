const StaticAnalysisEngine = require('./StaticAnalysisEngine');
const SecurityScanner = require('./SecurityScanner');
const MLAnomalyDetector = require('./MLAnomalyDetector');

class MrWolfAdvisor {
  constructor() {
    console.log('MrWolfAdvisor initialized.');
    this.staticAnalysisEngine = new StaticAnalysisEngine();
    this.securityScanner = new SecurityScanner();
    this.mlAnomalyDetector = new MLAnomalyDetector();

    // Example: Learn a pattern for code length (for anomaly detection)
    this.mlAnomalyDetector.learnPattern('codeLength', [50, 75, 60, 80, 90, 45, 70, 65, 55, 85]);
  }

  async analyzeCode(code) {
    let advisories = [];

    // 1. Security Vulnerability Detection
    const securityScanResult = await this.securityScanner.scanSecurity(code);
    securityScanResult.vulnerabilities.forEach(vuln => {
      advisories.push({ type: vuln.severity.toUpperCase(), message: `Security: ${vuln.message} (${vuln.type})` });
    });

    // 2. Code Quality Checks (using StaticAnalysisEngine for JavaScript)
    const staticAnalysisResult = await this.staticAnalysisEngine.analyzeJavaScript(code);
    if (staticAnalysisResult.success) {
      staticAnalysisResult.results.forEach(fileResult => {
        fileResult.messages.forEach(msg => {
          advisories.push({ type: msg.severity.toUpperCase(), message: `Code Quality: ${msg.message} (Rule: ${msg.ruleId}) at line ${msg.line}, column ${msg.column}` });
        });
      });
    } else {
      advisories.push({ type: 'ERROR', message: `Code Quality: Failed to run static analysis: ${staticAnalysisResult.error}` });
    }

    // 3. Performance Anti-pattern Detection (existing logic)
    if (code.match(/for\s*\(\s*let\s+i\s*=\s*0;\s*i\s*<\s*array.length;\s*i\s*++\s*)\{.*array.indexOf/s)) {
      advisories.push({ type: 'WARNING', message: 'Performance: Inefficient loop with indexOf inside. Consider using a Map or Set for faster lookups.' });
    }
    if (code.match(/setTimeout\s*\(\s*\w+,\s*0\)/)) {
      advisories.push({ type: 'INFO', message: 'Performance: setTimeout with 0ms delay. Consider using process.nextTick or setImmediate for better control.' });
    }

    // 4. ML-based Anomaly Detection (e.g., unusually long code files)
    const codeLength = code.split(/\r\n|\r|\n/).length;
    const anomalyResult = this.mlAnomalyDetector.detectAnomaly('codeLength', codeLength);
    if (anomalyResult.isAnomaly) {
      advisories.push({ type: 'WARNING', message: `Anomaly: ${anomalyResult.message}` });
    }

    // Existing simple checks (can be removed if covered by static analysis)
    if (code.includes('console.log')) {
      advisories.push({ type: 'INFO', message: 'Code Quality: console.log detected. Consider using a proper logging mechanism.' });
    }
    if (code.includes('FIXME')) {
      advisories.push({ type: 'WARNING', message: 'Code Quality: FIXME comment detected. Address technical debt.' });
    }

    if (advisories.length === 0) {
      return [{ type: 'INFO', message: 'No immediate advisories.' }];
    }

    return advisories;
  }
}

module.exports = MrWolfAdvisor;
