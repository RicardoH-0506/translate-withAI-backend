/**
 * Interface for AI clients
 * Follows SOLID principles - Interface Segregation & Dependency Inversion
 * @abstract
 */
export class IAIClient {
  /**
   * Send chat message to AI model
   * @param {Object} params - Chat parameters
   * @returns {Promise<Object>} AI response
   * @throws {Error} When implementation fails
   */
  async chat (params) {
    throw new Error('Method chat() must be implemented')
  }

  /**
   * Get client name for identification
   * @returns {string} Client identifier
   */
  getClientName () {
    throw new Error('Method getClientName() must be implemented')
  }

  /**
   * Check if client is ready for requests
   * @returns {Promise<boolean>} Ready status
   */
  async isReady () {
    throw new Error('Method isReady() must be implemented')
  }
}
