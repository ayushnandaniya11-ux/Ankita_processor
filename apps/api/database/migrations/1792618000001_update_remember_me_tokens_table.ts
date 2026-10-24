import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'remember_me_tokens'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .nullable()
      table.string('series', 64).nullable().unique()
      table.string('token_hash', 64).nullable()
      table.timestamp('expires_at', { useTz: true }).nullable()
      table.string('ip_address', 45).nullable()
      table.text('user_agent').nullable()

      table.index(['user_id'], 'idx_remember_me_tokens_user')
      table.index(['expires_at'], 'idx_remember_me_tokens_expires')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex(['user_id'], 'idx_remember_me_tokens_user')
      table.dropIndex(['expires_at'], 'idx_remember_me_tokens_expires')
      table.dropColumn('user_id')
      table.dropColumn('series')
      table.dropColumn('token_hash')
      table.dropColumn('expires_at')
      table.dropColumn('ip_address')
      table.dropColumn('user_agent')
    })
  }
}
