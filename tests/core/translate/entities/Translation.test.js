import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Translation } from '../../../../src/core/translate/entities/Translation.js'

describe('Translation Entity', () => {
  let translation

  beforeEach(() => {
    // Mock crypto.randomUUID for consistent testing
    vi.stubGlobal('crypto', {
      randomUUID: () => 'test-uuid-12345678-1234-1234-1234-123456789abc'
    })
  })

  describe('Constructor', () => {
    it('should create translation with default values', () => {
      translation = new Translation('Hello', 'en', 'es')

      expect(translation.id).toBe('test-uuid-12345678-1234-1234-1234-123456789abc')
      expect(translation.text).toBe('Hello')
      expect(translation.fromLang).toBe('en')
      expect(translation.toLang).toBe('es')
      expect(translation.translatedText).toBeNull()
      expect(translation.status).toBe('pending')
      expect(translation.createdAt).toBeInstanceOf(Date)
    })

    it('should create translation with custom ID', () => {
      translation = new Translation('Hello', 'en', 'es', 'custom-id')

      expect(translation.id).toBe('custom-id')
    })

    it('should create translation with custom ID generator', () => {
      const mockGenerator = vi.fn(() => 'generated-id')
      translation = new Translation('Hello', 'en', 'es', null, mockGenerator)

      expect(translation.id).toBe('generated-id')
      expect(mockGenerator).toHaveBeenCalled()
    })
  })

  describe('complete()', () => {
    beforeEach(() => {
      translation = new Translation('Hello', 'en', 'es')
    })

    it('should mark translation as completed', () => {
      translation.complete('Hola')

      expect(translation.translatedText).toBe('Hola')
      expect(translation.status).toBe('completed')
      expect(translation.completedAt).toBeInstanceOf(Date)
    })
  })

  describe('fail()', () => {
    beforeEach(() => {
      translation = new Translation('Hello', 'en', 'es')
    })

    it('should mark translation as failed', () => {
      translation.fail('API Error')

      expect(translation.status).toBe('failed')
      expect(translation.error).toBe('API Error')
      expect(translation.failedAt).toBeInstanceOf(Date)
    })
  })

  describe('isValid()', () => {
    it('should return true for valid translation', () => {
      translation = new Translation('Hello', 'en', 'es')

      expect(translation.isValid()).toBe(true)
    })

    it('should return false for empty text', () => {
      translation = new Translation('', 'en', 'es')

      expect(translation.isValid()).toBe(false)
    })

    it('should return false for whitespace-only text', () => {
      translation = new Translation('   ', 'en', 'es')

      expect(translation.isValid()).toBe(false)
    })

    it('should return false for missing source language', () => {
      translation = new Translation('Hello', '', 'es')

      expect(translation.isValid()).toBe(false)
    })

    it('should return false for missing target language', () => {
      translation = new Translation('Hello', 'en', '')

      expect(translation.isValid()).toBe(false)
    })

    it('should return false for same source and target language', () => {
      translation = new Translation('Hello', 'en', 'en')

      expect(translation.isValid()).toBe(false)
    })
  })

  describe('getDuration()', () => {
    beforeEach(() => {
      translation = new Translation('Hello', 'en', 'es')
    })

    it('should return null for pending translation', () => {
      expect(translation.getDuration()).toBeNull()
    })

    it('should return duration for completed translation', async () => {
      await new Promise(resolve => setTimeout(resolve, 10))
      translation.complete('Hola')

      const duration = translation.getDuration()
      expect(duration).toBeGreaterThanOrEqual(10)
      expect(typeof duration).toBe('number')
    })

    it('should return duration for failed translation', async () => {
      await new Promise(resolve => setTimeout(resolve, 10))
      translation.fail('Error')

      const duration = translation.getDuration()
      expect(duration).toBeGreaterThanOrEqual(10)
      expect(typeof duration).toBe('number')
    })
  })
})
