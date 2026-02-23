import { TranslationError } from '../../../core/translate/errors/TranslationError.js'
import { LanguageMapper } from './LanguageMapper.js'
import { messages } from '../../../core/translate/usecases/few-shot.js'

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
      if (this.#isSameLanguage(fromLang, toLang)) {
        return this.#createSameLanguageResponse(text, fromLang, toLang)
      }

      // Validate and map languages
      const { fromCode, toCode } = this.#validateAndMapLanguages(fromLang, toLang)

      // Execute use case
      const translation = await this.translateUseCase.execute({
        text,
        fromLang: fromCode,
        toLang: toCode,
        messages
      })

      // Return formatted result
      return this.#formatTranslationResult(translation, fromLang, toLang, fromCode, toCode)
    } catch (error) {
      this.#handleTranslationError(error)
    }
  }

  /**
   * Check if source and target languages are the same
   * @private
   * @param {string} fromLang - Source language
   * @param {string} toLang - Target language
   * @returns {boolean} True if same language
   */
  #isSameLanguage (fromLang, toLang) {
    return fromLang === toLang
  }

  /**
   * Create response for same language case
   * @private
   * @param {string} text - Original text
   * @param {string} fromLang - Source language
   * @param {string} toLang - Target language
   * @returns {Object} Same language response
   */
  #createSameLanguageResponse (text, fromLang, toLang) {
    return {
      originalText: text,
      translatedText: text,
      fromLang,
      toLang,
      isSameLanguage: true
    }
  }

  /**
   * Validate and map languages
   * @private
   * @param {string} fromLang - Source language
   * @param {string} toLang - Target language
   * @returns {Object} Mapped language codes
   * @throws {TranslationError} If languages are invalid
   */
  #validateAndMapLanguages (fromLang, toLang) {
    const fromCode = LanguageMapper.validateSourceLanguage(fromLang)
    const toCode = LanguageMapper.validateTargetLanguage(toLang)
    return { fromCode, toCode }
  }

  /**
   * Format translation result
   * @private
   * @param {Translation} translation - Translation entity
   * @param {string} fromLang - Original source language name
   * @param {string} toLang - Original target language name
   * @param {string} fromCode - Source language code
   * @param {string} toCode - Target language code
   * @returns {Object} Formatted result
   */
  #formatTranslationResult (translation, fromLang, toLang, fromCode, toCode) {
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
  }

  /**
   * Handle translation errors
   * @private
   * @param {Error} error - Error to handle
   * @throws {TranslationError} Always throws TranslationError
   */
  #handleTranslationError (error) {
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

  /**
   * Get supported languages
   * @returns {Object} Supported languages mapping
   */
  getSupportedLanguages () {
    return LanguageMapper.getSupportedLanguages()
  }
}
