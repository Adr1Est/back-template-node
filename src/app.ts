import type { Express } from 'express'
import type { Logger } from 'pino'
import { LoginUser } from './modules/auth/application/login-user'
import { RefreshSession } from './modules/auth/application/refresh-session'
import { RegisterUser } from './modules/auth/application/register-user'
import type { PasswordHasher } from './modules/auth/domain/password-hasher'
import type { TokenService } from './modules/auth/domain/token-service'
import { authRoutes } from './modules/auth/infrastructure/http/auth.routes'
import { requireAuth } from './modules/auth/infrastructure/http/require-auth'
import { GetCurrentUser } from './modules/users/application/get-current-user'
import type { UserRepository } from './modules/users/domain/user-repository'
import { userRoutes } from './modules/users/infrastructure/http/user.routes'
import { createServer } from './shared/infrastructure/http/server'

/** Adaptadores que necesita la app. main.ts pasa los reales; los tests, dobles en memoria. */
export interface AppDeps {
  logger: Logger
  corsOrigin: string | string[]
  userRepository: UserRepository
  passwordHasher: PasswordHasher
  tokenService: TokenService
}

export function buildApp(deps: AppDeps): Express {
  const { userRepository, passwordHasher, tokenService } = deps

  return createServer({
    logger: deps.logger,
    corsOrigin: deps.corsOrigin,
    routes: [
      {
        path: '/auth',
        router: authRoutes({
          registerUser: new RegisterUser(userRepository, passwordHasher, tokenService),
          loginUser: new LoginUser(userRepository, passwordHasher, tokenService),
          refreshSession: new RefreshSession(userRepository, tokenService),
        }),
      },
      {
        path: '/users',
        router: userRoutes({
          getCurrentUser: new GetCurrentUser(userRepository),
          requireAuth: requireAuth(tokenService),
        }),
      },
    ],
  })
}
