import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { createServer } from 'http'
import WebSocket from 'ws'
import request from 'supertest'
import app from '../server.js'
import { setupWebSocketServer } from '../src/features/translation/translation.ws.js'

// Mock the internal API module
vi.mock('../src/features/translation/translation.api.js', () => {
  return {
    transcribeAudio: vi.fn().mockResolvedValue('Mocked spoken text'),
    translateText: vi.fn().mockResolvedValue('Mocked translated text')
  }
})

describe('Backend Integration Pipelines', () => {
  let server: any
  let port: number
  let wsUrl: string

  beforeAll(() => {
    return new Promise<void>((resolve, reject) => {
      server = createServer(app)
      setupWebSocketServer(server)
      // Bind to 127.0.0.1 on a random free port
      server.listen(0, '127.0.0.1', () => {
        const address = server.address()
        if (address && typeof address === 'object') {
          port = address.port
          wsUrl = `ws://127.0.0.1:${port}`
          resolve()
        } else {
          reject(new Error('Could not retrieve server address'))
        }
      })
    })
  })

  afterAll(() => {
    return new Promise<void>((resolve) => {
      if (server) {
        server.close(() => resolve())
      } else {
        resolve()
      }
    })
  })

  describe('HTTP REST Translation Pipeline', () => {
    it('should translate text successfully with valid inputs', async () => {
      const res = await request(app)
        .post('/translate')
        .send({
          fromLang: 'English',
          toLang: 'Spanish',
          text: 'Hello world'
        })

      expect(res.status).toBe(200)
      expect(res.body).toEqual({
        success: true,
        data: {
          text: 'Hello world',
          translatedText: 'Mocked translated text',
          fromLang: 'English',
          toLang: 'Spanish'
        }
      })
    })

    it('should return error validation if text is empty', async () => {
      const res = await request(app)
        .post('/translate')
        .send({
          fromLang: 'English',
          toLang: 'Spanish',
          text: ''
        })

      expect(res.status).toBe(500)
      expect(res.body.success).toBe(false)
      expect(res.body.error).toContain('Too small: expected string to have >=1 characters')
    })

    it('should return error if source and target are the same', async () => {
      const res = await request(app)
        .post('/translate')
        .send({
          fromLang: 'English',
          toLang: 'English',
          text: 'Hello'
        })

      expect(res.status).toBe(500)
      expect(res.body.success).toBe(false)
      expect(res.body.error).toContain('Source and target languages must be different')
    })
  })

  describe('WebSocket Audio Translation Pipeline', () => {
    const createWSClient = async (): Promise<{
      ws: WebSocket
      getNextMessage: () => Promise<any>
    }> => {
      const ws = new WebSocket(wsUrl)
      const messageQueue: any[] = []
      let messageResolver: ((value: any) => void) | null = null

      ws.on('message', (data) => {
        try {
          const parsed = JSON.parse(data.toString())
          if (messageResolver) {
            const resolve = messageResolver
            messageResolver = null
            resolve(parsed)
          } else {
            messageQueue.push(parsed)
          }
        } catch (err) {
          // Ignore
        }
      })

      await new Promise<void>((resolve, reject) => {
        ws.once('open', () => resolve())
        ws.once('error', reject)
      })

      const getNextMessage = (): Promise<any> => {
        if (messageQueue.length > 0) {
          return Promise.resolve(messageQueue.shift())
        }
        return new Promise((resolve) => {
          messageResolver = resolve
        })
      }

      return { ws, getNextMessage }
    }

    it('should run setup, stream audio, and receive transcription and translation', async () => {
      const { ws, getNextMessage } = await createWSClient()

      // 1. Send setup message
      ws.send(JSON.stringify({
        type: 'setup',
        fromLang: 'es',
        toLang: 'en'
      }))

      // Expect acceptance response
      const setupRes = await getNextMessage()
      expect(setupRes).toEqual({
        type: 'status',
        message: 'Configuración aceptada'
      })

      // 2. Stream binary audio chunks
      const dummyAudio = Buffer.from('raw binary audio data')
      ws.send(dummyAudio)

      // 3. Stop streaming and wait for pipeline processing
      ws.send(JSON.stringify({ type: 'stop' }))

      // Expect "Transcribing..." status
      const transcribingRes = await getNextMessage()
      expect(transcribingRes).toEqual({
        type: 'status',
        message: 'Transcribing...'
      })

      // Expect "Translating..." status
      const translatingRes = await getNextMessage()
      expect(translatingRes).toEqual({
        type: 'status',
        message: 'Translating...'
      })

      // Expect final transcription & translation result
      const finalResult = await getNextMessage()
      expect(finalResult).toEqual({
        type: 'result',
        text: 'Mocked spoken text',
        translatedText: 'Mocked translated text',
        fromLang: 'es',
        toLang: 'en'
      })

      ws.close()
    })

    it('should error when stop is requested without audio chunks', async () => {
      const { ws, getNextMessage } = await createWSClient()

      ws.send(JSON.stringify({
        type: 'setup',
        fromLang: 'es',
        toLang: 'en'
      }))
      await getNextMessage() // Consume setup acceptance

      ws.send(JSON.stringify({ type: 'stop' }))

      const errRes = await getNextMessage()
      expect(errRes).toEqual({
        type: 'error',
        message: 'No audio chunks to process'
      })

      ws.close()
    })

    it('should error when stop is requested with audio chunks but without setup', async () => {
      const { ws, getNextMessage } = await createWSClient()

      ws.send(Buffer.from('binary chunk'))
      ws.send(JSON.stringify({ type: 'stop' }))

      const errRes = await getNextMessage()
      expect(errRes).toEqual({
        type: 'error',
        message: 'Session data not initialized. Send setup first.'
      })

      ws.close()
    })

    it('should reject a chunk larger than 1MB', async () => {
      const { ws, getNextMessage } = await createWSClient()

      const bigChunk = Buffer.alloc(1024 * 1024 + 1) // 1MB + 1 byte
      ws.send(bigChunk)

      const errRes = await getNextMessage()
      expect(errRes).toEqual({
        type: 'error',
        message: 'Audio chunk too large'
      })

      ws.close()
    })

    it('should limit connections per IP to 5', async () => {
      const clients: WebSocket[] = []

      // Open 5 connections successfully
      for (let i = 0; i < 5; i++) {
        const client = new WebSocket(wsUrl)
        await new Promise<void>((resolve, reject) => {
          client.once('open', () => resolve())
          client.once('error', reject)
        })
        clients.push(client)
      }

      // 6th connection should be rejected and closed with code 1008
      const extraClient = new WebSocket(wsUrl)
      const closeCode = await new Promise<number>((resolve) => {
        extraClient.once('close', (code) => {
          resolve(code)
        })
      })

      expect(closeCode).toBe(1008)

      // Clean up connections
      for (const client of clients) {
        client.close()
      }
    })
  })
})
