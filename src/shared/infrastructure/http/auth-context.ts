import type { Response } from 'express'
import { UnauthorizedError } from '../../domain/errors'

export function setAuthenticatedUserId(res: Response, userId: string): void {
  res.locals.userId = userId
}

/** Para rutas protegidas con requireAuth. Lanza UnauthorizedError si no hay usuario. */
export function getAuthenticatedUserId(res: Response): string {
  const userId: unknown = res.locals.userId
  if (typeof userId !== 'string') throw new UnauthorizedError('Not authenticated')
  return userId
}
