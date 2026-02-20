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

  /**
   * Check if repository is ready for operations
   * @returns {Promise<boolean>} Ready status
   */
  async isReady () {
    throw new Error('Method isReady() must be implemented')
  }

  /**
   * Get repository identifier
   * @returns {string} Repository name
   */
  getRepositoryName () {
    throw new Error('Method getRepositoryName() must be implemented')
  }
}
