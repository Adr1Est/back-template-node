import cors from 'cors'
import express, { type Express, type Router } from 'express'
import helmet from 'helmet'
import type { Logger } from 'pino'
import { pinoHttp } from 'pino-http'
import { errorHandler } from './error-handler'

export interface ServerOptions {
  logger: Logger
  corsOrigin: string | string[]
  routes: { path: string; router: Router }[]
}

export function createServer({ logger, corsOrigin, routes }: ServerOptions): Express {
  const app = express()

  app.use(helmet())
  app.use(cors({ origin: corsOrigin }))
  app.use(express.json({ limit: '1mb' }))
  app.use(pinoHttp({ logger }))

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  for (const { path, router } of routes) {
    app.use(path, router)
  }

  app.use((_req, res) => {
    res.status(404).json({ error: 'not_found' })
  })
  app.use(errorHandler(logger))

  return app
}
