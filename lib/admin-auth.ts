import crypto from 'node:crypto';

const SECRET =
  process.env.ADMIN_SECRET || process.env.NODE_ENV === 'production' ? 'change-me-in-production' : 'aliado-local-dev-secret';
const COOKIE = 'af_admin_session';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || 'aliado2024';
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
}

export function createSessionToken(): string {
  const payload = JSON.stringify({ exp: Date.now() + MAX_AGE * 1000, nonce: crypto.randomBytes(8).toString('hex') });
  return `${Buffer.from(payload).toString('base64url')}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [payloadB64, sig] = token.split('.');
  if (!payloadB64 || !sig) return false;
  const expected = sign(Buffer.from(payloadB64, 'base64url').toString('utf8'));
  if (expected !== sig) return false;
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8')) as { exp: number };
    return payload.exp > Date.now();
  } catch {
    return false;
  }
}

export function isAdminRequest(req: Request): boolean {
  const cookieHeader = req.headers.get('cookie') || '';
  const token = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1);
  return verifySessionToken(token);
}

export const ADMIN_COOKIE = COOKIE;
export const ADMIN_COOKIE_MAX_AGE = MAX_AGE;

export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  };
}
