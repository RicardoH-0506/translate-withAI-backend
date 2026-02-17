import { CohereRepository } from '../repositories/cohere.repository.js'
import { messages } from './few-shot.js'
import { SUPPORTED_LANGUAGES } from '../../../shared/constants/constants.js'

export class TranslationService {
  constructor () {
    this.cohereRepository = new CohereRepository()
  }

  async translateText (fromLang, toLang, text) {
    // If languages are the same, return original text
    if (fromLang === toLang) {
      return text
    }

    const fromCode = fromLang === 'auto' ? 'auto' : SUPPORTED_LANGUAGES[fromLang]
    const toCode = SUPPORTED_LANGUAGES[toLang]

    const translatedText = await this.cohereRepository.translate(text, fromCode, toCode, messages)

    return translatedText
  }
}
