/**
 * Environment-aware logger
 * Only logs in development mode to prevent data leaks in production
 */

const isDev = process.env.NODE_ENV === 'development'

export const logger = {
  /**
   * Debug logging - only in development
   * Use for implementation details, state changes, etc.
   */
  debug: (...args: any[]) => {
    if (isDev) {
      console.log(...args)
    }
  },

  /**
   * Info logging - only in development
   * Use for general informational messages
   */
  info: (...args: any[]) => {
    if (isDev) {
      console.info(...args)
    }
  },

  /**
   * Warning logging - only in development
   * Use for non-critical issues
   */
  warn: (...args: any[]) => {
    if (isDev) {
      console.warn(...args)
    }
  },

  /**
   * Error logging - always enabled
   * Use for actual errors that need to be tracked in production
   * Note: Avoid logging sensitive data in error messages
   */
  error: (...args: any[]) => {
    console.error(...args)
  },
}
