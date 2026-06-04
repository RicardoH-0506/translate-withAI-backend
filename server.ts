import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { translationRouter } from './src/features/translation/translation.routes.js'
import { setupWebSocketServer } from './src/features/translation/translation.ws.js'
import rateLimit from 'express-rate-limit'

// Load environment variables
const PORT = process.env.PORT || 1234
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || []

// Checks if an origin is allowed: explicit list OR any localhost (for local dev)
const isOriginAllowed = (origin: string | undefined): boolean => {
  if (!origin) return true // same-origin / server-to-server
  if (ALLOWED_ORIGINS.includes(origin)) return true
  // Always allow localhost regardless of NODE_ENV (no real traffic comes from localhost)
  if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return true
  return false
}

const app = express()

// Functional middlewares instead of OOP classes
const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true)
    } else {
      callback(new Error('No permitido por CORS'))
    }
  }
})

const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window`
  standardHeaders: 'draft-7',
  legacyHeaders: false,
})

app.use(corsMiddleware)
app.use(express.json())
app.use(generalRateLimit)
app.disable('x-powered-by')

// Root health check & service metadata
app.get('/', (_req, res) => {
  res.status(200).json({
    name: 'AI Translation & Transcription API',
    version: '1.2.0',
    description: 'Backend service for real-time translations and audio transcription powered by AI',
    status: 'healthy',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      translation: '/translate',
    },
    documentation: 'https://github.com/RicardoAlexandrejs/clon-google-translate#readme',
  })
})

// Simple functional routing setup
app.use('/', translationRouter)

// Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.message)
  res.status(500).json({ success: false, error: err.message })
})

export default app

// Always start the server (dev & production/Render)
// Tests import `app` directly via supertest — no server bootstrap needed there
const server = createServer(app)

// Attach WebSocket Server to the HTTP server
setupWebSocketServer(server, isOriginAllowed)

server.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`HTTP Server listening on port http://localhost:${PORT}`)
    console.log(`WebSocket Server ready on ws://localhost:${PORT}`)
    console.log(`Environment: development`)
    console.log(`Allowed origins: any localhost (dev mode)`)
  } else {
    console.log(`Server successfully boot and listening on port ${PORT}`)
  }
})
