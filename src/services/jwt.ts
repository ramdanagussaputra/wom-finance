import HmacSHA256 from 'crypto-js/hmac-sha256';
import EncBase64 from 'crypto-js/enc-base64';
import EncUtf8 from 'crypto-js/enc-utf8';
import { JWT_SECRET, JWT_TTL_SECONDS } from '@env';

const TTL = Number(JWT_TTL_SECONDS) || 3600;
const SECRET = JWT_SECRET || 'demo-secret';

function base64UrlEncode(str: string): string {
  const wordArray = EncUtf8.parse(str);
  return EncBase64.stringify(wordArray)
    .replace(/[=]+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((str.length + 3) % 4);
  return EncUtf8.stringify(EncBase64.parse(padded));
}

function sign(input: string): string {
  const sig = HmacSHA256(input, SECRET).toString(EncBase64);
  return sig.replace(/[=]+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

export type JwtPayload = { email: string; iat: number; exp: number };

export function signJwt(email: string): { token: string; payload: JwtPayload } {
  const header = { alg: 'HS256', typ: 'JWT' };
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + TTL;
  const payload: JwtPayload = { email, iat, exp };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(`${encodedHeader}.${encodedPayload}`);
  return { token: `${encodedHeader}.${encodedPayload}.${signature}`, payload };
}

export function verifyJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [h, p, s] = parts;
    const expected = sign(`${h}.${p}`);
    if (expected !== s) return null;
    const payload = JSON.parse(base64UrlDecode(p)) as JwtPayload;
    if (!payload.exp || payload.exp * 1000 <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
