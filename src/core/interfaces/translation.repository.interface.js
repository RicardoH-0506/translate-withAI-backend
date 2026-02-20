/**
 * Interface for translation repositories
 * @abstract
 */
export class ITranslationRepository {
  /**
   * Translate text from one language to another
   * @param {string} text - Text to translate
   * @param {string} fromCode - Source language code
   * @param {string} toCode - Target language code
   * @param {Array} messages - Few-shot messages for context
   * @returns {Promise<string>} Translated text
   */
  async translate (text, fromCode, toCode, messages) {
    throw new Error('Method translate() must be implemented')
  }
}
