const db = require('../../db/config');

class AuthModel {
  /**
   * Fetches a user by their email address and joins their role.
   * @param {string} email 
   * @returns {Promise<Object>}
   */
  async getUserByEmail(email) {
    return await db('users')
      .join('roles', 'users.role_id', 'roles.id')
      .select('users.*', 'roles.name as role')
      .where('users.email', email)
      .first();
  }

  async getRoleByName(roleName) {
    return await db('roles').where({ name: roleName }).first();
  }

  async createUser(userData) {
    const [user] = await db('users').insert(userData).returning(['id', 'name', 'email', 'is_active', 'role_id']);
    return user;
  }
}

module.exports = new AuthModel();
