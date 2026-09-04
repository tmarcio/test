import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-guard';
import { getDb } from '@/lib/db';
import { rowToMunicipality } from '@/lib/serialize';

export const dynamic = 'force-dynamic';

type Params = { params: { id: string } };

export async function PUT(req: Request, { params }: Params) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const exists = getDb().prepare('SELECT id FROM municipalities WHERE id = ?').get(params.id);
  if (!exists) return NextResponse.json({ error: 'Município não encontrado.' }, { status: 404 });
  const body = await req.json().catch(() => ({}));
  getDb()
    .prepare(
      `UPDATE municipalities SET name = ?, province = ?, base_fee = ?, per_km = ?, distance_km = ?, est_minutes = ?, adjustment = ?, active = ?, sort = ? WHERE id = ?`,
    )
    .run(
      String(body.name || ''),
      String(body.province || 'Luanda'),
      Number(body.baseFee || 292.5),
      Number(body.perKm || 51.3),
      Number(body.distanceKm || 2.5),
      Number(body.estMinutes || 20),
      Number(body.adjustment || 0),
      body.active ? 1 : 0,
      Number(body.sort || 0),
      params.id,
    );
  const row = getDb().prepare('SELECT * FROM municipalities WHERE id = ?').get(params.id) as Record<string, unknown>;
  return NextResponse.json(rowToMunicipality(row));
}

export async function DELETE(req: Request, { params }: Params) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  getDb().prepare('DELETE FROM municipalities WHERE id = ?').run(params.id);
  return NextResponse.json({ ok: true });
}
