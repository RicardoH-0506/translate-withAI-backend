/**
 * Translate Request DTO - Application Layer
 * Data Transfer Object for translation requests
 * Contains Zod schema for request validation
 */
import { z } from 'zod'

/**
 * Zod schema for translation request validation
 * Defines the contract for incoming translation requests
 */
export const translateRequestSchema = z.object({
  fromLang: z.string({
    required_error: 'Source language is required',
    invalid_type_error: 'Source language must be a string'
  }).min(1, 'Source language cannot be empty')
    .max(10, 'Source language code too long'),

  toLang: z.string({
    required_error: 'Target language is required',
    invalid_type_error: 'Target language must be a string'
  }).min(1, 'Target language cannot be empty')
    .max(10, 'Target language code too long'),

  text: z.string({
    required_error: 'Text to translate is required',
    invalid_type_error: 'Text to translate must be a string'
  }).min(1, 'Text to translate cannot be empty')
    .max(5000, 'Text to translate cannot exceed 5000 characters')
})

/**
 * Type inference from Zod schema
 * In JavaScript, use the schema directly for validation
 * TypeScript users can import: type TranslateRequestDTO = z.infer<typeof translateRequestSchema>
 */
