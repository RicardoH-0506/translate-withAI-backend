/**
 * TranslationError - Domain Error
 * Represents translation-specific domain errors
 * Extends Error for proper error handling
 */
export class TranslationError extends Error {
  /**
   * Create translation error
   * @param {string} message - Error message
   * @param {string} code - Error code (optional)
   * @param {Object} details - Additional error details (optional)
   */
  constructor (message, code = 'TRANSLATION_ERROR', details = {}) {
    super(message)
    this.name = 'TranslationError'
    this.code = code
    this.details = details
    this.timestamp = new Date()
  }

  /**
   * Convert error to JSON
   * @returns {Object} Error representation
   */
  toJSON () {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp
    }
  }
}
