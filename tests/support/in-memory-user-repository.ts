import type { User } from '../../src/modules/users/domain/user'
import type { UserRepository } from '../../src/modules/users/domain/user-repository'

export class InMemoryUserRepository implements UserRepository {
  readonly users = new Map<string, User>()

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null
  }

  async findByEmail(email: string): Promise<User | null> {
    return [...this.users.values()].find((u) => u.email === email) ?? null
  }

  async save(user: User): Promise<void> {
    this.users.set(user.id, user)
  }
}
