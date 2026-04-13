const bcrypt = require('bcrypt');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('users').del();
  await knex('roles').del();
  
  // Insert roles
  const roles = await knex('roles').insert([
    { name: 'admin' },
    { name: 'user' }
  ]).returning('*');

  const adminRole = roles.find(r => r.name === 'admin');
  const userRole = roles.find(r => r.name === 'user');

  // Insert default admin and user
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash('admin123', salt);
  const user_password_hash = await bcrypt.hash('user123', salt);

  await knex('users').insert([
    {
      name: 'System Admin',
      email: 'admin@system.com',
      password_hash: password_hash,
      role_id: adminRole.id,
      is_active: true
    },
    {
      name: 'Standard User',
      email: 'user@system.com',
      password_hash: user_password_hash,
      role_id: userRole.id,
      is_active: true
    }
  ]);
};
