import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-guard';
import { getDb } from '@/lib/db';
import { rowToPartner } from '@/lib/serialize';

export const dynamic = 'force-dynamic';

type Params = { params: { id: string } };

export async function PUT(req: Request, { params }: Params) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const exists = getDb().prepare('SELECT id FROM partners WHERE id = ?').get(params.id);
  if (!exists) return NextResponse.json({ error: 'Parceiro não encontrado.' }, { status: 404 });
  const body = await req.json().catch(() => ({}));
  getDb()
    .prepare('UPDATE partners SET name = ?, description = ?, image = ?, url = ?, active = ?, sort = ? WHERE id = ?')
    .run(
      String(body.name || ''),
      String(body.description || ''),
      String(body.image || ''),
      String(body.url || ''),
      body.active ? 1 : 0,
      Number(body.sort || 0),
      params.id,
    );
  const row = getDb().prepare('SELECT * FROM partners WHERE id = ?').get(params.id) as Record<string, unknown>;
  return NextResponse.json(rowToPartner(row));
}

export async function DELETE(req: Request, { params }: Params) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  getDb().prepare('DELETE FROM partners WHERE id = ?').run(params.id);
  return NextResponse.json({ ok: true });
}
