/**
 * TranslationController - Presentation Layer
 * Handles HTTP requests and responses for translation endpoints
 * Only deals with HTTP concerns, delegates business logic to services
 */
import { createSuccessResponse } from '../../../application/translate/dto/TranslateResponseDTO.js'
import { ResponseHelper } from '../utils/ResponseHelper.js'

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
    try {
      const { fromLang, toLang, text } = req.validatedBody
      const result = await this.translationService.translateText(fromLang, toLang, text)

      res.json(createSuccessResponse(result))
    } catch (error) {
      this.#handleTranslationError(error, res)
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
      ResponseHelper.sendSuccess(res, languages)
    } catch (error) {
      console.error('Get languages error:', error)
      ResponseHelper.sendInternalError(res, 'Failed to retrieve supported languages')
    }
  }

  /**
   * Check service health
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  healthCheck = async (req, res) => {
    try {
      const healthData = this.#createHealthData()
      ResponseHelper.sendSuccess(res, healthData)
    } catch (error) {
      console.error('Health check error:', error)
      ResponseHelper.sendInternalError(res, 'Service health check failed')
    }
  }

  /**
   * Handle translation errors
   * @private
   * @param {Error} error - Error to handle
   * @param {Object} res - Express response object
   */
  #handleTranslationError (error, res) {
    console.error('Translation error:', error)

    if (error.name === 'TranslationError') {
      ResponseHelper.sendDomainError(res, error)
    } else {
      ResponseHelper.sendInternalError(res, 'An unexpected error occurred during translation')
    }
  }

  /**
   * Create health check data
   * @private
   * @returns {Object} Health data
   */
  #createHealthData () {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'translation'
    }
  }
}
