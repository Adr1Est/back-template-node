import { UnauthorizedError } from '../../../shared/domain/errors'
import { toUserDto, type UserDto } from '../../users/application/user-dto'
import { normalizeEmail } from '../../users/domain/user'
import type { UserRepository } from '../../users/domain/user-repository'
import type { PasswordHasher } from '../domain/password-hasher'
import type { TokenPair, TokenService } from '../domain/token-service'

export interface LoginUserInput {
  email: string
  password: string
}

export class LoginUser {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService,
  ) {}

  async execute(input: LoginUserInput): Promise<{ user: UserDto } & TokenPair> {
    const user = await this.users.findByEmail(normalizeEmail(input.email))
    const valid = user ? await this.hasher.verify(user.passwordHash, input.password) : false
    if (!user || !valid) throw new UnauthorizedError('Invalid credentials')

    return { user: toUserDto(user), ...(await this.tokens.issue(user.id)) }
  }
}
