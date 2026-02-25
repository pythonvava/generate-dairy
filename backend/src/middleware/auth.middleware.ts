import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { error } from '../lib/response'

const JWT_SECRET = process.env.JWT_SECRET ?? 'secret'

interface JwtPayload {
  id: number
  email: string
  position: string
}

function resolveRole(position: string): 'general' | 'manager' {
  const managerPositions = ['KAKARICHOU', 'KACHOU', 'BUCHOU']
  if (managerPositions.includes(position)) {
    return 'manager'
  }
  return 'general'
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    error(res, 'UNAUTHORIZED', '認証が必要です', 401)
    return
  }

  const token = authHeader.slice(7)

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload
    req.user = {
      id: payload.id,
      email: payload.email,
      role: resolveRole(payload.position),
    }
    next()
  } catch (err) {
    error(res, 'UNAUTHORIZED', '認証が必要です', 401)
  }
}

export function requireRole(role: 'manager' | 'general'): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      error(res, 'UNAUTHORIZED', '認証が必要です', 401)
      return
    }

    if (role === 'manager' && req.user.role !== 'manager') {
      error(res, 'FORBIDDEN', '権限がありません', 403)
      return
    }

    next()
  }
}
