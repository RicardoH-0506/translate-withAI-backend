/**
 * Express Server Configuration - Presentation Layer
 * Configures and starts the Express server
 */
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { corsMiddleware } from './src/presentation/middleware/cors.js'
import { generalRateLimit } from './src/presentation/middleware/rateLimit.js'
import { DIContainer } from './src/shared/container/dependency.container.js'
import { createTranslationRoutes } from './src/presentation/routes/translation.routes.js'

// Load environment variables from .env file
const PORT = process.env.PORT ?? 1234

const app = express()

// Initialize dependency container
const container = new DIContainer()
container.registerServices()

// Get dependencies from container
const translationController = container.get('translationController')

// Middlewares - Order matters!
app.use(cors({
  origin: corsMiddleware
}))
app.use(express.json())

// Apply general rate limiting to all endpoints
app.use(generalRateLimit)

// Disable 'X-Powered-By' header
app.disable('x-powered-by')

// Setup routes
const translationRouter = createTranslationRoutes(translationController)
app.use('/', translationRouter)

// Export app for Vercel deployment
export default app

// Start server only when not in Vercel environment
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server listening on port http://localhost:${PORT}`)
  })
}
