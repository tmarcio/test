import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-guard';
import { getDb } from '@/lib/db';
import { getOrderById, updateOrderStatus } from '@/lib/orders';
import type { OrderStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';

type Params = { params: { id: string } };

const VALID: OrderStatus[] = ['pendente', 'confirmada', 'em_preparacao', 'pronta', 'em_entrega', 'entregue', 'cancelada'];

export async function PATCH(req: Request, { params }: Params) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const order = getOrderById(Number(params.id));
  if (!order) return NextResponse.json({ error: 'Encomenda não encontrada.' }, { status: 404 });
  const body = (await req.json().catch(() => ({}))) as { status?: OrderStatus; note?: string; courierId?: number | null };
  let status: OrderStatus = body.status || order.status;
  if (!VALID.includes(status)) status = order.status;

  let courierId: number | null | undefined = undefined;
  if (body.courierId !== undefined) {
    if (body.courierId === null) {
      courierId = null;
    } else {
      const courier = getDb().prepare('SELECT id FROM couriers WHERE id = ? AND active = 1').get(body.courierId);
      if (!courier) return NextResponse.json({ error: 'Estafeta inválido.' }, { status: 400 });
      courierId = Number(body.courierId);
      if (status === 'pendente' || status === 'confirmada') status = 'em_entrega';
    }
  }

  const updated = updateOrderStatus(order.id, status, { note: String(body.note || ''), courierId });
  return NextResponse.json(updated);
}
