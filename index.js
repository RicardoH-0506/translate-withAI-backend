/**
 * Application Entry Point
 * Imports Express explicitly and exports configured app for Vercel deployment
 */
import express from 'express'
import app from './src/presentation/server.js'

// Export the Express app for Vercel
export default app
