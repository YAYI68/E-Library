import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

/**
 * Hash a plain-text password
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(plainPassword, salt);
}

/**
 * Compare plain password with hashed password
 */
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}
