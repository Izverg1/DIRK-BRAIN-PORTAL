class DependencyMapper {
  constructor() {
    console.log('DependencyMapper initialized.');
  }

  /**
   * Detects dependencies between subtasks.
   * This is a simplified example. A real-world dependency mapper would involve
   * more sophisticated graph analysis and potentially AI to infer dependencies.
   * @param {Array<object>} subtasks - An array of subtask objects, each potentially having a 'name' and 'description'.
   * @returns {Array<object>} - The subtasks array with added 'dependencies' property for each subtask.
   */
  detectDependencies(subtasks) {
    // For demonstration, let's assume simple keyword-based dependency detection.
    // In a real scenario, this would be much more complex, potentially involving
    // analyzing the output of one task as input for another, or explicit declarations.

    const subtaskMap = new Map(subtasks.map(task => [task.name.toLowerCase(), task]));

    return subtasks.map(task => {
      let dependencies = [];
      const taskDescriptionLower = task.description ? task.description.toLowerCase() : '';

      // Example: If a task description mentions another task's name, it might depend on it.
      subtasks.forEach(otherTask => {
        if (task.name !== otherTask.name && taskDescriptionLower.includes(otherTask.name.toLowerCase())) {
          dependencies.push(otherTask.name);
        }
      });

      // More specific, hardcoded examples for common patterns
      if (task.name.toLowerCase().includes('implement authentication ui') && subtaskMap.has('set up react project')) {
        dependencies.push('Set up React project');
      }
      if (task.name.toLowerCase().includes('integrate frontend with backend authentication') && subtaskMap.has('implement authentication ui')) {
        dependencies.push('Implement authentication UI');
      }
      if (task.name.toLowerCase().includes('integrate frontend with backend authentication') && subtaskMap.has('set up backend authentication api')) {
        dependencies.push('Set up backend authentication API');
      }
      if (task.name.toLowerCase().includes('write tests') && subtaskMap.has(task.name.toLowerCase().replace('write tests for ', '').replace(' tests', ''))) {
        const relatedTaskName = task.name.toLowerCase().replace('write tests for ', '').replace(' tests', '');
        if (subtaskMap.has(relatedTaskName)) {
          dependencies.push(subtaskMap.get(relatedTaskName).name);
        }
      }

      // Ensure unique dependencies
      task.dependencies = [...new Set(dependencies)];
      return task;
    });
  }
}

module.exports = DependencyMapper;
