const { exec } = require('child_process');

class MCPServerManager {
  constructor() {
    console.log('MCPServerManager initialized.');
    this.servers = {}; // Stores MCP server configurations
    this.healthCheckInterval = 60000; // 60 seconds
    this.healthCheckTimer = null;
  }

  addServer(serverId, config) {
    // Placeholder for adding server configuration
    this.servers[serverId] = { id: serverId, ...config, status: 'offline' };
    console.log(`MCP Server ${serverId} added.`);
    return this.servers[serverId];
  }

  startServer(serverId) {
    // Placeholder for starting a server
    if (this.servers[serverId]) {
      this.servers[serverId].status = 'online';
      console.log(`MCP Server ${serverId} started.`);
      return true;
    }
    console.log(`MCP Server ${serverId} not found.`);
    return false;
  }

  stopServer(serverId) {
    // Placeholder for stopping a server
    if (this.servers[serverId]) {
      this.servers[serverId].status = 'offline';
      console.log(`MCP Server ${serverId} stopped.`);
      return true;
    }
    console.log(`MCP Server ${serverId} not found.`);
    return false;
  }

  getServerStatus(serverId) {
    return this.servers[serverId];
  }

  getAllServers() {
    return Object.values(this.servers);
  }

  configureSupabase() {
    console.log("Supabase configuration initiated.");
    console.log("IMPORTANT: Due to local Docker limitations, please manually create the 'YuryAdmin' superuser in Supabase Studio.");
    console.log("1. Open Supabase Studio in your browser: http://127.0.0.1:54323");
    console.log("2. Navigate to the 'SQL Editor'.");
    console.log("3. Execute the following SQL query:");
    console.log("   CREATE ROLE \"YuryAdmin\" WITH LOGIN PASSWORD 'Admin12345!' SUPERUSER;");
    console.log("Once 'YuryAdmin' is created, further Supabase configurations can be automated.");
  }

  async checkServerHealth(serverId) {
    const server = this.servers[serverId];
    if (!server) {
      console.log(`Health Check: Server ${serverId} not found.`);
      return false;
    }

    // For now, a simple check based on the internal status.
    // In a real scenario, this would involve pinging the server's health endpoint or checking its process.
    if (server.status === 'online') {
      console.log(`Health Check: Server ${serverId} is online.`);
      return true;
    } else {
      console.warn(`Health Check: Server ${serverId} is offline.`);
      return false;
    }
  }

  async restartServer(serverId) {
    console.log(`Attempting to restart server ${serverId}...`);
    this.stopServer(serverId);
    // Add a small delay before starting to ensure the process has fully stopped
    await new Promise(resolve => setTimeout(resolve, 2000)); 
    return this.startServer(serverId);
  }

  startHealthMonitor() {
    if (this.healthCheckTimer) {
      console.log('Health monitor already running.');
      return;
    }

    console.log(`Starting MCP server health monitor (interval: ${this.healthCheckInterval / 1000} seconds).`);
    this.healthCheckTimer = setInterval(async () => {
      console.log('Running periodic health check for MCP servers...');
      for (const serverId in this.servers) {
        const isHealthy = await this.checkServerHealth(serverId);
        if (!isHealthy) {
          console.warn(`Server ${serverId} is unhealthy. Attempting restart...`);
          const restarted = await this.restartServer(serverId);
          if (restarted) {
            console.log(`Server ${serverId} restarted successfully.`);
          } else {
            console.error(`Failed to restart server ${serverId}.`);
          }
        }
      }
    }, this.healthCheckInterval);
  }

  stopHealthMonitor() {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
      console.log('MCP server health monitor stopped.');
    }
  }
}

module.exports = MCPServerManager;
