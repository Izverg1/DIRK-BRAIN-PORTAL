const fs = require('fs').promises;
const path = require('path');

class TaskRegistryManager {
  constructor() {
    this.taskRegistryPath = path.join(__dirname, 'dirk_protocol', 'task_registry.json');
  }

  async _readRegistry() {
    const data = await fs.readFile(this.taskRegistryPath, 'utf8');
    return JSON.parse(data);
  }

  async _writeRegistry(data) {
    await fs.writeFile(this.taskRegistryPath, JSON.stringify(data, null, 2), 'utf8');
  }

  async getTasks() {
    try {
      return await this._readRegistry();
    } catch (error) {
      console.error('Error reading task registry:', error);
      return null;
    }
  }

  async addTask(task) {
    try {
      const registry = await this._readRegistry();
      const taskId = `DIRK-TASK-${Date.now()}`;
      registry.active_tasks.push(taskId);
      registry.task_counter++;
      registry.last_updated = new Date().toISOString();
      // A full implementation would also create a corresponding task file
      // in the active_tasks directory.
      await this._writeRegistry(registry);
      return { taskId, registry };
    } catch (error) {
      console.error('Error adding task:', error);
      return null;
    }
  }

  async completeTask(taskId) {
    try {
      const registry = await this._readRegistry();
      const taskIndex = registry.active_tasks.indexOf(taskId);

      if (taskIndex > -1) {
        registry.active_tasks.splice(taskIndex, 1);
        registry.completed_tasks.push(taskId);
        registry.last_updated = new Date().toISOString();
        registry.statistics.total_tasks_completed++;
        await this._writeRegistry(registry);
        return registry;
      } else {
        console.error(`Task with ID ${taskId} not found in active tasks.`);
        return null;
      }
    } catch (error) {
      console.error('Error completing task:', error);
      return null;
    }
  }
}

module.exports = TaskRegistryManager;
