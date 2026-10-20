export type DomainErrorKind = 'validation' | 'unauthorized' | 'not_found' | 'conflict'

export abstract class DomainError extends Error {
  abstract readonly kind: DomainErrorKind

  constructor(message: string) {
    super(message)
    this.name = new.target.name
  }
}

export class ValidationError extends DomainError {
  readonly kind = 'validation'
}

export class UnauthorizedError extends DomainError {
  readonly kind = 'unauthorized'
}

export class NotFoundError extends DomainError {
  readonly kind = 'not_found'
}

export class ConflictError extends DomainError {
  readonly kind = 'conflict'
}
