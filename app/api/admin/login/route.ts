import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, ADMIN_COOKIE_MAX_AGE, cookieOptions, createSessionToken, getAdminPassword } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { password?: string };
  if (!body.password || body.password !== getAdminPassword()) {
    return NextResponse.json({ error: 'Palavra-passe incorreta.' }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, createSessionToken(), {
    ...cookieOptions(),
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
  return res;
}
