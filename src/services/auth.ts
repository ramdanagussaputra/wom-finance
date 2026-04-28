import { signJwt, verifyJwt, JwtPayload } from './jwt';
import { tokenStorage } from './storage';

export type AuthResult = { token: string; payload: JwtPayload };

export async function login(email: string): Promise<AuthResult> {
  const { token, payload } = signJwt(email.trim().toLowerCase());
  await tokenStorage.set(token);
  return { token, payload };
}

export async function logout(): Promise<void> {
  await tokenStorage.clear();
}

export async function restoreSession(): Promise<AuthResult | null> {
  const token = await tokenStorage.get();
  if (!token) return null;
  const payload = verifyJwt(token);
  if (!payload) {
    await tokenStorage.clear();
    return null;
  }
  return { token, payload };
}
