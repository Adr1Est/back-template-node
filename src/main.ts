import { pino } from 'pino'
import { buildApp } from './app'
import { Argon2PasswordHasher } from './modules/auth/infrastructure/argon2-password-hasher'
import { JoseTokenService } from './modules/auth/infrastructure/jose-token-service'
import { PrismaUserRepository } from './modules/users/infrastructure/persistence/prisma-user-repository'
import { env } from './shared/infrastructure/config/env'
import { createPrismaClient } from './shared/infrastructure/persistence/prisma'

const logger = pino({ level: env.LOG_LEVEL })
const prisma = createPrismaClient(env.DATABASE_URL)

const app = buildApp({
  logger,
  corsOrigin: env.CORS_ORIGIN,
  apiDocs: env.API_DOCS ?? env.NODE_ENV !== 'production',
  userRepository: new PrismaUserRepository(prisma),
  passwordHasher: new Argon2PasswordHasher(),
  tokenService: new JoseTokenService({
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessTtl: env.JWT_ACCESS_TTL,
    refreshTtl: env.JWT_REFRESH_TTL,
  }),
})

const server = app.listen(env.PORT, () => {
  logger.info(`HTTP server listening on port ${env.PORT}`)
})

async function shutdown(signal: string): Promise<void> {
  logger.info({ signal }, 'Shutting down')
  server.close()
  await prisma.$disconnect()
  process.exit(0)
}

process.on('SIGINT', () => void shutdown('SIGINT'))
process.on('SIGTERM', () => void shutdown('SIGTERM'))
