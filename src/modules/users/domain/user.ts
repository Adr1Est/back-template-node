import { ValidationError } from '../../../shared/domain/errors'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface UserProps {
  id: string
  email: string
  name: string
  passwordHash: string
  createdAt: Date
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export class User {
  private constructor(private readonly props: UserProps) {}

  static create(input: Omit<UserProps, 'createdAt'>): User {
    const email = normalizeEmail(input.email)
    if (!EMAIL_REGEX.test(email)) throw new ValidationError('Invalid email')

    const name = input.name.trim()
    if (name.length === 0) throw new ValidationError('Name is required')

    return new User({ ...input, email, name, createdAt: new Date() })
  }

  static fromPersistence(props: UserProps): User {
    return new User(props)
  }

  get id(): string {
    return this.props.id
  }

  get email(): string {
    return this.props.email
  }

  get name(): string {
    return this.props.name
  }

  get passwordHash(): string {
    return this.props.passwordHash
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  toPrimitives(): UserProps {
    return { ...this.props }
  }
}
