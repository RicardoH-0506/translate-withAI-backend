import { CohereClient } from 'cohere-ai'
import { Groq, toFile } from 'groq-sdk'
import { TRANSLATION_PREAMBLE, TRANSLATION_FEW_SHOTS } from './translation.prompts.js'

// Singleton-like initialization for the clients
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY || ''
})

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
})

/**
 * Translates text using Cohere's command-a-translate model.
 * Uses a strict preamble + few-shot examples to enforce translation-only output.
 */
export const translateText = async (
  text: string,
  fromCode: string,
  toCode: string,
): Promise<string> => {
  const response = await cohere.chat({
    model: 'command-a-translate-08-2025',
    preamble: TRANSLATION_PREAMBLE,
    chatHistory: TRANSLATION_FEW_SHOTS,
    message: `${text} {{${fromCode}}} [[${toCode}]]`
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
