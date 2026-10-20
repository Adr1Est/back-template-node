import { type RequestHandler, Router } from 'express'
import { getAuthenticatedUserId } from '../../../../shared/infrastructure/http/auth-context'
import type { GetCurrentUser } from '../../application/get-current-user'

export interface UserRoutesDeps {
  getCurrentUser: GetCurrentUser
  requireAuth: RequestHandler
}

export function userRoutes({ getCurrentUser, requireAuth }: UserRoutesDeps): Router {
  const router = Router()

  router.get('/me', requireAuth, async (_req, res) => {
    res.json(await getCurrentUser.execute(getAuthenticatedUserId(res)))
  })

  return router
}
