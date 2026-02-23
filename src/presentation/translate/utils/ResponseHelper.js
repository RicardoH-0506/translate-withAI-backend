/**
 * ResponseHelper - Utility class for HTTP response formatting
 * Standardizes error and success responses across controllers
 */
export class ResponseHelper {
  /**
   * Send success response
   * @param {Object} res - Express response object
   * @param {Object} data - Response data
   * @param {number} statusCode - HTTP status code (default: 200)
   */
  static sendSuccess (res, data, statusCode = 200) {
    res.status(statusCode).json({
      success: true,
      data
    })
  }

  /**
   * Send error response
   * @param {Object} res - Express response object
   * @param {string} code - Error code
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code (default: 500)
   * @param {Object} details - Additional error details
   */
  static sendError (res, code, message, statusCode = 500, details = {}) {
    res.status(statusCode).json({
      success: false,
      error: code,
      message,
      details
    })
  }

  /**
   * Send validation error response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   * @param {Object} details - Additional error details
   */
  static sendValidationError (res, message, details = {}) {
    this.sendError(res, 'VALIDATION_ERROR', message, 400, details)
  }

  /**
   * Send domain error response
   * @param {Object} res - Express response object
   * @param {Error} error - Domain error
   */
  static sendDomainError (res, error) {
    this.sendError(res, error.code, error.message, 400, error.details)
  }

  /**
   * Send internal server error response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   */
  static sendInternalError (res, message = 'Internal server error') {
    this.sendError(res, 'INTERNAL_SERVER_ERROR', message, 500)
  }
}
