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
   */
  constructor (text, fromLang, toLang) {
    this.id = crypto.randomUUID()
    this.text = text
    this.fromLang = fromLang
    this.toLang = toLang
    this.translatedText = null
    this.createdAt = new Date()
    this.status = 'pending'
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
