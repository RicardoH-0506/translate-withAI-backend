import { ITranslationRepository } from '../../../shared/interfaces/translation.repository.interface.js'

export class CohereRepository extends ITranslationRepository {
  constructor (client) {
    super()
    this.client = client
  }

  async translate (text, fromCode, toCode, messages) {
    const response = await this.client.chat({
      model: 'command-r7b-12-2024',
      messages: [
        ...messages,
        {
          role: 'user',
          content: `${text} {{${fromCode}}} [[${toCode}]]`
        }
      ]
    })

    return response.message.content[0].text
  }
}
