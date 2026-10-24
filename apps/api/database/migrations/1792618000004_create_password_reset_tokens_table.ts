import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'password_reset_tokens'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .notNullable()
      table.string('token_hash', 64).notNullable().unique()
      table.timestamp('expires_at', { useTz: true }).notNullable()
      table.boolean('is_used').notNullable().defaultTo(false)
      table.timestamp('used_at', { useTz: true }).nullable()
      table.string('ip_address', 45).nullable()
      table.text('user_agent').nullable()

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()

      table.index(['user_id', 'is_used'], 'idx_pwd_reset_user_used')
      table.index(['expires_at', 'is_used'], 'idx_pwd_reset_expires_used')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
