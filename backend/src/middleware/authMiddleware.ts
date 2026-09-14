import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

import { errorResponse } from '../utils/apiResponse.js'

type JwtPayload = {
  userId: string
  email: string
  role: 'CUSTOMER' | 'ADMIN'
}

const JWT_SECRET =
  process.env.JWT_SECRET || 'pharmablaze-development-secret'

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authorization = req.headers.authorization

  if (!authorization) {
    return errorResponse(
      res,
      'Authentication token is required',
      401,
    )
  }

  const [scheme, token] = authorization.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return errorResponse(
      res,
      'Invalid authorization format. Use Bearer token',
      401,
    )
  }

  try {
    const decoded = jwt.verify(
      token,
      JWT_SECRET,
    ) as JwtPayload

    req.user = decoded

    next()
  } catch {
    return errorResponse(
      res,
      'Invalid or expired authentication token',
      401,
    )
  }
}

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.user) {
    return errorResponse(
      res,
      'Authentication required',
      401,
    )
  }

  if (req.user.role !== 'ADMIN') {
    return errorResponse(
      res,
      'Admin access required',
      403,
    )
  }

  next()
}