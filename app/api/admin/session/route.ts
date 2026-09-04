import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  return NextResponse.json({ authenticated: isAdminRequest(req) });
}
