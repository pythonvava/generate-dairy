import type { Response } from 'express'

export function success<T>(res: Response, data: T, statusCode = 200): void {
  res.status(statusCode).json({ status: 'success', data })
}

export function paginated<T>(
  res: Response,
  items: T[],
  page: number,
  perPage: number,
  totalCount: number
): void {
  const totalPages = Math.ceil(totalCount / perPage)
  res.status(200).json({
    status: 'success',
    data: { items },
    pagination: { page, per_page: perPage, total_count: totalCount, total_pages: totalPages },
  })
}

export function error(
  res: Response,
  code: string,
  message: string,
  statusCode = 500,
  details?: { field: string; message: string }[]
): void {
  res.status(statusCode).json({
    status: 'error',
    error: { code, message, ...(details ? { details } : {}) },
  })
}
