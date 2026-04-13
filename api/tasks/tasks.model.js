const db = require('../../db/config');

class TasksModel {
  async getAllTasks(userId) {
    return await db('tasks').where({ user_id: userId }).select('*').orderBy('id', 'asc');
  }

  async createTask(title, user_id) {
    const [task] = await db('tasks').insert({
      title,
      status: 'Pending',
      user_id
    }).returning('*');
    return task;
  }

  async updateTaskStatus(id, userId, status) {
    const [updated] = await db('tasks')
      .where({ id, user_id: userId })
      .update({ status })
      .returning('*');
    return updated;
  }

  async deleteTask(id, userId) {
    return await db('tasks').where({ id, user_id: userId }).del();
  }
}

module.exports = new TasksModel();
