import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { rowToProduct } from '@/lib/serialize';

export const dynamic = 'force-dynamic';

export async function GET() {
  const rows = getDb().prepare('SELECT * FROM products ORDER BY sort, name').all() as Record<string, unknown>[];
  return NextResponse.json(rows.map(rowToProduct));
}
