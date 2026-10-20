import { pino } from 'pino'
import type { PasswordHasher } from '../../src/modules/auth/domain/password-hasher'
import { JoseTokenService } from '../../src/modules/auth/infrastructure/jose-token-service'

/** Hasher reversible y rápido: solo para tests. */
export class FakePasswordHasher implements PasswordHasher {
  async hash(plain: string): Promise<string> {
    return `hashed:${plain}`
  }

  async verify(hash: string, plain: string): Promise<boolean> {
    return hash === `hashed:${plain}`
  }
}

export function createTestTokenService(): JoseTokenService {
  return new JoseTokenService({
    accessSecret: 'test-access-secret-at-least-32-characters',
    refreshSecret: 'test-refresh-secret-at-least-32-characters',
    accessTtl: '15m',
    refreshTtl: '7d',
  })
}

export const silentLogger = pino({ level: 'silent' })
