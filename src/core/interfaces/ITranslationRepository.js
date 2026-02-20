/**
 * ITranslationRepository - Core Domain Interface
 * Defines the contract for translation repositories
 * No implementation details - pure interface
 */
export class ITranslationRepository {
  /**
   * Translate text using external service
   * @param {string} text - Text to translate
   * @param {string} fromCode - Source language code
   * @param {string} toCode - Target language code
   * @param {Array} messages - Additional context messages
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
