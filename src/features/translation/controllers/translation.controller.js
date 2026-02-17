import { TranslationService } from '../services/translation.service.js'
import { translationSchema } from '../../../../schemas/translation.js'
import { flattenError } from 'zod'

export class TranslationController {
  constructor () {
    this.translationService = new TranslationService()
  }

  async translate (req, res, next) {
    const validatedBody = translationSchema.safeParse(req.body)

    if (!validatedBody.success) {
      return res.status(400).json({
        errors: flattenError(validatedBody.error).fieldErrors,
        message: 'There were validation errors'
      })
    }

    const { fromLang, toLang, text } = validatedBody.data

    try {
      const translatedText = await this.translationService.translateText(fromLang, toLang, text)
      res.json({ translatedText })
    } catch (error) {
      console.error('there was an error while translating:', error)
      res.status(500).json({ error: 'There was a server error. Please try again..' })
    }
  }
}
