import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-guard';
import { getDb } from '@/lib/db';
import { rowToProduct } from '@/lib/serialize';
import type { Category } from '@/lib/types';

export const dynamic = 'force-dynamic';

const CATEGORIES: Category[] = ['refeicoes', 'pizzas', 'bebidas'];

export async function GET(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const rows = getDb().prepare('SELECT * FROM products ORDER BY sort, name').all() as Record<string, unknown>[];
  return NextResponse.json(rows.map(rowToProduct));
}

export async function POST(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const body = await req.json().catch(() => ({}));
  const name = String(body.name || '').trim();
  const price = Number(body.price);
  const category = String(body.category || '') as Category;
  if (!name || !(price > 0) || !CATEGORIES.includes(category)) {
    return NextResponse.json({ error: 'Dados inválidos: nome, preço e categoria são obrigatórios.' }, { status: 400 });
  }
  const id = String(body.id || 'produto-' + Date.now().toString(36));
  getDb()
    .prepare(
      `INSERT INTO products (id, name, description, price, category, image, tags, available, featured, sort)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      id,
      name,
      String(body.description || ''),
      price,
      category,
      String(body.image || ''),
      JSON.stringify(Array.isArray(body.tags) ? body.tags : []),
      body.available ? 1 : 0,
      body.featured ? 1 : 0,
      Number(body.sort || 0),
    );
  const row = getDb().prepare('SELECT * FROM products WHERE id = ?').get(id) as Record<string, unknown>;
  return NextResponse.json(rowToProduct(row), { status: 201 });
}
