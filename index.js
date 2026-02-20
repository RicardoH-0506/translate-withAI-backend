/**
 * Application Entry Point
 * Starts the Express server from the presentation layer
 */
import './src/presentation/server.js'

// Note: server.js handles app.listen(), so this file just imports it
// This allows for future extensibility (e.g., cluster mode, graceful shutdown, etc.)
console.log('Starting AI Translation API...')
