import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { translationRouter } from './src/features/translation/translation.routes.js'
import { setupWebSocketServer } from './src/features/translation/translation.ws.js'
import rateLimit from 'express-rate-limit'

// Load environment variables
const PORT = process.env.PORT || 1234
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173']

const app = express()

// Functional middlewares instead of OOP classes
const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
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

// Simple functional routing setup
app.use('/', translationRouter)

// Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.message)
  res.status(500).json({ success: false, error: err.message })
})

export default app

if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
  const server = createServer(app)
  
  // Attach WebSocket Server functionally
  setupWebSocketServer(server)

  server.listen(PORT, () => {
    console.log(`🚀 HTTP Server listening on port http://localhost:${PORT}`)
    console.log(`📡 WebSocket Server ready on ws://localhost:${PORT}`)
  })
}
