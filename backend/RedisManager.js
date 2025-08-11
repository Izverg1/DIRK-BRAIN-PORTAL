const Redis = require('ioredis');

class RedisManager {
  constructor() {
    this.redis = new Redis({
      port: 6379, // Redis port
      host: '127.0.0.1', // Redis host
      family: 4, // 4 (IPv4) or 6 (IPv6)
      password: '', // Redis password, if any
      db: 0,
    });

    this.redis.on('connect', () => {
      console.log('Redis: Connected to Redis server.');
    });

    this.redis.on('error', (err) => {
      console.error('Redis: Error connecting to Redis:', err);
    });
  }

  async set(key, value, expiryMode, time) {
    try {
      if (expiryMode && time) {
        await this.redis.set(key, value, expiryMode, time);
      } else {
        await this.redis.set(key, value);
      }
      return true;
    } catch (error) {
      console.error(`Redis: Error setting key ${key}:`, error);
      return false;
    }
  }

  async get(key) {
    try {
      const value = await this.redis.get(key);
      return value;
    } catch (error) {
      console.error(`Redis: Error getting key ${key}:`, error);
      return null;
    }
  }

  async del(key) {
    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      console.error(`Redis: Error deleting key ${key}:`, error);
      return false;
    }
  }

  async quit() {
    try {
      await this.redis.quit();
      console.log('Redis: Disconnected from Redis server.');
      return true;
    } catch (error) {
      console.error('Redis: Error disconnecting from Redis:', error);
      return false;
    }
  }
}

module.exports = RedisManager;
