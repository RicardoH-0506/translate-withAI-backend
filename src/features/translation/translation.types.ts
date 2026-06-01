import { WebSocket } from 'ws'

// --- HTTP API Types ---

export interface TranslateRequest {
  fromLang: string
  toLang: string
  text: string
  messages?: any[]
}

export interface TranslateResponse {
  success: boolean
  data?: {
    text: string
    translatedText: string
    fromLang: string
    toLang: string
  }
  error?: string
}

// --- WebSocket Types ---

export interface WebSocketSetupData {
  fromLang: string
  toLang: string
  type: 'setup'
}

export interface AppWebSocket extends WebSocket {
  isAlive?: boolean
  sessionData?: WebSocketSetupData
  audioChunks?: Buffer[]
}
