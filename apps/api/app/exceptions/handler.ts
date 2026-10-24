import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    if (
      error &&
      typeof error === 'object' &&
      (('status' in error && (error as any).status === 413) ||
        ('code' in error &&
          ((error as any).code === 'E_REQUEST_ENTITY_TOO_LARGE' ||
            (error as any).code === 'E_STREAM_LIMIT_EXCEEDED')))
    ) {
      return ctx.response.status(413).send({
        message: 'Uploaded file or request payload is too large. Please upload smaller files (max 100MB).',
      })
    }
    return super.handle(error, ctx)
  }

  /**
   * The method is used to report error to the logging service or
   * the third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
