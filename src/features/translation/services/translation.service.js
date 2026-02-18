import { messages } from './few-shot.js'
import { SUPPORTED_LANGUAGES } from '../../../shared/constants/constants.js'
import { ITranslationService } from '../../../shared/interfaces/translation.service.interface.js'

export class TranslationService extends ITranslationService {
  constructor (repository) {
    super()
    this.repository = repository
  }

  async translateText (fromLang, toLang, text) {
    // If languages are the same, return original text
    if (fromLang === toLang) {
      return text
    }

    const fromCode = fromLang === 'auto' ? 'auto' : SUPPORTED_LANGUAGES[fromLang]
    const toCode = SUPPORTED_LANGUAGES[toLang]

    const translatedText = await this.repository.translate(text, fromCode, toCode, messages)

    return translatedText
  }
}
