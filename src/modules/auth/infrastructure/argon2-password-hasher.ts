import { hash, verify } from '@node-rs/argon2'
import type { PasswordHasher } from '../domain/password-hasher'

export class Argon2PasswordHasher implements PasswordHasher {
  hash(plain: string): Promise<string> {
    return hash(plain)
  }

  verify(hashed: string, plain: string): Promise<boolean> {
    return verify(hashed, plain)
  }
}
