import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { rowToPartner } from '@/lib/serialize';

export const dynamic = 'force-dynamic';

export async function GET() {
  const rows = getDb()
    .prepare('SELECT * FROM partners WHERE active = 1 ORDER BY sort, name')
    .all() as Record<string, unknown>[];
  return NextResponse.json(rows.map(rowToPartner));
}
