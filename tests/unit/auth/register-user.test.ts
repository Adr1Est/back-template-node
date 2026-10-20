import { beforeEach, describe, expect, it } from 'vitest'
import { RegisterUser } from '../../../src/modules/auth/application/register-user'
import { ConflictError, ValidationError } from '../../../src/shared/domain/errors'
import { createTestTokenService, FakePasswordHasher } from '../../support/fakes'
import { InMemoryUserRepository } from '../../support/in-memory-user-repository'

describe('RegisterUser', () => {
  let users: InMemoryUserRepository
  let registerUser: RegisterUser

  beforeEach(() => {
    users = new InMemoryUserRepository()
    registerUser = new RegisterUser(users, new FakePasswordHasher(), createTestTokenService())
  })

  it('creates the user with a hashed password and returns tokens', async () => {
    const result = await registerUser.execute({
      email: '  Ada@Example.com ',
      name: 'Ada',
      password: 'secret123',
    })

    expect(result.user.email).toBe('ada@example.com')
    expect(result.accessToken).toEqual(expect.any(String))
    expect(result.refreshToken).toEqual(expect.any(String))
    expect(users.users.get(result.user.id)?.passwordHash).toBe('hashed:secret123')
  })

  it('rejects a duplicated email', async () => {
    const input = { email: 'ada@example.com', name: 'Ada', password: 'secret123' }
    await registerUser.execute(input)

    await expect(registerUser.execute(input)).rejects.toBeInstanceOf(ConflictError)
  })

  it('rejects an invalid email', async () => {
    await expect(
      registerUser.execute({ email: 'not-an-email', name: 'Ada', password: 'secret123' }),
    ).rejects.toBeInstanceOf(ValidationError)
  })
})
