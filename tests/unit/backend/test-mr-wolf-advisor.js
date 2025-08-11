// tests/unit/backend/test-mr-wolf-advisor.js
const assert = require('assert');
const MrWolfAdvisor = require('../../../backend/MrWolfAdvisor');

describe('MrWolfAdvisor', () => {
  it('should detect SQL injection vulnerability', async () => {
    const advisor = new MrWolfAdvisor();
    const code = 'const query = "SELECT * FROM users WHERE id = " + userId;';
    const advisories = await advisor.analyzeCode(code);
    assert(advisories.some(a => a.message.includes('SQL Injection')));
  });

  it('should detect XSS vulnerability', async () => {
    const advisor = new MrWolfAdvisor();
    const code = 'const html = '<script>alert("XSS")</script>';';
    const advisories = await advisor.analyzeCode(code);
    assert(advisories.some(a => a.message.includes('XSS')));
  });

  it('should detect console.log', async () => {
    const advisor = new MrWolfAdvisor();
    const code = 'console.log("debug");';
    const advisories = await advisor.analyzeCode(code);
    assert(advisories.some(a => a.message.includes('console.log')));
  });

  // Add more tests for other checks
});
