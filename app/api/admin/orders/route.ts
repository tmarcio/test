import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-guard';
import { listOrders } from '@/lib/orders';
import type { OrderStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';

const VALID: OrderStatus[] = ['pendente', 'confirmada', 'em_preparacao', 'pronta', 'em_entrega', 'entregue', 'cancelada'];

export async function GET(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const { searchParams } = new URL(req.url);
  const status = (searchParams.get('status') || 'todas') as OrderStatus | 'todas';
  const orders = listOrders(VALID.includes(status as OrderStatus) ? (status as OrderStatus) : 'todas');
  return NextResponse.json(orders);
}
