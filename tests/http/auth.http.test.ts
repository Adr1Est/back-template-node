import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { buildApp } from '../../src/app'
import { createTestTokenService, FakePasswordHasher, silentLogger } from '../support/fakes'
import { InMemoryUserRepository } from '../support/in-memory-user-repository'

describe('Auth HTTP flow', () => {
  let app: ReturnType<typeof buildApp>

  beforeEach(() => {
    app = buildApp({
      logger: silentLogger,
      corsOrigin: '*',
      userRepository: new InMemoryUserRepository(),
      passwordHasher: new FakePasswordHasher(),
      tokenService: createTestTokenService(),
    })
  })

  it('GET /health', async () => {
    await request(app).get('/health').expect(200, { status: 'ok' })
  })

  it('register → me → refresh', async () => {
    const register = await request(app)
      .post('/auth/register')
      .send({ email: 'ada@example.com', name: 'Ada', password: 'secret123' })
      .expect(201)

    const me = await request(app)
      .get('/users/me')
      .set('Authorization', `Bearer ${register.body.accessToken}`)
      .expect(200)
    expect(me.body.email).toBe('ada@example.com')

    const refresh = await request(app)
      .post('/auth/refresh')
      .send({ refreshToken: register.body.refreshToken })
      .expect(200)
    expect(refresh.body.accessToken).toEqual(expect.any(String))
  })

  it('returns 400 on invalid body', async () => {
    const res = await request(app).post('/auth/register').send({ email: 'bad' }).expect(400)
    expect(res.body.error).toBe('validation')
  })

  it('returns 401 without token', async () => {
    await request(app).get('/users/me').expect(401)
  })

  it('does not accept a refresh token as access token', async () => {
    const register = await request(app)
      .post('/auth/register')
      .send({ email: 'ada@example.com', name: 'Ada', password: 'secret123' })

    await request(app)
      .get('/users/me')
      .set('Authorization', `Bearer ${register.body.refreshToken}`)
      .expect(401)
  })
})
