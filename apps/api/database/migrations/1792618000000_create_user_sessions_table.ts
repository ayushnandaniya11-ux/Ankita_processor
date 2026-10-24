import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_sessions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('session_id_hash', 64).notNullable().unique()
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .notNullable()
      table.string('role', 32).notNullable()
      table.string('ip_address', 45).nullable()
      table.text('user_agent').nullable()
      table.boolean('is_remember_me').notNullable().defaultTo(false)
      table.boolean('is_revoked').notNullable().defaultTo(false)
      table.string('revoked_reason', 255).nullable()
      table.timestamp('idle_expires_at', { useTz: true }).notNullable()
      table.timestamp('expires_at', { useTz: true }).notNullable()
      table.timestamp('last_activity_at', { useTz: true }).notNullable()

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()

      // Compound indexes for fast lookup and cleanup
      table.index(['user_id', 'is_revoked'], 'idx_user_sessions_user_revoked')
      table.index(['expires_at', 'is_revoked'], 'idx_user_sessions_expires_revoked')
      table.index(['idle_expires_at', 'is_revoked'], 'idx_user_sessions_idle_revoked')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
