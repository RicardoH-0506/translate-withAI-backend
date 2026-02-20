import { ITranslationRepository } from '../../core/interfaces/translation.repository.interface.js'

/**
 * CohereRepository - Infrastructure Implementation
 * Implements ITranslationRepository using Cohere AI API
 * Depends on external infrastructure (Cohere client)
 */
export class CohereRepository extends ITranslationRepository {
  /**
   * Create repository with Cohere client
   * @param {Object} client - Cohere AI client instance
   */
  constructor (client) {
    super()
    this.client = client
  }

  /**
   * Translate text using Cohere API
   * @param {string} text - Text to translate
   * @param {string} fromCode - Source language code
   * @param {string} toCode - Target language code
   * @param {Array} messages - Additional context messages
   * @returns {Promise<string>} Translated text
   */
  async translate (text, fromCode, toCode, messages) {
    const response = await this.client.chat({
      model: 'command-a-translate-08-2025',
      messages: [
        ...messages,
        {
          role: 'user',
          content: `${text} {{${fromCode}}} [[${toCode}]]`
        }
      ]
    })

    return response.message.content[0].text
  }

  /**
   * Check if repository is ready for operations
   * @returns {Promise<boolean>} Ready status
   */
  async isReady () {
    try {
      return await this.client.isReady()
    } catch (error) {
      return false
    }
  }

  /**
   * Get repository identifier
   * @returns {string} Repository name
   */
  getRepositoryName () {
    return 'cohere'
  }
}
