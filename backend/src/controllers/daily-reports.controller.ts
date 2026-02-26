import type { Request, Response } from 'express'
import { query, validationResult } from 'express-validator'
import { prisma } from '../lib/prisma'
import { paginated, error } from '../lib/response'

/**
 * Query parameter validation rules for GET /daily-reports
 */
export const getDailyReportsValidation = [
  query('date_from')
    .optional()
    .isISO8601()
    .withMessage('date_from は YYYY-MM-DD 形式で入力してください'),
  query('date_to')
    .optional()
    .isISO8601()
    .withMessage('date_to は YYYY-MM-DD 形式で入力してください'),
  query('sales_person_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('sales_person_id は正の整数で入力してください')
    .toInt(),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page は1以上の整数で入力してください')
    .toInt(),
  query('per_page')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('per_page は1〜100の整数で入力してください')
    .toInt(),
]

/**
 * GET /daily-reports
 *
 * Retrieves a paginated list of daily reports with optional date range
 * and sales person filtering. General users can only see their own reports;
 * managers can see all reports.
 */
export async function getDailyReports(req: Request, res: Response): Promise<void> {
  // Validate query parameters
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const details = errors.array().map((err) => ({
      field: 'msg' in err && 'path' in err ? (err as { path: string }).path : 'unknown',
      message: err.msg as string,
    }))
    error(res, 'VALIDATION_ERROR', '入力内容に誤りがあります', 400, details)
    return
  }

  const user = req.user
  if (!user) {
    error(res, 'UNAUTHORIZED', '認証が必要です', 401)
    return
  }

  // Parse query parameters with defaults
  const now = new Date()
  const defaultDateTo = formatDate(now)
  const defaultDateFrom = formatDate(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000))

  const dateFrom = (req.query.date_from as string) || defaultDateFrom
  const dateTo = (req.query.date_to as string) || defaultDateTo
  const page = typeof req.query.page === 'number' ? req.query.page : 1
  const perPage = typeof req.query.per_page === 'number' ? req.query.per_page : 20

  // Build sales_person_id filter based on role
  let salesPersonIdFilter: number | undefined
  if (user.role === 'general') {
    // General users can only see their own reports
    salesPersonIdFilter = user.id
  } else {
    // Managers can filter by any sales_person_id, or see all
    salesPersonIdFilter = typeof req.query.sales_person_id === 'number'
      ? req.query.sales_person_id
      : undefined
  }

  // Build Prisma where clause
  const where = {
    reportDate: {
      gte: new Date(dateFrom),
      lte: new Date(dateTo),
    },
    ...(salesPersonIdFilter !== undefined && { salesPersonId: salesPersonIdFilter }),
  }

  try {
    // Execute count and findMany in parallel for efficiency
    const [totalCount, reports] = await Promise.all([
      prisma.dailyReport.count({ where }),
      prisma.dailyReport.findMany({
        where,
        select: {
          id: true,
          reportDate: true,
          createdAt: true,
          updatedAt: true,
          salesPerson: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              visitRecords: true,
              comments: true,
            },
          },
        },
        orderBy: { reportDate: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
    ])

    // Transform to API response format
    const items = reports.map((report) => ({
      id: report.id,
      report_date: formatDate(report.reportDate),
      sales_person: {
        id: report.salesPerson.id,
        name: report.salesPerson.name,
      },
      visit_count: report._count.visitRecords,
      comment_count: report._count.comments,
      created_at: report.createdAt.toISOString(),
      updated_at: report.updatedAt.toISOString(),
    }))

    paginated(res, items, page, perPage, totalCount)
  } catch (err) {
    console.error('Error fetching daily reports:', err)
    error(res, 'INTERNAL_ERROR', 'サーバー内部エラーが発生しました', 500)
  }
}

/**
 * Formats a Date object to YYYY-MM-DD string.
 */
function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
