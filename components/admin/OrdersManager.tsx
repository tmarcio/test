'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Courier, Order, OrderStatus } from '@/lib/types';
import { ORDER_STATUS_LABELS } from '@/lib/types';
import { formatDateTime, formatKz } from '@/lib/format';
import { courierWhatsAppLink, orderWhatsAppLink } from '@/lib/whatsapp';
import { Badge, EmptyState } from '@/components/admin/ui';
import { IconCheck, IconWhatsApp } from '@/components/icons';

const FILTERS: (OrderStatus | 'todas')[] = ['todas', 'pendente', 'confirmada', 'em_preparacao', 'pronta', 'em_entrega', 'entregue', 'cancelada'];

const NEXT: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  pendente: { status: 'confirmada', label: 'Confirmar' },
  confirmada: { status: 'em_preparacao', label: 'Em preparação' },
  em_preparacao: { status: 'pronta', label: 'Marcar pronta' },
  pronta: { status: 'entregue', label: 'Entregue ✓' },
  em_entrega: { status: 'entregue', label: 'Concluir entrega' },
};

export function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [filter, setFilter] = useState<OrderStatus | 'todas'>('pendente');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    fetch(`/api/admin/orders${filter === 'todas' ? '' : `?status=${filter}`}`)
      .then((r) => r.json())
      .then((d: Order[]) => setOrders(d))
      .catch(() => undefined);
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    fetch('/api/admin/couriers')
      .then((r) => r.json())
      .then((d: Courier[]) => setCouriers(d))
      .catch(() => undefined);
  }, []);

  const patch = async (id: number, body: Record<string, unknown>) => {
    setBusy(true);
    try {
      await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      load();
    } finally {
      setBusy(false);
    }
  };

  const availableCouriers = couriers.filter((c) => c.active);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-3xl text-brand-dark">Encomendas</h1>
          <p className="text-brand-dark/55 mt-1">Confirma, prepara, atribui estafetas e conclui entregas.</p>
        </div>
        <button onClick={load} className="btn-dark !py-2 text-sm">
          Atualizar
        </button>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-black transition ${filter === f ? 'bg-brand-red text-white' : 'bg-white text-brand-dark/60 border border-brand-dark/10 hover:border-brand-red/40'}`}
          >
            {f === 'todas' ? 'Todas' : ORDER_STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="card">
          <EmptyState text="Nenhuma encomenda com este estado." />
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            const next = NEXT[o.status];
            const isOpen = expanded === o.id;
            return (
              <article key={o.id} className="card p-5">
                <button
                  className="w-full text-left flex flex-wrap items-center justify-between gap-3 cursor-pointer"
                  onClick={() => setExpanded(isOpen ? null : o.id)}
                >
                  <div className="min-w-0">
                    <p className="font-display font-black text-lg text-brand-dark">
                      {o.ref} <span className="text-sm font-bold text-brand-dark/50">— {o.customerName}</span>
                    </p>
                    <p className="text-xs text-brand-dark/50 mt-0.5">
                      {formatDateTime(o.createdAt)} · {o.items.reduce((a, i) => a + i.qty, 0)} itens ·{' '}
                      {o.deliveryType === 'delivery' ? `🛵 ${o.municipalityName}${o.bairro ? `, ${o.bairro}` : ''}` : '🏪 Levantamento'}
                      {o.courierName ? ` · Estafeta: ${o.courierName}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-brand-red">{formatKz(o.total)}</span>
                    <Badge tone={o.status === 'pendente' ? 'gold' : o.status === 'entregue' ? 'green' : o.status === 'cancelada' ? 'red' : 'gray'}>
                      {ORDER_STATUS_LABELS[o.status]}
                    </Badge>
                  </div>
                </button>

                {isOpen && (
                  <div className="mt-4 pt-4 border-t border-brand-dark/10 space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">
                      <div className="space-y-1.5 text-sm">
                        <p className="font-black text-brand-dark mb-1">Cliente</p>
                        <p>{o.customerName}</p>
                        <p>{o.customerPhone}</p>
                        {o.customerEmail && <p>{o.customerEmail}</p>}
                        <p className="text-brand-dark/50">{o.paymentMethod}</p>
                        {o.notes && <p className="text-brand-dark/60 italic">“{o.notes}”</p>}
                      </div>
                      <div className="text-sm space-y-1.5">
                        <p className="font-black text-brand-dark mb-1">Itens</p>
                        {o.items.map((i) => (
                          <p key={i.id} className="flex justify-between gap-3">
                            <span>{i.qty}× {i.name}</span>
                            <span className="font-bold">{formatKz(i.price * i.qty)}</span>
                          </p>
                        ))}
                        {o.deliveryType === 'delivery' && (
                          <p className="flex justify-between gap-3 border-t border-brand-dark/10 pt-1.5">
                            <span>Taxa de entrega</span>
                            <span className="font-bold">{formatKz(o.deliveryFee)}</span>
                          </p>
                        )}
                        <p className="flex justify-between gap-3 font-black">
                          <span>Total</span>
                          <span className="text-brand-red">{formatKz(o.total)}</span>
                        </p>
                        {o.deliveryType === 'delivery' && (
                          <p className="text-brand-dark/60">
                            Entrega: {o.municipalityName}
                            {o.bairro ? ` · Bairro: ${o.bairro}` : ''}
                            {o.rua ? ` · Rua: ${o.rua}` : ''}
                            {o.addressNotes ? ` · ${o.addressNotes}` : ''}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Ações de estado */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      {next && (
                        <button
                          onClick={() => void patch(o.id, { status: next.status })}
                          disabled={busy}
                          className="btn-primary !px-5 !py-2.5 text-sm disabled:opacity-50"
                        >
                          <IconCheck /> {next.label}
                        </button>
                      )}
                      {o.status !== 'cancelada' && (
                        <button
                          onClick={() => void patch(o.id, { status: 'cancelada', note: 'Cancelada pela equipa.' })}
                          disabled={busy}
                          className="btn-outline !px-5 !py-2.5 text-sm !border-brand-red/40 !text-brand-red disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                      )}
                      <a href={orderWhatsAppLink(o)} target="_blank" rel="noreferrer" className="btn-whatsapp !px-5 !py-2.5 text-sm">
                        <IconWhatsApp /> WhatsApp do cliente
                      </a>
                    </div>

                    {/* Atribuição de estafeta */}
                    {o.deliveryType === 'delivery' && (
                      <div className="rounded-2xl bg-brand-cream p-4 space-y-3">
                        <p className="font-black text-brand-dark text-sm">🛵 Atribuir estafeta disponível</p>
                        <div className="flex flex-wrap gap-2">
                          {availableCouriers.map((c) => (
                            <button
                              key={c.id}
                              onClick={() => void patch(o.id, { courierId: c.id, status: 'em_entrega', note: `Estafeta atribuído: ${c.name}.` })}
                              disabled={busy}
                              className={`rounded-full border-2 px-4 py-2 text-xs font-black transition disabled:opacity-50 ${
                                o.courierId === c.id
                                  ? 'border-brand-red bg-brand-red text-white'
                                  : 'border-brand-dark/15 bg-white text-brand-dark/70 hover:border-brand-red'
                              }`}
                            >
                              {c.name} {!c.available ? '(indisponível)' : ''}
                            </button>
                          ))}
                        </div>
                        {o.courierId && (
                          <a
                            href={courierWhatsAppLink(
                              couriers.find((c) => c.id === o.courierId) || { name: 'Estafeta', phone: '' } as Courier,
                              o.ref,
                              `🛵 Entrega: ${o.municipalityName}${o.bairro ? `, ${o.bairro}` : ''}${o.rua ? `, ${o.rua}` : ''} — Total ${formatKz(o.total)} (${o.paymentMethod})`,
                            )}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-whatsapp !px-4 !py-2 text-xs"
                          >
                            <IconWhatsApp /> Notificar estafeta
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
