/**
 * Translate Response DTO - Application Layer
 * Data Transfer Object for translation responses
 * Defines standard response format for translation results
 */
import { z } from 'zod'

/**
 * Zod schema for translation response validation
 * Defines contract for outgoing translation responses
 */
export const translateResponseSchema = z.object({
  id: z.string().uuid(),
  originalText: z.string(),
  translatedText: z.string(),
  fromLang: z.string(),
  toLang: z.string(),
  fromCode: z.string(),
  toCode: z.string(),
  status: z.enum(['pending', 'completed', 'failed']),
  createdAt: z.string().datetime(),
  duration: z.number().nonnegative()
})

/**
 * Type inference from Zod schema
 * In JavaScript, use schema directly for validation
 * TypeScript users can import: type TranslateResponseDTO = z.infer<typeof translateResponseSchema>
 */

/**
 * Factory function to create validated response DTO
 * @param {Object} translationData - Raw translation data
 * @returns {Object} Validated response DTO
 */
export const createTranslateResponseDTO = (translationData) => {
  const result = translateResponseSchema.safeParse(translationData)

  if (!result.success) {
    // Log validation error but don't fail the response
    console.error('Response validation error:', result.error.issues)
    // Return original data if validation fails
    return translationData
  }

  return result.data
}

/**
 * Success response wrapper
 * @param {Object} data - Translation response data
 * @returns {Object} Standardized success response
 */
export const createSuccessResponse = (data) => {
  return {
    success: true,
    data: createTranslateResponseDTO(data)
  }
}
