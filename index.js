/**
 * Application Entry Point
 * Exports the Express server for Vercel deployment
 */
import app from './src/presentation/server.js'

// Export the Express app for Vercel
export default app

// Note: server.js handles app.listen() only in development
console.log('AI Translation API loaded...')
