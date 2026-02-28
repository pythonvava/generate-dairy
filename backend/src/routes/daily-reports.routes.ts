import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import {
  getDailyReports,
  getDailyReportsValidation,
} from '../controllers/daily-reports.controller'

const router = Router()

// GET /daily-reports - Retrieve paginated list of daily reports
router.get('/', authenticate, getDailyReportsValidation, getDailyReports)

export default router
