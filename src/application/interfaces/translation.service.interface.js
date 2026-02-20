/**
 * Interface for translation services
 * @abstract
 */
export class ITranslationService {
  /**
   * Translate text using repository
   * @param {string} fromLang - Source language code
   * @param {string} toLang - Target language code
   * @param {string} text - Text to translate
   * @returns {Promise<string>} Translated text
   */
  async translateText (fromLang, toLang, text) {
    throw new Error('Method translateText() must be implemented')
  }
}
