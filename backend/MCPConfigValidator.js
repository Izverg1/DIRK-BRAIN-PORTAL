class MCPConfigValidator {
  constructor() {
    console.log('MCPConfigValidator initialized.');
  }

  validateConfig(config) {
    const errors = [];

    if (!config.serverId) {
      errors.push('Server ID is required.');
    }
    if (!config.command) {
      errors.push('Command is required.');
    }
    if (!Array.isArray(config.args)) {
      errors.push('Args must be an array.');
    }

    // Basic validation for command existence (can be expanded for more robust checks)
    // This is a simplified check and might need platform-specific adjustments
    // For a real-world scenario, consider using a library like `which` or `command-exists`
    // if (config.command && !this._commandExists(config.command)) {
    //   errors.push(`Command '${config.command}' not found.`);
    // }

    // Specific validation for 'supabase' MCP
    if (config.serverId === 'supabase') {
      if (!config.args.includes('--access-token')) {
        errors.push('Supabase MCP requires --access-token in args.');
      }
      // Further validation for access token format could be added here
    }

    return { isValid: errors.length === 0, errors };
  }

  // Placeholder for command existence check
  // _commandExists(command) {
  //   // This is a simplified placeholder. A real implementation would check PATH or specific locations.
  //   return true; 
  // }

  fixConfig(config) {
    // This is a placeholder for automatic fixes. Implement based on common issues.
    // Example: ensure args is an array
    if (!Array.isArray(config.args)) {
      config.args = [];
    }
    return config;
  }
}

module.exports = MCPConfigValidator;