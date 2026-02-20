export const corsMiddleware = (origin, callback) => {
  const ACCEPTED_ORIGINS = [
    'http://localhost:5174',
    'http://localhost:5173',
    'https://translate-with-ia.vercel.app'
  ]

  if (ACCEPTED_ORIGINS.includes(origin)) {
    return callback(null, true)
  }

  if (!origin) {
    return callback(null, true)
  }

  return callback(new Error('Not allowed by CORS'))
}
