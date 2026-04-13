/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  return knex.schema
    .createTable('permissions', table => {
      table.increments('id').primary();
      table.string('name').notNullable().unique(); // e.g. tasks:read, tasks:write
      table.string('description');
      table.timestamps(true, true);
    })
    .createTable('user_permissions', table => {
      table.integer('user_id').unsigned().notNullable()
        .references('id').inTable('users').onDelete('CASCADE');
      table.integer('permission_id').unsigned().notNullable()
        .references('id').inTable('permissions').onDelete('CASCADE');
      table.primary(['user_id', 'permission_id']);
    })
    .createTable('tasks', table => {
      table.increments('id').primary();
      table.string('title').notNullable();
      table.string('status').notNullable().defaultTo('Pending'); // Pending, In Progress, Completed
      table.integer('user_id').unsigned().notNullable()
        .references('id').inTable('users').onDelete('CASCADE');
      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  return knex.schema
    .dropTableIfExists('tasks')
    .dropTableIfExists('user_permissions')
    .dropTableIfExists('permissions');
};
