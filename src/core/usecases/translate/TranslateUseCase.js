import { Translation } from '../../entities/Translation.js'
import { TranslationError } from '../../errors/TranslationError.js'

/**
 * TranslateUseCase - Core Domain Use Case
 * Contains business logic for translation operations
 * No external dependencies - pure domain logic
 */
export class TranslateUseCase {
  /**
   * Create use case with repository dependency
   * @param {ITranslationRepository} repository - Translation repository interface
   */
  constructor (repository) {
    this.repository = repository
  }

  /**
   * Execute translation use case
   * @param {Object} request - Translation request
   * @param {string} request.text - Text to translate
   * @param {string} request.fromLang - Source language
   * @param {string} request.toLang - Target language
   * @param {Array} request.messages - Context messages (optional)
   * @returns {Promise<Translation>} Translation entity
   */
  async execute (request) {
    // Domain validations
    this.validateRequest(request)

    // Create domain entity
    const translation = new Translation(
      request.text,
      request.fromLang,
      request.toLang
    )

    try {
      // Perform translation through repository
      const translatedText = await this.repository.translate(
        translation.text,
        translation.fromLang,
        translation.toLang,
        request.messages || []
      )

      // Complete the translation
      translation.complete(translatedText)

      return translation
    } catch (error) {
      // Fail the translation with error
      translation.fail(error.message)
      throw error
    }
  }

  /**
   * Validate translation request
   * @param {Object} request - Translation request
   * @throws {TranslationError} If validation fails
   */
  validateRequest (request) {
    if (!request) {
      throw new TranslationError('Translation request is required')
    }

    if (!request.text || request.text.trim() === '') {
      throw new TranslationError('Text to translate cannot be empty')
    }

    if (!request.fromLang) {
      throw new TranslationError('Source language is required')
    }

    if (!request.toLang) {
      throw new TranslationError('Target language is required')
    }

    if (request.fromLang === request.toLang) {
      throw new TranslationError('Source and target languages must be different')
    }
  }
}
