import { WebSocketServer } from 'ws'
import { Server } from 'http'
import { z } from 'zod'
import { AppWebSocket, WebSocketSetupData } from './translation.types.js'
import { transcribeAudio, translateText } from './translation.api.js'

// Esquema Zod para validar los metadatos enviados antes del audio
const wsMetadataSchema = z.object({
  fromLang: z.string().min(2),
  toLang: z.string().min(2),
  type: z.literal('setup')
})

// Memoria simple para Rate Limiting de conexiones por IP
const connectionLimits = new Map<string, number>()
const MAX_CONNECTIONS_PER_IP = 5

/**
 * Configura y gestiona las conexiones WebSocket para la traducción por voz.
 */
export function setupWebSocketServer(server: Server) {
  const wss = new WebSocketServer({ server })
  console.log('✅ WebSocket Server inicializado')

  wss.on('connection', (ws: AppWebSocket, req) => {
    const ip = req.socket.remoteAddress || 'unknown'

    // 🛡️ Rate Limiting: Evitar ataques DoS limitando conexiones por IP
    const currentConnections = connectionLimits.get(ip) || 0
    if (currentConnections >= MAX_CONNECTIONS_PER_IP) {
      console.warn(`⚠️ Bloqueada conexión WS desde ${ip}: Límite excedido`)
      ws.close(1008, 'Rate limit exceeded')
      return
    }
    connectionLimits.set(ip, currentConnections + 1)

    console.log('🟢 Nuevo cliente WebSocket conectado:', ip)
    
    // Inicializar buffer de audio
    ws.audioChunks = []

    // Mecanismo de Ping/Pong
    ws.isAlive = true
    ws.on('pong', () => { ws.isAlive = true })

    ws.on('message', async (data: Buffer | string, isBinary: boolean) => {
      try {
        if (isBinary && Buffer.isBuffer(data)) {
          // 🛡️ Seguridad: Limitar tamaño del chunk de audio (ej. Max 1MB)
          if (data.length > 1024 * 1024) {
            console.warn('⚠️ Chunk de audio demasiado grande')
            return ws.send(JSON.stringify({ type: 'error', message: 'Audio chunk too large' }))
          }

          if (!ws.audioChunks) {
            ws.audioChunks = []
          }
          ws.audioChunks.push(data)
          console.log(`📦 Recibidos ${data.length} bytes de audio binario. Total chunks: ${ws.audioChunks.length}`)
        } else {
          const message = data.toString()
          try {
            const parsedData = JSON.parse(message)

            if (parsedData.type === 'setup') {
              const validatedData = wsMetadataSchema.parse(parsedData) as WebSocketSetupData
              console.log('📝 Metadatos configurados:', validatedData)
              ws.sessionData = validatedData
              ws.audioChunks = [] // Limpiar por seguridad
              ws.send(JSON.stringify({ type: 'status', message: 'Configuración aceptada' }))
            } else if (parsedData.type === 'stop') {
              if (!ws.audioChunks || ws.audioChunks.length === 0) {
                return ws.send(JSON.stringify({ type: 'error', message: 'No audio chunks to process' }))
              }

              const fromLang = ws.sessionData?.fromLang
              const toLang = ws.sessionData?.toLang

              if (!fromLang || !toLang) {
                return ws.send(JSON.stringify({ type: 'error', message: 'Session data not initialized. Send setup first.' }))
              }

              console.log(`🎙️ Procesando ${ws.audioChunks.length} chunks de audio...`)
              ws.send(JSON.stringify({ type: 'status', message: 'Transcribing...' }))

              const audioBuffer = Buffer.concat(ws.audioChunks)
              ws.audioChunks = [] // Resetear para la siguiente frase

              try {
                // 1. Transcribir con Groq Whisper
                const text = await transcribeAudio(audioBuffer)
                console.log(`📝 Transcripción completada: "${text}"`)

                if (!text.trim()) {
                  return ws.send(JSON.stringify({
                    type: 'result',
                    text: '',
                    translatedText: '',
                    fromLang,
                    toLang
                  }))
                }

                // 2. Traducir con Cohere
                ws.send(JSON.stringify({ type: 'status', message: 'Translating...' }))
                const translatedText = await translateText(text, fromLang, toLang)
                console.log(`🌐 Traducción completada: "${translatedText}"`)

                // 3. Enviar resultados
                ws.send(JSON.stringify({
                  type: 'result',
                  text,
                  translatedText,
                  fromLang,
                  toLang
                }))
              } catch (err: any) {
                console.error('❌ Error en STT/Traducción:', err)
                ws.send(JSON.stringify({ type: 'error', message: `Processing failed: ${err.message}` }))
              }
            } else {
              ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }))
            }
          } catch (jsonErr) {
            console.error('❌ Error de parseo/validación de JSON:', jsonErr)
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON or message format' }))
          }
        }
      } catch (error) {
        console.error('❌ Error procesando mensaje WS:', error)
        ws.send(JSON.stringify({ type: 'error', message: 'Error interno del servidor' }))
      }
    })

    ws.on('close', () => {
      console.log('🔴 Cliente WebSocket desconectado:', ip)
      const current = connectionLimits.get(ip) || 0
      if (current > 1) {
        connectionLimits.set(ip, current - 1)
      } else {
        connectionLimits.delete(ip)
      }
      ws.audioChunks = []
    })
  })

  const interval = setInterval(() => {
    wss.clients.forEach((client) => {
      const ws = client as AppWebSocket
      if (ws.isAlive === false) return ws.terminate()
      ws.isAlive = false
      ws.ping()
    })
  }, 30000)

  wss.on('close', () => clearInterval(interval))

  return wss
}
