import { TranslationError } from '#core/errors/TranslationError.js'
import { SUPPORTED_LANGUAGES } from '#core/constants/constants.js'
import { messages } from '#core/usecases/translate/few-shot.js'

/**
 * TranslationService - Application Service
 * Orchestrates translation use cases and handles application-level logic
 * Depends on core use cases but doesn't contain business logic
 */
export class TranslationService {
  /**
   * Create service with translation use case
   * @param {TranslateUseCase} translateUseCase - Translation use case
   */
  constructor (translateUseCase) {
    this.translateUseCase = translateUseCase
  }

  /**
   * Translate text with language mapping
   * @param {string} fromLang - Source language name or 'auto'
   * @param {string} toLang - Target language name
   * @param {string} text - Text to translate
   * @returns {Promise<Object>} Translation result
   */
  async translateText (fromLang, toLang, text) {
    try {
      // Handle same language case
      if (fromLang === toLang) {
        return {
          originalText: text,
          translatedText: text,
          fromLang,
          toLang,
          isSameLanguage: true
        }
      }

      // Map language names to codes
      const fromCode = fromLang === 'auto' ? 'auto' : SUPPORTED_LANGUAGES[fromLang]
      const toCode = SUPPORTED_LANGUAGES[toLang]

      // Validate language codes
      if (!fromCode) {
        throw new TranslationError(`Unsupported source language: ${fromLang}`)
      }

      if (!toCode) {
        throw new TranslationError(`Unsupported target language: ${toLang}`)
      }

      // Execute use case
      const translation = await this.translateUseCase.execute({
        text,
        fromLang: fromCode,
        toLang: toCode,
        messages
      })

      // Return formatted result
      return {
        id: translation.id,
        originalText: translation.text,
        translatedText: translation.translatedText,
        fromLang,
        toLang,
        fromCode,
        toCode,
        status: translation.status,
        createdAt: translation.createdAt,
        duration: translation.getDuration()
      }
    } catch (error) {
      // Handle domain errors
      if (error instanceof TranslationError) {
        throw error
      }

      // Handle unexpected errors
      throw new TranslationError(
        `Translation failed: ${error.message}`,
        'TRANSLATION_SERVICE_ERROR',
        { originalError: error.message }
      )
    }
  }

  /**
   * Get supported languages
   * @returns {Object} Supported languages mapping
   */
  getSupportedLanguages () {
    return SUPPORTED_LANGUAGES
  }
}
