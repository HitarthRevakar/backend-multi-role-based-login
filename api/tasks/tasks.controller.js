const tasksService = require('./tasks.services');

class TasksController {
  async getAllTasks(req, res, next) {
    try {
      const tasks = await tasksService.getTasks(req.user.id);
      res.json(tasks);
    } catch (err) {
      next(err);
    }
  }

  async createTask(req, res, next) {
    try {
      const { title } = req.body;
      const task = await tasksService.addTask(title, req.user.id);
      res.status(201).json(task);
    } catch (err) {
      if (err.statusCode) return res.status(err.statusCode).json({ message: err.message });
      next(err);
    }
  }

  async updateTask(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await tasksService.modifyStatus(id, req.user.id, status);
      res.json(updated);
    } catch (err) {
      if (err.statusCode) return res.status(err.statusCode).json({ message: err.message });
      next(err);
    }
  }

  async deleteTask(req, res, next) {
    try {
      const { id } = req.params;
      await tasksService.removeTask(id, req.user.id);
      res.json({ message: 'Task deleted successfully' });
    } catch (err) {
      if (err.statusCode) return res.status(err.statusCode).json({ message: err.message });
      next(err);
    }
  }
}

module.exports = new TasksController();
