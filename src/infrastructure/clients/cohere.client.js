import { IAIClient } from '#core/interfaces/ai.client.interface.js'
import { CohereClientV2 } from 'cohere-ai'

/**
 * Cohere AI Client Implementation
 * Implements IAIClient interface following SOLID principles
 * Provides clean abstraction over Cohere API
 */
export class CohereClient extends IAIClient {
  constructor (apiKey) {
    super()
    this.apiKey = apiKey
    this.client = new CohereClientV2({ token: apiKey })
  }

  /**
   * Send chat message to Cohere model
   * @param {Object} params - Chat parameters
   * @returns {Promise<Object>} AI response
   */
  async chat (params) {
    try {
      const response = await this.client.chat(params)
      return response
    } catch (error) {
      throw new Error(`Cohere API Error: ${error.message}`)
    }
  }

  /**
   * Get client name for identification
   * @returns {string} Client identifier
   */
  getClientName () {
    return 'cohere'
  }

  /**
   * Check if client is ready for requests
   * @returns {Promise<boolean>} Ready status
   */
  async isReady () {
    try {
      // Test connection with a minimal request
      await this.client.chat({
        model: 'command-r7b-12-2024',
        messages: [{ role: 'user', content: 'test' }]
      })
      return true
    } catch (error) {
      return false
    }
  }
}
