import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-guard';
import { getDb } from '@/lib/db';
import { rowToActivity } from '@/lib/serialize';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const rows = getDb().prepare('SELECT * FROM activities ORDER BY sort, id DESC').all() as Record<string, unknown>[];
  return NextResponse.json(rows.map(rowToActivity));
}

export async function POST(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const body = await req.json().catch(() => ({}));
  const title = String(body.title || '').trim();
  if (!title) return NextResponse.json({ error: 'O título da atividade é obrigatório.' }, { status: 400 });
  const result = getDb()
    .prepare(
      'INSERT INTO activities (title, description, image, event_date, location, active, sort) VALUES (?, ?, ?, ?, ?, ?, ?)',
    )
    .run(
      title,
      String(body.description || ''),
      String(body.image || ''),
      String(body.eventDate || ''),
      String(body.location || ''),
      body.active ? 1 : 0,
      Number(body.sort || 0),
    );
  const row = getDb().prepare('SELECT * FROM activities WHERE id = ?').get(result.lastInsertRowid) as Record<string, unknown>;
  return NextResponse.json(rowToActivity(row), { status: 201 });
}
