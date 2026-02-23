import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CohereRepository } from '../../../../src/infrastructure/translate/repositories/cohere.repository.js'

describe('CohereRepository', () => {
  let cohereRepository
  let mockClient

  beforeEach(() => {
    // Mock Cohere client
    mockClient = {
      chat: vi.fn()
    }
    cohereRepository = new CohereRepository(mockClient)
  })

  describe('translate()', () => {
    it('should translate text using Cohere client', async () => {
      const mockResponse = {
        message: {
          content: [
            { text: 'Hola mundo' }
          ]
        }
      }
      mockClient.chat.mockResolvedValue(mockResponse)

      const result = await cohereRepository.translate('Hello world', 'en', 'es', [])

      expect(mockClient.chat).toHaveBeenCalledWith({
        model: 'command-a-translate-08-2025',
        messages: [
          {
            role: 'user',
            content: 'Hello world {{en}} [[es]]'
          }
        ]
      })
      expect(result).toBe('Hola mundo')
    })

    it('should include context messages in request', async () => {
      const mockResponse = {
        message: {
          content: [
            { text: 'Wie geht es dir?' }
          ]
        }
      }
      const contextMessages = [
        { role: 'system', content: 'You are a translator' },
        { role: 'user', content: 'Previous example' }
      ]
      mockClient.chat.mockResolvedValue(mockResponse)

      const result = await cohereRepository.translate('How are you?', 'en', 'de', contextMessages)

      expect(mockClient.chat).toHaveBeenCalledWith({
        model: 'command-a-translate-08-2025',
        messages: [
          { role: 'system', content: 'You are a translator' },
          { role: 'user', content: 'Previous example' },
          {
            role: 'user',
            content: 'How are you? {{en}} [[de]]'
          }
        ]
      })
      expect(result).toBe('Wie geht es dir?')
    })

    it('should handle client errors', async () => {
      const apiError = new Error('API rate limit exceeded')
      mockClient.chat.mockRejectedValue(apiError)

      await expect(cohereRepository.translate('Hello', 'en', 'es', []))
        .rejects.toThrow('API rate limit exceeded')
    })
  })

  describe('isReady()', () => {
    it('should return true when client is ready', async () => {
      mockClient.isReady = vi.fn().mockResolvedValue(true)

      const result = await cohereRepository.isReady()

      expect(result).toBe(true)
      expect(mockClient.isReady).toHaveBeenCalled()
    })

    it('should return false when client fails', async () => {
      mockClient.isReady = vi.fn().mockRejectedValue(new Error('Connection failed'))

      const result = await cohereRepository.isReady()

      expect(result).toBe(false)
    })

    it('should handle isReady errors gracefully', async () => {
      mockClient.isReady = vi.fn().mockRejectedValue(new Error('Service unavailable'))

      const result = await cohereRepository.isReady()

      expect(result).toBe(false)
    })
  })

  describe('getRepositoryName()', () => {
    it('should return repository name', () => {
      const name = cohereRepository.getRepositoryName()
      expect(name).toBe('cohere')
    })
  })
})
