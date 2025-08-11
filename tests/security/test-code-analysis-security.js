// tests/security/test-code-analysis-security.js
const assert = require('assert');
const MrWolfAdvisor = require('../../../backend/MrWolfAdvisor');

describe('Security: Code Analysis Security', () => {
  it('Mr. Wolf should detect known security vulnerabilities in code', async () => {
    const advisor = new MrWolfAdvisor();
    const vulnerableCode = `
      const userId = req.query.id;
      const query = "SELECT * FROM users WHERE id = " + userId;
      eval("alert('xss')");
    `;
    const advisories = await advisor.analyzeCode(vulnerableCode);
    assert(advisories.some(a => a.message.includes('SQL Injection')));
    assert(advisories.some(a => a.message.includes('XSS')));
  });

  // Add more tests for different types of vulnerabilities
});
