import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import router from './routes/index'
import { notFoundHandler, globalErrorHandler } from './middleware/errorHandler'

const app = express()

app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173' }))
app.use(express.json())

app.use('/api/v1', router)

// Root health check
app.get('/health', (_req, res) => {
  res.json({ status: 'success', data: { message: 'ok' } })
})

app.use(notFoundHandler)
app.use(globalErrorHandler as express.ErrorRequestHandler)

export default app
