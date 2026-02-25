import express from 'express'
import cors from 'cors'
import helmet from 'helmet'

const app = express()

app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173' }))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'success', data: { message: 'ok' } })
})

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    status: 'error',
    error: { code: 'NOT_FOUND', message: 'The requested resource was not found' },
  })
})

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({
    status: 'error',
    error: { code: 'INTERNAL_ERROR', message: 'An internal server error occurred' },
  })
})

export default app
