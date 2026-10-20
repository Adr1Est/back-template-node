import type { RequestHandler } from 'express'
import { UnauthorizedError } from '../../../../shared/domain/errors'
import { setAuthenticatedUserId } from '../../../../shared/infrastructure/http/auth-context'
import type { TokenService } from '../../domain/token-service'

/** Verifica el access token. Las rutas leen el usuario con getAuthenticatedUserId(res). */
export function requireAuth(tokens: TokenService): RequestHandler {
  return async (req, res, next) => {
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer ')) throw new UnauthorizedError('Missing bearer token')

    setAuthenticatedUserId(res, await tokens.verifyAccess(header.slice('Bearer '.length)))
    next()
  }
}
