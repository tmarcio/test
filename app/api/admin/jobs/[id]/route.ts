import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-guard';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

type Params = { params: { id: string } };

const VALID = ['nova', 'em_analise', 'contactada', 'arquivada'];

export async function PATCH(req: Request, { params }: Params) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const body = (await req.json().catch(() => ({}))) as { status?: string };
  const status = VALID.includes(String(body.status || '')) ? String(body.status) : 'nova';
  const result = getDb().prepare('UPDATE jobs SET status = ? WHERE id = ?').run(status, params.id);
  if (!result.changes) return NextResponse.json({ error: 'Candidatura não encontrada.' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
