/**
 * Simple Dependency Injection Container
 * Implements Dependency Inversion Principle
 */
import { CohereClient } from '../infrastructure/clients/cohere.client.js'
import { CohereRepository } from '../../features/translation/repositories/cohere.repository.js'
import { TranslationService } from '../../features/translation/services/translation.service.js'
import { TranslationController } from '../../features/translation/controllers/translation.controller.js'

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
   * Register all application services
   */
  registerServices () {
    // Register AI Client
    this.register('cohereClient', () => {
      return new CohereClient(process.env.COHERE_API_KEY)
    }, true)

    // Register Repository
    this.register('translationRepository', (container) => {
      return new CohereRepository(container.get('cohereClient'))
    }, true)

    // Register Service
    this.register('translationService', (container) => {
      return new TranslationService(container.get('translationRepository'))
    }, true)

    // Register Controller
    this.register('translationController', (container) => {
      return new TranslationController(container.get('translationService'))
    }, true)
  }
}
