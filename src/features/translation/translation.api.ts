import { CohereClient } from 'cohere-ai'
import { Groq, toFile } from 'groq-sdk'

// Singleton-like initialization for the clients
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY || ''
})

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
})

/**
 * Translates text using Cohere's command-a-translate model
 */
export const translateText = async (
  text: string,
  fromCode: string,
  toCode: string,
  messages: any[] = []
): Promise<string> => {
  const response = await cohere.chat({
    model: 'command-a-translate-08-2025',
    message: `${text} {{${fromCode}}} [[${toCode}]]`,
    chatHistory: messages // messages are passed as context history
  })

  return response.text
}

/**
 * Transcribes binary audio to text using Groq's Whisper model.
 * @param audioBuffer The raw binary audio chunk (e.g. webm/ogg)
 * @param filename A dummy filename required by the API
 */
export const transcribeAudio = async (audioBuffer: Buffer, filename: string = 'audio.webm'): Promise<string> => {
  // Convert Buffer to a File-like object structure expected by Groq SDK using the toFile helper
  const file = await toFile(audioBuffer, filename, { type: 'audio/webm' })
  
  const transcription = await groq.audio.transcriptions.create({
    file,
    model: 'whisper-large-v3-turbo', // The fastest model available for real-time
    response_format: 'json'
  })

  return transcription.text
}
