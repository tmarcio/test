import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { rowToActivity } from '@/lib/serialize';

export const dynamic = 'force-dynamic';

export async function GET() {
  const rows = getDb()
    .prepare('SELECT * FROM activities WHERE active = 1 ORDER BY sort, id DESC')
    .all() as Record<string, unknown>[];
  return NextResponse.json(rows.map(rowToActivity));
}
