import { NextResponse } from 'next/server';
import { isAdminRequest } from './admin-auth';

export function requireAdmin(req: Request): NextResponse | null {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }
  return null;
}
