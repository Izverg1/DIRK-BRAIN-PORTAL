// tests/integration/test-api-endpoints.js
const assert = require('assert');
const axios = require('axios');

const BASE_URL = 'http://localhost:3002/api';

describe('API Endpoints Integration', () => {
  it('should decompose a task via /api/godmode/decompose', async () => {
    const response = await axios.post(`${BASE_URL}/godmode/decompose`, {
      taskDescription: 'Build a simple login form',
    });
    assert.strictEqual(response.status, 200);
    assert(response.data.subtasks.length > 0);
  });

  it('should store and retrieve credentials via /api/credentials', async () => {
    const serviceName = 'testService';
    const key = 'testKey';
    const value = 'testValue';

    // Store credential
    const storeResponse = await axios.post(`${BASE_URL}/credentials/store`, {
      serviceName, key, value
    });
    assert.strictEqual(storeResponse.status, 200);

    // Retrieve credential
    const listResponse = await axios.get(`${BASE_URL}/credentials/list/${serviceName}`);
    assert.strictEqual(listResponse.status, 200);
    assert(listResponse.data.includes(key));

    // Remove credential
    const removeResponse = await axios.delete(`${BASE_URL}/credentials/remove/${serviceName}/${key}`);
    assert.strictEqual(removeResponse.status, 200);
  });

  // Add more tests for other API endpoints
});
