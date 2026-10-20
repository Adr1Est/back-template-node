import { randomUUID } from 'node:crypto'
import { jwtVerify, SignJWT } from 'jose'
import { UnauthorizedError } from '../../../shared/domain/errors'
import type { TokenPair, TokenService } from '../domain/token-service'

export interface JoseTokenServiceConfig {
  accessSecret: string
  refreshSecret: string
  /** Formato aceptado por jose: '15m', '7d', '1h'… */
  accessTtl: string
  refreshTtl: string
}

const ALG = 'HS256'
const encoder = new TextEncoder()

export class JoseTokenService implements TokenService {
  private readonly accessKey: Uint8Array
  private readonly refreshKey: Uint8Array

  constructor(private readonly config: JoseTokenServiceConfig) {
    this.accessKey = encoder.encode(config.accessSecret)
    this.refreshKey = encoder.encode(config.refreshSecret)
  }

  async issue(userId: string): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      this.sign(userId, this.accessKey, this.config.accessTtl),
      this.sign(userId, this.refreshKey, this.config.refreshTtl),
    ])
    return { accessToken, refreshToken }
  }

  verifyAccess(token: string): Promise<string> {
    return this.verify(token, this.accessKey)
  }

  verifyRefresh(token: string): Promise<string> {
    return this.verify(token, this.refreshKey)
  }

  private sign(userId: string, key: Uint8Array, ttl: string): Promise<string> {
    return new SignJWT()
      .setProtectedHeader({ alg: ALG })
      .setSubject(userId)
      .setJti(randomUUID())
      .setIssuedAt()
      .setExpirationTime(ttl)
      .sign(key)
  }

  private async verify(token: string, key: Uint8Array): Promise<string> {
    try {
      const { payload } = await jwtVerify(token, key, { algorithms: [ALG] })
      if (payload.sub) return payload.sub
    } catch {
      // cae al throw de abajo
    }
    throw new UnauthorizedError('Invalid or expired token')
  }
}
