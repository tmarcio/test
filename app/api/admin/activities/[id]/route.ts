import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-guard';
import { getDb } from '@/lib/db';
import { rowToActivity } from '@/lib/serialize';

export const dynamic = 'force-dynamic';

type Params = { params: { id: string } };

export async function PUT(req: Request, { params }: Params) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const exists = getDb().prepare('SELECT id FROM activities WHERE id = ?').get(params.id);
  if (!exists) return NextResponse.json({ error: 'Atividade não encontrada.' }, { status: 404 });
  const body = await req.json().catch(() => ({}));
  getDb()
    .prepare(
      'UPDATE activities SET title = ?, description = ?, image = ?, event_date = ?, location = ?, active = ?, sort = ? WHERE id = ?',
    )
    .run(
      String(body.title || ''),
      String(body.description || ''),
      String(body.image || ''),
      String(body.eventDate || ''),
      String(body.location || ''),
      body.active ? 1 : 0,
      Number(body.sort || 0),
      params.id,
    );
  const row = getDb().prepare('SELECT * FROM activities WHERE id = ?').get(params.id) as Record<string, unknown>;
  return NextResponse.json(rowToActivity(row));
}

export async function DELETE(req: Request, { params }: Params) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  getDb().prepare('DELETE FROM activities WHERE id = ?').run(params.id);
  return NextResponse.json({ ok: true });
}
