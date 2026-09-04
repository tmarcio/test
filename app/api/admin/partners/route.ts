import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-guard';
import { getDb } from '@/lib/db';
import { rowToPartner } from '@/lib/serialize';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const rows = getDb().prepare('SELECT * FROM partners ORDER BY sort, name').all() as Record<string, unknown>[];
  return NextResponse.json(rows.map(rowToPartner));
}

export async function POST(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const body = await req.json().catch(() => ({}));
  const name = String(body.name || '').trim();
  if (!name) return NextResponse.json({ error: 'O nome do parceiro é obrigatório.' }, { status: 400 });
  const result = getDb()
    .prepare('INSERT INTO partners (name, description, image, url, active, sort) VALUES (?, ?, ?, ?, ?, ?)')
    .run(name, String(body.description || ''), String(body.image || ''), String(body.url || ''), body.active ? 1 : 0, Number(body.sort || 0));
  const row = getDb().prepare('SELECT * FROM partners WHERE id = ?').get(result.lastInsertRowid) as Record<string, unknown>;
  return NextResponse.json(rowToPartner(row), { status: 201 });
}
