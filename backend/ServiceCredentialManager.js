const crypto = require('crypto');

class ServiceCredentialManager {
  constructor() {
    this.credentials = {}; // In-memory store for demonstration
    console.log('ServiceCredentialManager initialized.');
  }

  // Helper to derive a user-specific key and IV (for demonstration only, not cryptographically secure)
  _deriveUserKeyAndIV(userId) {
    const salt = crypto.scryptSync(userId, 'salt', 16); // Use userId as part of salt
    const key = crypto.scryptSync(userId + '_key', salt, 32); // 32 bytes for AES-256
    const iv = crypto.scryptSync(userId + '_iv', salt, 16); // 16 bytes for IV
    return { key, iv };
  }

  encrypt(text, userId) {
    const { key, iv } = this._deriveUserKeyAndIV(userId);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return { encryptedValue: encrypted, iv: iv.toString('hex') }; // Store IV with encrypted value
  }

  decrypt(encryptedText, storedIv, userId) {
    const { key } = this._deriveUserKeyAndIV(userId);
    const ivBuffer = Buffer.from(storedIv, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, ivBuffer);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  storeCredential(userId, serviceName, key, value) {
    // Basic validation
    if (!userId || !serviceName || !key || !value) {
      throw new Error('User ID, service name, key, and value are required.');
    }

    const { encryptedValue, iv } = this.encrypt(value, userId);
    if (!this.credentials[userId]) {
      this.credentials[userId] = {};
    }
    if (!this.credentials[userId][serviceName]) {
      this.credentials[userId][serviceName] = {};
    }
    this.credentials[userId][serviceName][key] = { encryptedValue, iv };
    console.log(`Credential for ${serviceName}:${key} stored for user ${userId}.`);
    return true;
  }

  getCredential(userId, serviceName, key) {
    if (this.credentials[userId] && this.credentials[userId][serviceName] && this.credentials[userId][serviceName][key]) {
      const { encryptedValue, iv } = this.credentials[userId][serviceName][key];
      return this.decrypt(encryptedValue, iv, userId);
    }
    return null;
  }

  listCredentials(userId, serviceName) {
    if (!this.credentials[userId]) {
      return [];
    }
    if (serviceName) {
      return this.credentials[userId][serviceName] ? Object.keys(this.credentials[userId][serviceName]) : [];
    }
    return Object.keys(this.credentials[userId]);
  }

  removeCredential(userId, serviceName, key) {
    if (this.credentials[userId] && this.credentials[userId][serviceName] && this.credentials[userId][serviceName][key]) {
      delete this.credentials[userId][serviceName][key];
      console.log(`Credential for ${serviceName}:${key} removed for user ${userId}.`);
      return true;
    }
    return false;
  }

  storeOAuthToken(userId, serviceName, tokenData) {
    if (!userId || !serviceName || !tokenData || !tokenData.accessToken) {
      throw new Error('User ID, service name, and token data with accessToken are required.');
    }
    // Encrypt sensitive parts of tokenData if necessary, or store as is if already handled by OAuth flow
    // For simplicity, storing the entire tokenData object as a single credential value
    const tokenKey = 'oauth_token';
    return this.storeCredential(userId, serviceName, tokenKey, JSON.stringify(tokenData));
  }

  getOAuthToken(userId, serviceName) {
    const tokenKey = 'oauth_token';
    const encryptedTokenData = this.getCredential(userId, serviceName, tokenKey);
    return encryptedTokenData ? JSON.parse(encryptedTokenData) : null;
  }

  // Placeholder for OAuth token refresh logic
  async refreshOAuthToken(userId, serviceName, refreshToken) {
    console.log(`Refreshing OAuth token for ${serviceName} for user ${userId}.`);
    // In a real scenario, this would involve making an API call to Google's OAuth endpoint
    // using the refresh token to get a new access token and potentially a new refresh token.
    // For demonstration, we'll simulate a new token.
    const newAccessToken = `new_access_token_${Date.now()}`;
    const newTokenData = {
      accessToken: newAccessToken,
      refreshToken: refreshToken, // Refresh token might change or remain the same
      expiryDate: Date.now() + 3600 * 1000, // 1 hour from now
    };
    this.storeOAuthToken(userId, serviceName, newTokenData);
    return newTokenData;
  }

  // Placeholder for credential rotation logic
  async rotateCredential(userId, serviceName, key, newValue) {
    console.log(`Attempting to rotate credential for ${serviceName}:${key} for user ${userId}`);
    // In a real scenario, this would involve more complex logic, e.g., API calls to the service
    // to invalidate the old key and activate the new one.

    // 1. Validate the new credential
    const isValid = await this.validateCredential(serviceName, newValue); // Simulate validation
    if (!isValid) {
      console.warn(`Validation failed for new credential for ${serviceName}:${key}. Rotation aborted.`);
      return false;
    }

    // 2. Store the new credential
    const success = this.storeCredential(userId, serviceName, key, newValue);
    if (success) {
      console.log(`Credential for ${serviceName}:${key} rotated successfully for user ${userId}.`);
      // In a real system, you might also log the old key's invalidation.
      return true;
    } else {
      console.error(`Failed to store new credential during rotation for ${serviceName}:${key}.`);
      return false;
    }
  }

  // Simulated credential validation. In a real system, this would involve API calls
  // to the respective service to verify the key's authenticity and permissions.
  async validateCredential(serviceName, credentialValue) {
    console.log(`Simulating validation for ${serviceName} credential.`);
    // For demonstration, a very basic validation:
    if (credentialValue && credentialValue.length > 10 && !credentialValue.includes('invalid')) {
      return true; // Simulate valid
    }
    return false; // Simulate invalid
  }

  /**
   * Simulates secure credential sharing between agents.
   * In a real system, this would involve a robust authorization mechanism
   * to ensure the requesting agent is permitted to access the credential.
   * @param {string} userId - The ID of the user who owns the credential.
   * @param {string} requestingAgentId - The ID of the agent requesting the credential.
   * @param {string} serviceName - The name of the service the credential belongs to.
   * @param {string} key - The specific key of the credential.
   * @returns {string|null} - The decrypted credential value if authorized, otherwise null.
   */
  async shareCredential(userId, requestingAgentId, serviceName, key) {
    console.log(`Agent ${requestingAgentId} requesting credential for ${serviceName}:${key} for user ${userId}.`);

    // Placeholder for authorization logic:
    // In a real system, you would check if requestingAgentId has permissions
    // to access this specific credential for this user.
    const isAuthorized = true; // Simulate always authorized for demonstration

    if (isAuthorized) {
      const credential = this.getCredential(userId, serviceName, key);
      if (credential) {
        console.log(`Credential for ${serviceName}:${key} shared with agent ${requestingAgentId}.`);
        return credential;
      } else {
        console.warn(`Credential for ${serviceName}:${key} not found for user ${userId}.`);
        return null;
      }
    } else {
      console.warn(`Agent ${requestingAgentId} is not authorized to access credential for ${serviceName}:${key}.`);
      return null;
    }
  }
}

module.exports = ServiceCredentialManager;
