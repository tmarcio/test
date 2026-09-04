import { NextResponse } from 'next/server';
import { getDb, deliveryFeeByDistance } from '@/lib/db';
import { MUNICIPALITY_TABLE } from '@/lib/catalog';
import { rowToMunicipality } from '@/lib/serialize';

export const dynamic = 'force-dynamic';

export async function GET() {
  const rows = getDb()
    .prepare('SELECT * FROM municipalities WHERE active = 1 ORDER BY sort, name')
    .all() as Record<string, unknown>[];
  const municipalities = rows.map((r) => {
    const m = rowToMunicipality(r);
    return { ...m, fee: deliveryFeeByDistance(m) };
  });
  return NextResponse.json({ municipalities, table: MUNICIPALITY_TABLE });
}
