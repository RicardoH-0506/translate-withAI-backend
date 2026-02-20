/**
 * TranslationController - Presentation Layer
 * Handles HTTP requests and responses for translation endpoints
 * Only deals with HTTP concerns, delegates business logic to services
 */
import { createSuccessResponse } from '../../../application/translate/dto/TranslateResponseDTO.js'
export class TranslationController {
  /**
   * Create controller with translation service
   * @param {TranslationService} translationService - Application service
   */
  constructor (translationService) {
    this.translationService = translationService
  }

  /**
   * Handle translation request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  translate = async (req, res) => {
    // Use validated data from middleware
    const { fromLang, toLang, text } = req.validatedBody

    try {
      // Delegate to application service
      const result = await this.translationService.translateText(fromLang, toLang, text)

      // Return success response using DTO
      res.json(createSuccessResponse(result))
    } catch (error) {
      console.error('Translation error:', error)

      // Handle domain errors
      if (error.name === 'TranslationError') {
        return res.status(400).json({
          success: false,
          error: error.code,
          message: error.message,
          details: error.details
        })
      }

      // Handle unexpected errors
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred during translation'
      })
    }
  }

  /**
   * Get supported languages
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getSupportedLanguages = async (req, res) => {
    try {
      const languages = this.translationService.getSupportedLanguages()

      res.json({
        success: true,
        data: languages
      })
    } catch (error) {
      console.error('Get languages error:', error)

      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve supported languages'
      })
    }
  }

  /**
   * Check service health
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  healthCheck = async (req, res) => {
    try {
      res.json({
        success: true,
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          service: 'translation'
        }
      })
    } catch (error) {
      console.error('Health check error:', error)

      res.status(500).json({
        success: false,
        error: 'HEALTH_CHECK_FAILED',
        message: 'Service health check failed'
      })
    }
  }
}
