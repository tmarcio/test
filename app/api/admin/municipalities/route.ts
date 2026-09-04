import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-guard';
import { getDb, deliveryFeeByDistance } from '@/lib/db';
import { rowToMunicipality } from '@/lib/serialize';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const rows = getDb()
    .prepare('SELECT * FROM municipalities ORDER BY sort, name')
    .all() as Record<string, unknown>[];
  return NextResponse.json(rows.map((r) => {
    const m = rowToMunicipality(r);
    return { ...m, fee: deliveryFeeByDistance(m) };
  }));
}

export async function POST(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const body = await req.json().catch(() => ({}));
  const name = String(body.name || '').trim();
  if (!name) return NextResponse.json({ error: 'O nome do município é obrigatório.' }, { status: 400 });
  const result = getDb()
    .prepare(
      `INSERT INTO municipalities (name, province, base_fee, per_km, distance_km, est_minutes, adjustment, active, sort)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      name,
      String(body.province || 'Luanda'),
      Number(body.baseFee || 292.5),
      Number(body.perKm || 51.3),
      Number(body.distanceKm || 2.5),
      Number(body.estMinutes || 20),
      Number(body.adjustment || 0),
      body.active ? 1 : 0,
      Number(body.sort || 0),
    );
  const row = getDb()
    .prepare('SELECT * FROM municipalities WHERE id = ?')
    .get(result.lastInsertRowid) as Record<string, unknown>;
  return NextResponse.json(rowToMunicipality(row), { status: 201 });
}
