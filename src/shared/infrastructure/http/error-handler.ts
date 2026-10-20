import type { ErrorRequestHandler } from 'express'
import type { Logger } from 'pino'
import { ZodError } from 'zod'
import { DomainError, type DomainErrorKind } from '../../domain/errors'

const STATUS_BY_KIND: Record<DomainErrorKind, number> = {
  validation: 400,
  unauthorized: 401,
  not_found: 404,
  conflict: 409,
}

export function errorHandler(logger: Logger): ErrorRequestHandler {
  return (err, _req, res, _next) => {
    if (err instanceof ZodError) {
      res.status(400).json({ error: 'validation', issues: err.issues })
      return
    }

    if (err instanceof DomainError) {
      res.status(STATUS_BY_KIND[err.kind]).json({ error: err.kind, message: err.message })
      return
    }

    // Errores de body-parser (JSON mal formado, payload demasiado grande…)
    const { status, message } = (err ?? {}) as { status?: unknown; message?: unknown }
    if (typeof status === 'number' && status < 500) {
      res.status(status).json({ error: 'bad_request', message })
      return
    }

    logger.error({ err }, 'Unhandled error')
    res.status(500).json({ error: 'internal_error' })
  }
}
