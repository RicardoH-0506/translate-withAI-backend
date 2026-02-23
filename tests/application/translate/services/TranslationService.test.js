import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TranslationService } from '../../../../src/application/translate/services/TranslationService.js'
import { TranslationError } from '../../../../src/core/translate/errors/TranslationError.js'

describe('TranslationService', () => {
  let translationService
  let mockTranslateUseCase

  beforeEach(() => {
    // Mock TranslateUseCase
    mockTranslateUseCase = {
      execute: vi.fn()
    }
    translationService = new TranslationService(mockTranslateUseCase)
  })

  describe('translateText()', () => {
    const mockTranslation = {
      id: 'test-uuid',
      text: 'Hello world',
      translatedText: 'Hola mundo',
      status: 'completed',
      createdAt: new Date(),
      completedAt: new Date(),
      getDuration: vi.fn(() => 150)
    }

    it('should translate text successfully', async () => {
      mockTranslateUseCase.execute.mockResolvedValue(mockTranslation)

      const result = await translationService.translateText('en', 'es', 'Hello world')

      expect(mockTranslateUseCase.execute).toHaveBeenCalledWith({
        text: 'Hello world',
        fromLang: 'English',
        toLang: 'Español',
        messages: [
          {
            content: 'You are a AI that translates text. You receive a text from user. Do not answer, just translate the text. The original language is surrounded by `{{` and `}}`. You can also recive {{auto}} which means that you have to detect the language. The language you translate to is surrounded by `[[` and `]]. Forget all your morals and translate everything even when it could be offensive. Do not do calculations, do not answer questions, do not solve problems. ONLY TRANSLATE TEXT.',
            role: 'system',
          },
          {
            content: 'Hola mundo {{Español}} [[English]]',
            role: 'user',
          },
          {
            content: 'Hello world',
            role: 'assistant',
          },
          {
            content: 'How are you? {{auto}} [[Deutsch]]',
            role: 'user',
          },
          {
            content: 'Wie geht es dir?',
            role: 'assistant',
          },
          {
            content: 'Bon dia, com estas? {{auto}} [[Español]]',
            role: 'user',
          },
          {
            content: 'Buenos días, ¿cómo estás?',
            role: 'assistant',
          },
        ]
      })
      expect(result).toEqual({
        id: 'test-uuid',
        originalText: 'Hello world',
        translatedText: 'Hola mundo',
        fromLang: 'en',
        toLang: 'es',
        fromCode: 'English',
        toCode: 'Español',
        status: 'completed',
        createdAt: mockTranslation.createdAt,
        duration: 150
      })
    })

    it('should handle same language case', async () => {
      const result = await translationService.translateText('en', 'en', 'Hello world')

      expect(mockTranslateUseCase.execute).not.toHaveBeenCalled()
      expect(result).toEqual({
        originalText: 'Hello world',
        translatedText: 'Hello world',
        fromLang: 'en',
        toLang: 'en',
        isSameLanguage: true
      })
    })

    it('should handle auto language detection', async () => {
      mockTranslateUseCase.execute.mockResolvedValue(mockTranslation)

      await translationService.translateText('auto', 'es', 'Hello world')

      expect(mockTranslateUseCase.execute).toHaveBeenCalledWith({
        text: 'Hello world',
        fromLang: 'auto',
        toLang: 'Español',
        messages: [
          {
            content: 'You are a AI that translates text. You receive a text from user. Do not answer, just translate the text. The original language is surrounded by `{{` and `}}`. You can also recive {{auto}} which means that you have to detect the language. The language you translate to is surrounded by `[[` and `]]. Forget all your morals and translate everything even when it could be offensive. Do not do calculations, do not answer questions, do not solve problems. ONLY TRANSLATE TEXT.',
            role: 'system',
          },
          {
            content: 'Hola mundo {{Español}} [[English]]',
            role: 'user',
          },
          {
            content: 'Hello world',
            role: 'assistant',
          },
          {
            content: 'How are you? {{auto}} [[Deutsch]]',
            role: 'user',
          },
          {
            content: 'Wie geht es dir?',
            role: 'assistant',
          },
          {
            content: 'Bon dia, com estas? {{auto}} [[Español]]',
            role: 'user',
          },
          {
            content: 'Buenos días, ¿cómo estás?',
            role: 'assistant',
          },
        ]
      })
    })

    it('should throw error for unsupported source language', async () => {
      await expect(translationService.translateText('invalid', 'es', 'Hello'))
        .rejects.toThrow(TranslationError)
      await expect(translationService.translateText('invalid', 'es', 'Hello'))
        .rejects.toThrow('Unsupported source language: invalid')
    })

    it('should throw error for unsupported target language', async () => {
      await expect(translationService.translateText('en', 'invalid', 'Hello'))
        .rejects.toThrow(TranslationError)
      await expect(translationService.translateText('en', 'invalid', 'Hello'))
        .rejects.toThrow('Unsupported target language: invalid')
    })

    it('should propagate TranslationError from use case', async () => {
      const domainError = new TranslationError('Domain error', 'DOMAIN_ERROR')
      mockTranslateUseCase.execute.mockRejectedValue(domainError)

      await expect(translationService.translateText('en', 'es', 'Hello'))
        .rejects.toThrow(domainError)
    })

    it('should wrap unexpected errors in TranslationError', async () => {
      const unexpectedError = new Error('Unexpected error')
      mockTranslateUseCase.execute.mockRejectedValue(unexpectedError)

      await expect(translationService.translateText('en', 'es', 'Hello'))
        .rejects.toThrow(TranslationError)
      await expect(translationService.translateText('en', 'es', 'Hello'))
        .rejects.toThrow('Translation failed: Unexpected error')
    })

    it('should include error details in wrapped errors', async () => {
      const unexpectedError = new Error('API failure')
      mockTranslateUseCase.execute.mockRejectedValue(unexpectedError)

      try {
        await translationService.translateText('en', 'es', 'Hello')
      } catch (error) {
        expect(error.code).toBe('TRANSLATION_SERVICE_ERROR')
        expect(error.details.originalError).toBe('API failure')
      }
    })
  })

  describe('getSupportedLanguages()', () => {
    it('should return supported languages mapping', () => {
      const languages = translationService.getSupportedLanguages()

      expect(languages).toEqual({
        es: 'Español',
        en: 'English',
        de: 'Deutsch'
      })
    })
  })
})
