/**
 * Simple Dependency Injection Container
 * Implements Dependency Inversion Principle following Clean Architecture
 */
import { CohereClient } from '../../infrastructure/translate/clients/cohere.client.js'
import { CohereRepository } from '../../infrastructure/translate/repositories/cohere.repository.js'
import { TranslateUseCase } from '../../core/translate/usecases/TranslateUseCase.js'
import { TranslationService } from '../../application/translate/services/TranslationService.js'
import { TranslationController } from '../../presentation/translate/controllers/TranslationController.js'

export class DIContainer {
  constructor () {
    this.services = new Map()
    this.singletons = new Map()
  }

  /**
   * Register a service factory
   * @param {string} name - Service name
   * @param {Function} factory - Factory function
   * @param {boolean} singleton - Whether to cache instance
   */
  register (name, factory, singleton = false) {
    this.services.set(name, { factory, singleton })
  }

  /**
   * Get a service instance
   * @param {string} name - Service name
   * @returns {*} Service instance
   */
  get (name) {
    const service = this.services.get(name)

    if (!service) {
      throw new Error(`Service ${name} not found`)
    }

    if (service.singleton) {
      if (!this.singletons.has(name)) {
        this.singletons.set(name, service.factory(this))
      }
      return this.singletons.get(name)
    }

    return service.factory(this)
  }

  /**
   * Register all application services following Clean Architecture
   */
  registerServices () {
    // Register AI Client (Infrastructure Layer)
    this.register('cohereClient', () => {
      return new CohereClient(process.env.COHERE_API_KEY)
    }, true)

    // Register Repository (Infrastructure Layer implementing Core Interface)
    this.register('translationRepository', (container) => {
      return new CohereRepository(container.get('cohereClient'))
    }, true)

    // Register Use Case (Core Layer)
    this.register('translateUseCase', (container) => {
      return new TranslateUseCase(container.get('translationRepository'))
    }, true)

    // Register Service (Application Layer)
    this.register('translationService', (container) => {
      return new TranslationService(container.get('translateUseCase'))
    }, true)

    // Register Controller (Presentation Layer)
    this.register('translationController', (container) => {
      return new TranslationController(container.get('translationService'))
    }, true)
  }
}
