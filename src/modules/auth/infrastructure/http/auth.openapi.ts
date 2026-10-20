import { z } from 'zod'
import type { ZodOpenApiPathsObject, ZodOpenApiRequestBodyObject } from 'zod-openapi'
import { errorResponse } from '../../../../shared/infrastructure/http/openapi'
import { userSchema } from '../../../users/infrastructure/http/user.openapi'
import { loginSchema, refreshSchema, registerSchema } from './auth.routes'

const tokenPairSchema = z
  .object({ accessToken: z.string(), refreshToken: z.string() })
  .meta({ id: 'TokenPair' })

const sessionSchema = tokenPairSchema.extend({ user: userSchema }).meta({ id: 'Session' })

function jsonBody(schema: z.ZodType): ZodOpenApiRequestBodyObject {
  return { required: true, content: { 'application/json': { schema } } }
}

export const authDocs: ZodOpenApiPathsObject = {
  '/register': {
    post: {
      tags: ['auth'],
      summary: 'Registrar usuario',
      requestBody: jsonBody(registerSchema),
      responses: {
        '201': {
          description: 'Creado',
          content: { 'application/json': { schema: sessionSchema } },
        },
        '400': errorResponse('Body no válido'),
        '409': errorResponse('El email ya está registrado'),
      },
    },
  },
  '/login': {
    post: {
      tags: ['auth'],
      summary: 'Iniciar sesión',
      requestBody: jsonBody(loginSchema),
      responses: {
        '200': { description: 'OK', content: { 'application/json': { schema: sessionSchema } } },
        '400': errorResponse('Body no válido'),
        '401': errorResponse('Credenciales no válidas'),
      },
    },
  },
  '/refresh': {
    post: {
      tags: ['auth'],
      summary: 'Renovar tokens con el refresh token',
      requestBody: jsonBody(refreshSchema),
      responses: {
        '200': { description: 'OK', content: { 'application/json': { schema: tokenPairSchema } } },
        '400': errorResponse('Body no válido'),
        '401': errorResponse('Refresh token no válido'),
      },
    },
  },
}
