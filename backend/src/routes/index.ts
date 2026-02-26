import { Router } from 'express'
import dailyReportsRouter from './daily-reports.routes'

const router = Router()

router.get('/health', (_req, res) => {
  res.json({ status: 'success', data: { message: 'ok' } })
})

router.use('/daily-reports', dailyReportsRouter)

export default router
