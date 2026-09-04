import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-guard';
import { getDb } from '@/lib/db';
import { rowToCourier } from '@/lib/serialize';

export const dynamic = 'force-dynamic';

type Params = { params: { id: string } };

export async function PUT(req: Request, { params }: Params) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const exists = getDb().prepare('SELECT id FROM couriers WHERE id = ?').get(params.id);
  if (!exists) return NextResponse.json({ error: 'Estafeta não encontrado.' }, { status: 404 });
  const body = await req.json().catch(() => ({}));
  getDb()
    .prepare(
      'UPDATE couriers SET name = ?, phone = ?, motorcycle = ?, zone = ?, available = ?, rating = ?, active = ? WHERE id = ?',
    )
    .run(
      String(body.name || ''),
      String(body.phone || ''),
      String(body.motorcycle || ''),
      String(body.zone || ''),
      body.available ? 1 : 0,
      Number(body.rating || 5),
      body.active ? 1 : 0,
      params.id,
    );
  const row = getDb().prepare('SELECT * FROM couriers WHERE id = ?').get(params.id) as Record<string, unknown>;
  return NextResponse.json(rowToCourier(row));
}

export async function DELETE(req: Request, { params }: Params) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  getDb().prepare('DELETE FROM couriers WHERE id = ?').run(params.id);
  return NextResponse.json({ ok: true });
}
