import ActivityLog from '#models/activity_log'

export default class ActivityLogService {
  /**
   * Log an activity
   */
  static async log(
    userId: number,
    action: string,
    module: string,
    description?: string,
    ipAddress?: string,
    metadata?: any
  ) {
    try {
      await ActivityLog.create({
        userId,
        action,
        module,
        description,
        ipAddress,
        metadata,
      })
    } catch (error) {
      console.error('Failed to log activity:', error)
    }
  }
}
