import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-guard';
import { listOrders, orderStats } from '@/lib/orders';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const stats = orderStats();
  const recent = listOrders().slice(0, 8);
  return NextResponse.json({ stats, recent });
}
