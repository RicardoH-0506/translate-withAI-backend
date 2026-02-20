/**
 * Translation Routes - Presentation Layer
 * Defines all translation-related HTTP routes using Express Router
 * Uses Controller Injection pattern for better testability
 */
import { Router } from 'express'
import { translationRateLimit, burstProtection } from '@presentation/middleware/rateLimit.js'
import { validateTranslation } from '@presentation/middleware/validation.js'

const router = Router()

/**
 * Create translation routes with controller injection
 * @param {Object} translationController - Translation controller instance
 * @returns {Router} Express router instance
 */
export const createTranslationRoutes = (translationController) => {
  // Health check endpoint
  router.get('/', (req, res) => {
    res.json({
      api_name: 'AI-powered translation API',
      version: 'v1.0',
      status: 'online',
      documentation: 'Use the POST method on the /translate endpoint to send text and receive a translation.',
      available_endpoints: {
        translate: 'POST /translate'
      }
    })
  })

  // Translation endpoint with validation and rate limiting
  router.post('/translate', validateTranslation, burstProtection, translationRateLimit, translationController.translate)

  // 404 handler for translation routes
  router.use((req, res) => {
    res.status(404).json({ error: 'Not Found', message: `Cannot ${req.method} ${req.originalUrl}` })
  })

  return router
}

// Export router for direct use
export { router as translationRouter }
