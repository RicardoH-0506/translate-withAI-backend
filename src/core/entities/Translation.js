/**
 * Translation Entity - Core Domain Entity
 * Represents a translation request/response in the domain
 * No external dependencies - pure business logic
 */
export class Translation {
  /**
   * Create a Translation entity
   * @param {string} text - Text to translate
   * @param {string} fromLang - Source language code
   * @param {string} toLang - Target language code
   * @param {string} id - Optional ID (injected for testability)
   * @param {Function} idGenerator - Optional ID generator function
   */
  constructor (text, fromLang, toLang, id = null, idGenerator = null) {
    this.id = id || (idGenerator ? idGenerator() : this.generateId())
    this.text = text
    this.fromLang = fromLang
    this.toLang = toLang
    this.translatedText = null
    this.createdAt = new Date()
    this.status = 'pending'
  }

  /**
   * Generate unique ID (isolated for testability)
   * @private
   * @returns {string} Unique identifier
   */
  generateId () {
    // In production, this would be injected
    return crypto.randomUUID()
  }

  /**
   * Mark translation as completed
   * @param {string} translatedText - The translated result
   */
  complete (translatedText) {
    this.translatedText = translatedText
    this.status = 'completed'
    this.completedAt = new Date()
  }

  /**
   * Mark translation as failed
   * @param {string} error - Error message
   */
  fail (error) {
    this.status = 'failed'
    this.error = error
    this.failedAt = new Date()
  }

  /**
   * Check if translation is valid
   * @returns {boolean} True if valid
   */
  isValid () {
    return this.text &&
           this.text.trim() !== '' &&
           this.fromLang &&
           this.toLang &&
           this.fromLang !== this.toLang
  }

  /**
   * Get translation duration
   * @returns {number|null} Duration in milliseconds
   */
  getDuration () {
    if (!this.completedAt && !this.failedAt) return null

    const endTime = this.completedAt || this.failedAt
    return endTime - this.createdAt
  }
}
