import * as bcrypt from 'bcryptjs';

export async function hashPassword(password) {
  return await bcrypt.hash(password.trim(), 10);
}

export async function comparePassword(
  password: string,
  passwordToCompare,
): Promise<boolean> {
  return await bcrypt.compare(password.trim(), passwordToCompare);
}
