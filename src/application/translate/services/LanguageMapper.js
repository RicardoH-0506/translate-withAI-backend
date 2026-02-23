import { TranslationError } from '../../../core/translate/errors/TranslationError.js'
import { SUPPORTED_LANGUAGES } from '../../../core/translate/constants/constants.js'

/**
 * LanguageMapper - Utility class for language mapping and validation
 * Handles language code/name conversions and validation
 */
export class LanguageMapper {
  /**
   * Map language name to code
   * @param {string} languageName - Language name or 'auto'
   * @returns {string|null} Language code or null if unsupported
   */
  static mapToCode (languageName) {
    if (languageName === 'auto') {
      return 'auto'
    }
    return SUPPORTED_LANGUAGES[languageName] || null
  }

  /**
   * Validate source language
   * @param {string} fromLang - Source language name or 'auto'
   * @returns {string} Language code
   * @throws {TranslationError} If language is unsupported
   */
  static validateSourceLanguage (fromLang) {
    const fromCode = this.mapToCode(fromLang)
    if (!fromCode) {
      throw new TranslationError(`Unsupported source language: ${fromLang}`)
    }
    return fromCode
  }

  /**
   * Validate target language
   * @param {string} toLang - Target language name
   * @returns {string} Language code
   * @throws {TranslationError} If language is unsupported
   */
  static validateTargetLanguage (toLang) {
    const toCode = this.mapToCode(toLang)
    if (!toCode) {
      throw new TranslationError(`Unsupported target language: ${toLang}`)
    }
    return toCode
  }

  /**
   * Get supported languages mapping
   * @returns {Object} Supported languages mapping
   */
  static getSupportedLanguages () {
    return SUPPORTED_LANGUAGES
  }
}
