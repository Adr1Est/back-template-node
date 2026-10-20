import type { PrismaClient, User as UserRow } from '../../../../generated/prisma/client'
import { User } from '../../domain/user'
import type { UserRepository } from '../../domain/user-repository'

function toDomain(row: UserRow): User {
  return User.fromPersistence({
    id: row.id,
    email: row.email,
    name: row.name,
    passwordHash: row.passwordHash,
    createdAt: row.createdAt,
  })
}

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id } })
    return row ? toDomain(row) : null
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { email } })
    return row ? toDomain(row) : null
  }

  async save(user: User): Promise<void> {
    const data = user.toPrimitives()
    await this.prisma.user.upsert({ where: { id: data.id }, create: data, update: data })
  }
}
