import { Router } from 'express'
import { z } from 'zod'
import type { LoginUser } from '../../application/login-user'
import type { RefreshSession } from '../../application/refresh-session'
import type { RegisterUser } from '../../application/register-user'

const registerSchema = z.object({
  email: z.email(),
  name: z.string().min(1).max(100),
  password: z.string().min(8).max(128),
})

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
})

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
})

export interface AuthRoutesDeps {
  registerUser: RegisterUser
  loginUser: LoginUser
  refreshSession: RefreshSession
}

export function authRoutes({ registerUser, loginUser, refreshSession }: AuthRoutesDeps): Router {
  const router = Router()

  router.post('/register', async (req, res) => {
    const input = registerSchema.parse(req.body)
    res.status(201).json(await registerUser.execute(input))
  })

  router.post('/login', async (req, res) => {
    const input = loginSchema.parse(req.body)
    res.json(await loginUser.execute(input))
  })

  router.post('/refresh', async (req, res) => {
    const { refreshToken } = refreshSchema.parse(req.body)
    res.json(await refreshSession.execute(refreshToken))
  })

  return router
}
