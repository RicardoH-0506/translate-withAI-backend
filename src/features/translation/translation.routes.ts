import { Router } from 'express'
import { z } from 'zod'
import { translateText } from './translation.api.js'
import { validateLanguage, validateTranslationRequest } from './translation.logic.js'
import { TranslateRequest } from './translation.types.js'

const router = Router()

// Zod Schema
const translateSchema = z.object({
  fromLang: z.string(),
  toLang: z.string(),
  text: z.string().min(1),
  messages: z.array(z.any()).optional()
})

router.post('/translate', async (req, res, next) => {
  try {
    // 1. Validate Input
    const data = translateSchema.parse(req.body) as TranslateRequest
    
    // 2. Domain Logic Validation
    validateTranslationRequest(data.text, data.fromLang, data.toLang)
    const fromCode = validateLanguage(data.fromLang, true)
    const toCode = validateLanguage(data.toLang)

    // 3. API Call
    const translatedText = await translateText(data.text, fromCode, toCode, data.messages)

    // 4. Response
    res.json({
      success: true,
      data: {
        text: data.text,
        translatedText,
        fromLang: data.fromLang,
        toLang: data.toLang
      }
    })
  } catch (error: any) {
    next(error) // Express error handler will catch this
  }
})

export { router as translationRouter }
