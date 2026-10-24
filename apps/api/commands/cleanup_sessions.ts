import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import SessionService from '#services/session_service'

export default class CleanupSessions extends BaseCommand {
  static commandName = 'sessions:cleanup'
  static description = 'Clean up expired and stale revoked user sessions from PostgreSQL database'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('Starting expired sessions cleanup...')
    try {
      const result = await SessionService.cleanupExpiredSessions()
      this.logger.success(
        `Session cleanup completed: ${result.cleanedSessions} expired session(s) and ${result.cleanedRememberTokens} remember token(s) cleaned.`
      )
    } catch (error: any) {
      this.logger.error(`Session cleanup failed: ${error.message}`)
      this.exitCode = 1
    }
  }
}
