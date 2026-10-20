import { beforeEach, describe, expect, it } from 'vitest'
import { LoginUser } from '../../../src/modules/auth/application/login-user'
import { RegisterUser } from '../../../src/modules/auth/application/register-user'
import { UnauthorizedError } from '../../../src/shared/domain/errors'
import { createTestTokenService, FakePasswordHasher } from '../../support/fakes'
import { InMemoryUserRepository } from '../../support/in-memory-user-repository'

describe('LoginUser', () => {
  let loginUser: LoginUser

  beforeEach(async () => {
    const users = new InMemoryUserRepository()
    const hasher = new FakePasswordHasher()
    const tokens = createTestTokenService()
    await new RegisterUser(users, hasher, tokens).execute({
      email: 'ada@example.com',
      name: 'Ada',
      password: 'secret123',
    })
    loginUser = new LoginUser(users, hasher, tokens)
  })

  it('returns tokens for valid credentials', async () => {
    const result = await loginUser.execute({ email: 'ADA@example.com', password: 'secret123' })

    expect(result.user.email).toBe('ada@example.com')
    expect(result.accessToken).toEqual(expect.any(String))
  })

  it('rejects a wrong password', async () => {
    await expect(
      loginUser.execute({ email: 'ada@example.com', password: 'wrong' }),
    ).rejects.toBeInstanceOf(UnauthorizedError)
  })

  it('rejects an unknown email', async () => {
    await expect(
      loginUser.execute({ email: 'nobody@example.com', password: 'secret123' }),
    ).rejects.toBeInstanceOf(UnauthorizedError)
  })
})
