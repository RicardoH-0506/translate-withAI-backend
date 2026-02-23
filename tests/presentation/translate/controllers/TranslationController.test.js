import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TranslationController } from '../../../../src/presentation/translate/controllers/TranslationController.js'
import { TranslationError } from '../../../../src/core/translate/errors/TranslationError.js'

describe('TranslationController', () => {
  let translationController
  let mockService
  let mockRequest
  let mockResponse

  beforeEach(() => {
    // Mock service
    mockService = {
      translateText: vi.fn(),
      getSupportedLanguages: vi.fn().mockReturnValue({ en: 'English', es: 'Español' })
    }
    translationController = new TranslationController(mockService)

    // Mock request and response
    mockRequest = {
      validatedBody: {
        fromLang: 'en',
        toLang: 'es',
        text: 'Hello world'
      }
    }
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    }
  })

  describe('translate()', () => {
    it('should translate text successfully', async () => {
      const mockTranslationResult = {
        id: 'test-uuid',
        originalText: 'Hello world',
        translatedText: 'Hola mundo',
        fromLang: 'en',
        toLang: 'es',
        fromCode: 'English',
        toCode: 'Español',
        status: 'completed',
        createdAt: new Date(),
        duration: 150
      }
      mockService.translateText.mockResolvedValue(mockTranslationResult)

      await translationController.translate(mockRequest, mockResponse)

      expect(mockService.translateText).toHaveBeenCalledWith('en', 'es', 'Hello world')
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockTranslationResult
      })
    })

    it('should handle TranslationError from service', async () => {
      const translationError = new TranslationError('Invalid language', 'INVALID_LANGUAGE')
      mockService.translateText.mockRejectedValue(translationError)

      await translationController.translate(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'INVALID_LANGUAGE',
        message: 'Invalid language',
        details: {}
      })
    })

    it('should handle unexpected errors', async () => {
      const unexpectedError = new Error('Database connection failed')
      mockService.translateText.mockRejectedValue(unexpectedError)

      await translationController.translate(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred during translation',
        details: {}
      })
    })
  })

  describe('healthCheck()', () => {
    it('should return service health status', async () => {
      await translationController.healthCheck(mockRequest, mockResponse)

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          status: 'healthy',
          timestamp: expect.any(String),
          service: 'translation'
        }
      })
    })
  })
})
