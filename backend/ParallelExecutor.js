class ParallelExecutor {
  constructor() {
    console.log('ParallelExecutor initialized.');
  }

  /**
   * Simulates parallel execution of tasks with dependency resolution.
   * In a real scenario, this would involve a more sophisticated task scheduler and runner.
   * @param {Array<object>} tasks - An array of task objects, each potentially having a 'dependencies' array.
   * @returns {Promise<Array<object>>} - A promise that resolves with the results of the executed tasks.
   */
  async executeTasks(tasks) {
    console.log('Executing tasks in parallel with dependency resolution...');
    const results = [];
    const completedTasks = new Set();

    const executeSingleTask = async (task) => {
      console.log(`Executing task: ${task.name || task.id}`);
      // Simulate asynchronous task execution
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
      const result = { taskId: task.id, status: 'completed', output: `Output for ${task.name || task.id}` };
      results.push(result);
      completedTasks.add(task.id);
      console.log(`Task completed: ${task.name || task.id}`);
      return result;
    };

    const canExecute = (task) => {
      if (!task.dependencies || task.dependencies.length === 0) {
        return true;
      }
      return task.dependencies.every(dep => completedTasks.has(dep));
    };

    let executableTasks = [];
    let pendingTasks = [...tasks];

    while (pendingTasks.length > 0) {
      executableTasks = pendingTasks.filter(task => canExecute(task));

      if (executableTasks.length === 0 && pendingTasks.length > 0) {
        // Circular dependency or unresolvable dependencies
        console.error('Circular or unresolvable dependencies detected. Remaining tasks:', pendingTasks.map(t => t.id));
        throw new Error('Circular or unresolvable dependencies detected.');
      }

      const executionPromises = executableTasks.map(task => executeSingleTask(task));
      await Promise.all(executionPromises);

      pendingTasks = pendingTasks.filter(task => !completedTasks.has(task.id));
    }

    console.log('All tasks executed.');
    return results;
  }
}

module.exports = ParallelExecutor;
