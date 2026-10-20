import type { User } from '../domain/user'

export interface UserDto {
  id: string
  email: string
  name: string
  createdAt: string
}

export function toUserDto(user: User): UserDto {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt.toISOString(),
  }
}
