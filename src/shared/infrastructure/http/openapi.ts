import { z } from 'zod'
import {
  createDocument,
  type ZodOpenApiPathsObject,
  type ZodOpenApiResponseObject,
} from 'zod-openapi'

// type y no interface: InfoObject exige una firma de índice para las extensiones x-*
export type ApiInfo = {
  title: string
  version: string
}

export const errorSchema = z
  .object({
    error: z.string().meta({ example: 'validation' }),
    message: z.string().optional(),
    issues: z.array(z.unknown()).optional(),
  })
  .meta({ id: 'Error' })

export function errorResponse(description: string): ZodOpenApiResponseObject {
  return { description, content: { 'application/json': { schema: errorSchema } } }
}

/** Seguridad de una operación protegida con requireAuth. */
export const bearerAuth = [{ bearerAuth: [] }]

/** Une los paths de cada módulo (relativos a su prefijo) en un documento OpenAPI 3.1. */
export function buildOpenApiDocument(
  info: ApiInfo,
  routes: { path: string; docs?: ZodOpenApiPathsObject }[],
): ReturnType<typeof createDocument> {
  const paths: ZodOpenApiPathsObject = {
    '/health': {
      get: {
        tags: ['health'],
        summary: 'Health check',
        responses: {
          '200': {
            description: 'OK',
            content: { 'application/json': { schema: z.object({ status: z.literal('ok') }) } },
          },
        },
      },
    },
  }

  for (const { path, docs } of routes) {
    for (const [subPath, item] of Object.entries(docs ?? {})) {
      paths[`${path}${subPath}`] = item
    }
  }

  return createDocument({
    openapi: '3.1.0',
    info,
    paths,
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
  })
}
