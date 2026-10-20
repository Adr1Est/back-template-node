import { z } from 'zod'
import type { ZodOpenApiPathsObject } from 'zod-openapi'
import { bearerAuth, errorResponse } from '../../../../shared/infrastructure/http/openapi'

export const userSchema = z
  .object({
    id: z.uuid(),
    email: z.email(),
    name: z.string(),
    createdAt: z.iso.datetime(),
  })
  .meta({ id: 'User' })

export const userDocs: ZodOpenApiPathsObject = {
  '/me': {
    get: {
      tags: ['users'],
      summary: 'Usuario autenticado',
      security: bearerAuth,
      responses: {
        '200': { description: 'OK', content: { 'application/json': { schema: userSchema } } },
        '401': errorResponse('Token ausente o no válido'),
        '404': errorResponse('El usuario ya no existe'),
      },
    },
  },
}
