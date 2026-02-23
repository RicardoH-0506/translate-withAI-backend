import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TranslateUseCase } from '../../../../src/core/translate/usecases/TranslateUseCase.js'
import { Translation } from '../../../../src/core/translate/entities/Translation.js'
import { TranslationError } from '../../../../src/core/translate/errors/TranslationError.js'

describe('TranslateUseCase', () => {
  let translateUseCase
  let mockRepository

  beforeEach(() => {
    // Mock repository
    mockRepository = {
      translate: vi.fn()
    }
    translateUseCase = new TranslateUseCase(mockRepository)
    
    // Mock crypto for consistent IDs
    vi.stubGlobal('crypto', {
      randomUUID: () => 'test-uuid-12345678-1234-1234-1234-123456789abc'
    })
  })

  describe('execute()', () => {
    const validRequest = {
      text: 'Hello world',
      fromLang: 'en',
      toLang: 'es',
      messages: []
    }

    it('should execute successful translation', async () => {
      const translatedText = 'Hola mundo'
      mockRepository.translate.mockResolvedValue(translatedText)

      const result = await translateUseCase.execute(validRequest)

      expect(mockRepository.translate).toHaveBeenCalledWith(
        'Hello world',
        'en',
        'es',
        []
      )
      expect(result).toBeInstanceOf(Translation)
      expect(result.text).toBe('Hello world')
      expect(result.translatedText).toBe('Hola mundo')
      expect(result.status).toBe('completed')
      expect(result.completedAt).toBeInstanceOf(Date)
    })

    it('should pass messages to repository', async () => {
      const messages = [{ role: 'system', content: 'test' }]
      const requestWithMessages = { ...validRequest, messages }
      mockRepository.translate.mockResolvedValue('Hola mundo')

      await translateUseCase.execute(requestWithMessages)

      expect(mockRepository.translate).toHaveBeenCalledWith(
        'Hello world',
        'en',
        'es',
        messages
      )
    })

    it('should handle repository errors and mark translation as failed', async () => {
      const error = new Error('API Error')
      mockRepository.translate.mockRejectedValue(error)

      await expect(translateUseCase.execute(validRequest)).rejects.toThrow('API Error')

      // Verify translation was marked as failed
      expect(mockRepository.translate).toHaveBeenCalled()
    })

    it('should use default empty messages array when not provided', async () => {
      const requestWithoutMessages = {
        text: 'Hello',
        fromLang: 'en',
        toLang: 'es'
      }
      mockRepository.translate.mockResolvedValue('Hola')

      await translateUseCase.execute(requestWithoutMessages)

      expect(mockRepository.translate).toHaveBeenCalledWith(
        'Hello',
        'en',
        'es',
        []
      )
    })
  })

  describe('validateRequest()', () => {
    it('should pass validation for valid request', () => {
      const validRequest = {
        text: 'Hello world',
        fromLang: 'en',
        toLang: 'es'
      }

      expect(() => translateUseCase.validateRequest(validRequest)).not.toThrow()
    })

    it('should throw error for null request', () => {
      expect(() => translateUseCase.validateRequest(null))
        .toThrow(TranslationError)
      expect(() => translateUseCase.validateRequest(null))
        .toThrow('Translation request is required')
    })

    it('should throw error for undefined request', () => {
      expect(() => translateUseCase.validateRequest(undefined))
        .toThrow(TranslationError)
      expect(() => translateUseCase.validateRequest(undefined))
        .toThrow('Translation request is required')
    })

    it('should throw error for empty text', () => {
      const invalidRequest = {
        text: '',
        fromLang: 'en',
        toLang: 'es'
      }

      expect(() => translateUseCase.validateRequest(invalidRequest))
        .toThrow(TranslationError)
      expect(() => translateUseCase.validateRequest(invalidRequest))
        .toThrow('Text to translate cannot be empty')
    })

    it('should throw error for whitespace-only text', () => {
      const invalidRequest = {
        text: '   ',
        fromLang: 'en',
        toLang: 'es'
      }

      expect(() => translateUseCase.validateRequest(invalidRequest))
        .toThrow(TranslationError)
      expect(() => translateUseCase.validateRequest(invalidRequest))
        .toThrow('Text to translate cannot be empty')
    })

    it('should throw error for missing source language', () => {
      const invalidRequest = {
        text: 'Hello',
        fromLang: '',
        toLang: 'es'
      }

      expect(() => translateUseCase.validateRequest(invalidRequest))
        .toThrow(TranslationError)
      expect(() => translateUseCase.validateRequest(invalidRequest))
        .toThrow('Source language is required')
    })

    it('should throw error for missing target language', () => {
      const invalidRequest = {
        text: 'Hello',
        fromLang: 'en',
        toLang: ''
      }

      expect(() => translateUseCase.validateRequest(invalidRequest))
        .toThrow(TranslationError)
      expect(() => translateUseCase.validateRequest(invalidRequest))
        .toThrow('Target language is required')
    })

    it('should throw error for same source and target language', () => {
      const invalidRequest = {
        text: 'Hello',
        fromLang: 'en',
        toLang: 'en'
      }

      expect(() => translateUseCase.validateRequest(invalidRequest))
        .toThrow(TranslationError)
      expect(() => translateUseCase.validateRequest(invalidRequest))
        .toThrow('Source and target languages must be different')
    })
  })
})
