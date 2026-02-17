import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { corsMiddleware } from './src/shared/middleware/cors.middleware.js'
import { TranslationController } from './src/features/translation/controllers/translation.controller.js'

// Load environment variables from .env file
const PORT = process.env.PORT ?? 1234

const app = express()

// Middlewares
app.use(cors({
  origin: corsMiddleware
}))
app.use(express.json())

// Disable 'X-Powered-By' header
app.disable('x-powered-by')

// Initialize controllers
const translationController = new TranslationController()

// Routes
app.get('/', (req, res) => {
  res.json({
    api_name: 'AI-powered translation API',
    version: 'v1.0',
    status: 'online',
    documentation: 'Use the POST method on the /translate endpoint to send text and receive the translation.',
    available_endpoints: {
      translate: 'POST /translate'
    }
  })
})

app.post('/translate', (req, res, next) => translationController.translate(req, res, next))

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', message: `Cannot ${req.method} ${req.originalUrl}` })
})

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port http://localhost:${PORT}`)
})

export default app
