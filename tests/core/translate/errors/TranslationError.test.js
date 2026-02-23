import { describe, it, expect, beforeEach } from 'vitest'
import { TranslationError } from '../../../../src/core/translate/errors/TranslationError.js'

describe('TranslationError', () => {
  describe('Constructor', () => {
    it('should create error with default values', () => {
      const error = new TranslationError('Test error message')
      
      expect(error.name).toBe('TranslationError')
      expect(error.message).toBe('Test error message')
      expect(error.code).toBe('TRANSLATION_ERROR')
      expect(error.details).toEqual({})
      expect(error.timestamp).toBeInstanceOf(Date)
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(TranslationError)
    })

    it('should create error with custom code', () => {
      const error = new TranslationError('Custom message', 'CUSTOM_CODE')
      
      expect(error.name).toBe('TranslationError')
      expect(error.message).toBe('Custom message')
      expect(error.code).toBe('CUSTOM_CODE')
      expect(error.details).toEqual({})
    })

    it('should create error with custom code and details', () => {
      const details = { field: 'text', value: 'invalid' }
      const error = new TranslationError('Validation failed', 'VALIDATION_ERROR', details)
      
      expect(error.name).toBe('TranslationError')
      expect(error.message).toBe('Validation failed')
      expect(error.code).toBe('VALIDATION_ERROR')
      expect(error.details).toEqual(details)
    })
  })

  describe('toJSON()', () => {
    it('should convert error to JSON format', () => {
      const details = { field: 'fromLang', expected: 'string' }
      const error = new TranslationError('Invalid language', 'INVALID_LANGUAGE', details)
      
      const json = error.toJSON()
      
      expect(json).toEqual({
        name: 'TranslationError',
        message: 'Invalid language',
        code: 'INVALID_LANGUAGE',
        details: details,
        timestamp: error.timestamp
      })
    })

    it('should handle empty details', () => {
      const error = new TranslationError('Simple error')
      
      const json = error.toJSON()
      
      expect(json).toEqual({
        name: 'TranslationError',
        message: 'Simple error',
        code: 'TRANSLATION_ERROR',
        details: {},
        timestamp: error.timestamp
      })
    })
  })

  describe('Error behavior', () => {
    it('should behave like a regular Error', () => {
      const error = new TranslationError('Test message')
      
      expect(error.stack).toBeDefined()
      expect(error.toString()).toContain('TranslationError: Test message')
    })

    it('should be catchable as TranslationError', () => {
      const error = new TranslationError('Test message')
      
      try {
        throw error
      } catch (caught) {
        expect(caught).toBeInstanceOf(TranslationError)
        expect(caught.name).toBe('TranslationError')
        expect(caught.message).toBe('Test message')
      }
    })
  })
})
