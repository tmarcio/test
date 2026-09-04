import { NextResponse } from 'next/server';
import { getOrderByRef } from '@/lib/orders';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ref = (searchParams.get('ref') || '').trim();
  if (!ref) return NextResponse.json({ error: 'Falta a referência.' }, { status: 400 });
  const order = getOrderByRef(ref);
  if (!order) return NextResponse.json({ error: 'Encomenda não encontrada.' }, { status: 404 });
  return NextResponse.json({ order });
}
