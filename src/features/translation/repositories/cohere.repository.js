import { CohereClientV2 } from 'cohere-ai'

export class CohereRepository {
  constructor () {
    this.client = new CohereClientV2({ token: process.env.COHERE_API_KEY })
  }

  async translate (text, fromCode, toCode, messages) {
    const response = await this.client.chat({
      model: 'command-a-translate-08-2025',
      messages: [
        ...messages,
        {
          role: 'user',
          content: `${text} {{${fromCode}}} [[${toCode}]]`
        }
      ],
    })

    return response.message?.content
  }
}
