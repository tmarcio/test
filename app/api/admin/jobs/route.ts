import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-guard';
import { getDb } from '@/lib/db';
import { rowToJob } from '@/lib/serialize';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const rows = getDb().prepare('SELECT * FROM jobs ORDER BY id DESC').all() as Record<string, unknown>[];
  return NextResponse.json(rows.map(rowToJob));
}
