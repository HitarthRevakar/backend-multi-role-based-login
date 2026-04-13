/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // 1. Clear out existing permissions
  await knex('user_permissions').del();
  await knex('permissions').del();

  // 2. Insert the granular permissions
  const permissions = await knex('permissions').insert([
    { name: 'tasks:read', description: 'View tasks' },
    { name: 'tasks:create', description: 'Create tasks' },
    { name: 'tasks:update', description: 'Update task status' },
    { name: 'tasks:delete', description: 'Delete tasks' }
  ]).returning('*');

  // 3. Find the admin user and standard user to apply defaults
  const admin = await knex('users').where({ email: 'admin@system.com' }).first();
  const user = await knex('users').where({ email: 'user@system.com' }).first();

  if (admin) {
    // Admin gets all permissions
    const adminPermissions = permissions.map(p => ({
      user_id: admin.id,
      permission_id: p.id
    }));
    await knex('user_permissions').insert(adminPermissions);
  }

  if (user) {
    // Let's give the standard user just read permission to demonstrate the failure of other actions.
    const readPermission = permissions.find(p => p.name === 'tasks:read');
    if (readPermission) {
      await knex('user_permissions').insert([{
        user_id: user.id,
        permission_id: readPermission.id
      }]);
    }
  }
};
