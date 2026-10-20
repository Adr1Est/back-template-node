import cors from 'cors'
import express, { type Express, type Router } from 'express'
import helmet from 'helmet'
import type { Logger } from 'pino'
import { pinoHttp } from 'pino-http'
import swaggerUi from 'swagger-ui-express'
import type { ZodOpenApiPathsObject } from 'zod-openapi'
import { errorHandler } from './error-handler'
import { type ApiInfo, buildOpenApiDocument } from './openapi'

export interface ServerOptions {
  logger: Logger
  corsOrigin: string | string[]
  /** `docs`: paths OpenAPI del router, relativos a `path`. */
  routes: { path: string; router: Router; docs?: ZodOpenApiPathsObject }[]
  /** Si se indica, sirve Swagger UI en /docs y el documento en /docs/openapi.json. */
  apiDocs?: ApiInfo
}

export function createServer({ logger, corsOrigin, routes, apiDocs }: ServerOptions): Express {
  const app = express()

  app.use(helmet())
  app.use(cors({ origin: corsOrigin }))
  app.use(express.json({ limit: '1mb' }))
  app.use(pinoHttp({ logger }))

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  if (apiDocs) {
    const document = buildOpenApiDocument(apiDocs, routes)
    app.get('/docs/openapi.json', (_req, res) => {
      res.json(document)
    })
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(document))
  }

  for (const { path, router } of routes) {
    app.use(path, router)
  }

  app.use((_req, res) => {
    res.status(404).json({ error: 'not_found' })
  })
  app.use(errorHandler(logger))

  return app
}
