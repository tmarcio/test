import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-guard';
import { getDb } from '@/lib/db';
import { rowToCourier } from '@/lib/serialize';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const rows = getDb().prepare('SELECT * FROM couriers ORDER BY name').all() as Record<string, unknown>[];
  return NextResponse.json(rows.map(rowToCourier));
}

export async function POST(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const body = await req.json().catch(() => ({}));
  const name = String(body.name || '').trim();
  if (!name) return NextResponse.json({ error: 'O nome do estafeta é obrigatório.' }, { status: 400 });
  const result = getDb()
    .prepare(
      'INSERT INTO couriers (name, phone, motorcycle, zone, available, rating, active) VALUES (?, ?, ?, ?, ?, ?, ?)',
    )
    .run(
      name,
      String(body.phone || ''),
      String(body.motorcycle || ''),
      String(body.zone || ''),
      body.available ? 1 : 0,
      Number(body.rating || 5),
      body.active ? 1 : 0,
    );
  const row = getDb().prepare('SELECT * FROM couriers WHERE id = ?').get(result.lastInsertRowid) as Record<string, unknown>;
  return NextResponse.json(rowToCourier(row), { status: 201 });
}
