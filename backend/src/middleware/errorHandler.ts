import type { Request, Response, NextFunction } from 'express'
import { error } from '../lib/response'

export function notFoundHandler(_req: Request, res: Response): void {
  error(res, 'NOT_FOUND', 'The requested resource was not found', 404)
}

export function globalErrorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(err.stack)
  error(res, 'INTERNAL_ERROR', 'An internal server error occurred', 500)
}
