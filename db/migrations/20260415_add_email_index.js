/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // The UNIQUE constraint on users.email already creates an implicit index in PostgreSQL.
  // This migration is a safety net to ensure the index exists explicitly.
  await knex.raw('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.raw('DROP INDEX IF EXISTS idx_users_email');
};
