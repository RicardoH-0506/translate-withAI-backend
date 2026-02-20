/**
 * Validation Middleware - Presentation Layer
 * Handles HTTP request validation using Zod schemas
 * Follows clean architecture: validation in presentation layer
 */
import { translateRequestSchema } from '../../application/dto/TranslateRequestDTO.js'

/**
 * Validates translation request body using Zod schema
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateTranslation = (req, res, next) => {
  const result = translateRequestSchema.safeParse(req.body)

  if (!result.success) {
    // Format validation errors for better UX
    const fieldErrors = {}
    result.error.issues.forEach(issue => {
      const field = issue.path.join('.')
      fieldErrors[field] = issue.message
    })

    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Invalid request parameters',
      details: fieldErrors,
      received: req.body
    })
  }

  // Attach validated data to request object
  req.validatedBody = result.data
  next()
}

/**
 * Validates query parameters for GET requests
 * Currently not used but prepared for future endpoints
 */
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.query)

    if (!result.success) {
      const fieldErrors = {}
      result.error.issues.forEach(issue => {
        const field = issue.path.join('.')
        fieldErrors[field] = issue.message
      })

      return res.status(400).json({
        success: false,
        error: 'QUERY_VALIDATION_ERROR',
        message: 'Invalid query parameters',
        details: fieldErrors,
        received: req.query
      })
    }

    req.validatedQuery = result.data
    next()
  }
}

/**
 * Generic validation middleware for any Zod schema
 * @param {ZodSchema} schema - Zod schema to validate against
 * @param {string} source - 'body', 'query', or 'params'
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = req[source]
    const result = schema.safeParse(data)

    if (!result.success) {
      const fieldErrors = {}
      result.error.issues.forEach(issue => {
        const field = issue.path.join('.')
        fieldErrors[field] = issue.message
      })

      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: `Invalid ${source} parameters`,
        details: fieldErrors,
        received: data
      })
    }

    req[`validated${source.charAt(0).toUpperCase() + source.slice(1)}`] = result.data
    next()
  }
}
