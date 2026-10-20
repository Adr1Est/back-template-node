import { NotFoundError } from '../../../shared/domain/errors'
import type { UserRepository } from '../domain/user-repository'
import { toUserDto, type UserDto } from './user-dto'

export class GetCurrentUser {
  constructor(private readonly users: UserRepository) {}

  async execute(userId: string): Promise<UserDto> {
    const user = await this.users.findById(userId)
    if (!user) throw new NotFoundError('User not found')
    return toUserDto(user)
  }
}
