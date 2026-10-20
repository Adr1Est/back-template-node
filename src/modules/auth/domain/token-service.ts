export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export interface TokenService {
  issue(userId: string): Promise<TokenPair>
  /** Devuelve el userId. Lanza UnauthorizedError si el token no es válido. */
  verifyAccess(token: string): Promise<string>
  /** Devuelve el userId. Lanza UnauthorizedError si el token no es válido. */
  verifyRefresh(token: string): Promise<string>
}
