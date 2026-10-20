import { randomUUID } from 'node:crypto'
import { ConflictError } from '../../../shared/domain/errors'
import { toUserDto, type UserDto } from '../../users/application/user-dto'
import { normalizeEmail, User } from '../../users/domain/user'
import type { UserRepository } from '../../users/domain/user-repository'
import type { PasswordHasher } from '../domain/password-hasher'
import type { TokenPair, TokenService } from '../domain/token-service'

export interface RegisterUserInput {
  email: string
  name: string
  password: string
}

export class RegisterUser {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService,
  ) {}

  async execute(input: RegisterUserInput): Promise<{ user: UserDto } & TokenPair> {
    const email = normalizeEmail(input.email)
    if (await this.users.findByEmail(email)) throw new ConflictError('Email already registered')

    const user = User.create({
      id: randomUUID(),
      email,
      name: input.name,
      passwordHash: await this.hasher.hash(input.password),
    })
    await this.users.save(user)

    return { user: toUserDto(user), ...(await this.tokens.issue(user.id)) }
  }
}
