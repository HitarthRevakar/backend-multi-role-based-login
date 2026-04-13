const tasksModel = require('./tasks.model');

class TasksService {
  async getTasks(userId) {
    return await tasksModel.getAllTasks(userId);
  }

  async addTask(title, userId) {
    if (!title) {
      const error = new Error('Title is required');
      error.statusCode = 400;
      throw error;
    }
    return await tasksModel.createTask(title, userId);
  }

  async modifyStatus(id, userId, status) {
    const validStatuses = ['Pending', 'In Progress', 'Completed'];
    if (!validStatuses.includes(status)) {
      const error = new Error('Invalid status update');
      error.statusCode = 400;
      throw error;
    }
    const updated = await tasksModel.updateTaskStatus(id, userId, status);
    if (!updated) {
      const error = new Error('Task not found or unauthorized');
      error.statusCode = 404;
      throw error;
    }
    return updated;
  }

  async removeTask(id, userId) {
    const deletedCount = await tasksModel.deleteTask(id, userId);
    if (!deletedCount) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }
    return { success: true };
  }
}

module.exports = new TasksService();
