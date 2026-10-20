import { UnauthorizedError } from '../../../shared/domain/errors'
import type { UserRepository } from '../../users/domain/user-repository'
import type { TokenPair, TokenService } from '../domain/token-service'

export class RefreshSession {
  constructor(
    private readonly users: UserRepository,
    private readonly tokens: TokenService,
  ) {}

  async execute(refreshToken: string): Promise<TokenPair> {
    const userId = await this.tokens.verifyRefresh(refreshToken)
    if (!(await this.users.findById(userId))) throw new UnauthorizedError('User no longer exists')

    return this.tokens.issue(userId)
  }
}
