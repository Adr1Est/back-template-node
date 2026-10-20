import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { type AppDeps, buildApp } from '../../src/app'
import { createTestTokenService, FakePasswordHasher, silentLogger } from '../support/fakes'
import { InMemoryUserRepository } from '../support/in-memory-user-repository'

function createApp(apiDocs: boolean) {
  const deps: AppDeps = {
    logger: silentLogger,
    corsOrigin: '*',
    apiDocs,
    userRepository: new InMemoryUserRepository(),
    passwordHasher: new FakePasswordHasher(),
    tokenService: createTestTokenService(),
  }
  return buildApp(deps)
}

describe('API docs', () => {
  it('serves the OpenAPI document with every route', async () => {
    const res = await request(createApp(true)).get('/docs/openapi.json').expect(200)

    expect(res.body.openapi).toBe('3.1.0')
    expect(Object.keys(res.body.paths)).toEqual(
      expect.arrayContaining([
        '/health',
        '/auth/register',
        '/auth/login',
        '/auth/refresh',
        '/users/me',
      ]),
    )
    expect(res.body.paths['/users/me'].get.security).toEqual([{ bearerAuth: [] }])
  })

  it('serves Swagger UI', async () => {
    const res = await request(createApp(true)).get('/docs/').expect(200)
    expect(res.text).toContain('swagger-ui')
  })

  it('is disabled by default', async () => {
    await request(createApp(false)).get('/docs/openapi.json').expect(404)
  })
})
