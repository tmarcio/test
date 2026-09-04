import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-guard';
import { getDb } from '@/lib/db';
import { rowToProduct } from '@/lib/serialize';

export const dynamic = 'force-dynamic';

type Params = { params: { id: string } };

export async function PUT(req: Request, { params }: Params) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const { id } = params;
  const exists = getDb().prepare('SELECT id FROM products WHERE id = ?').get(id);
  if (!exists) return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
  const body = await req.json().catch(() => ({}));
  getDb()
    .prepare(
      `UPDATE products SET name = ?, description = ?, price = ?, category = ?, image = ?, tags = ?, available = ?, featured = ?, sort = ? WHERE id = ?`,
    )
    .run(
      String(body.name || ''),
      String(body.description || ''),
      Number(body.price || 0),
      String(body.category || 'refeicoes'),
      String(body.image || ''),
      JSON.stringify(Array.isArray(body.tags) ? body.tags : []),
      body.available ? 1 : 0,
      body.featured ? 1 : 0,
      Number(body.sort || 0),
      id,
    );
  const row = getDb().prepare('SELECT * FROM products WHERE id = ?').get(id) as Record<string, unknown>;
  return NextResponse.json(rowToProduct(row));
}

export async function DELETE(req: Request, { params }: Params) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  getDb().prepare('DELETE FROM products WHERE id = ?').run(params.id);
  return NextResponse.json({ ok: true });
}
