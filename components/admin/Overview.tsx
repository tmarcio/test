'use client';

import { useEffect, useState } from 'react';
import type { Order } from '@/lib/types';
import { ORDER_STATUS_LABELS } from '@/lib/types';
import { formatDateTime, formatKz } from '@/lib/format';
import { Badge, EmptyState } from '@/components/admin/ui';

interface Stats {
  total: number;
  today: number;
  revenue: number;
  pending: number;
  couriers: number;
}

export function Overview({ goTo }: { goTo: (t: 'encomendas') => void }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Order[]>([]);

  useEffect(() => {
    fetch('/api/admin/overview')
      .then((r) => r.json())
      .then((d: { stats: Stats; recent: Order[] }) => {
        setStats(d.stats);
        setRecent(d.recent);
      })
      .catch(() => undefined);
  }, []);

  if (!stats) return <p className="text-brand-dark/50 font-bold">A carregar…</p>;

  const cards = [
    { label: 'Encomendas hoje', value: String(stats.today), tone: 'text-brand-red' },
    { label: 'Pendentes de confirmação', value: String(stats.pending), tone: 'text-[#9B6600]' },
    { label: 'Receita (não canceladas)', value: formatKz(stats.revenue), tone: 'text-[#128C4B]' },
    { label: 'Estafetas disponíveis', value: String(stats.couriers), tone: 'text-brand-red' },
    { label: 'Total histórico', value: String(stats.total), tone: 'text-brand-dark' },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display font-black text-3xl text-brand-dark">Resumo</h1>
        <p className="text-brand-dark/55 mt-1">Visão geral da operação Aliado Food.</p>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <p className="text-xs uppercase tracking-wider font-bold text-brand-dark/45">{c.label}</p>
            <p className={`font-display font-black text-2xl mt-2 ${c.tone}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-black text-xl text-brand-dark">Últimas encomendas</h2>
          <button onClick={() => goTo('encomendas')} className="text-sm font-bold text-brand-red hover:underline">
            Ver todas →
          </button>
        </div>
        {recent.length === 0 ? (
          <EmptyState text="Ainda não há encomendas." />
        ) : (
          <ul className="divide-y divide-brand-dark/5">
            {recent.map((o) => (
              <li key={o.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="font-black text-brand-dark">
                    {o.ref} <span className="font-semibold text-brand-dark/50">· {o.customerName}</span>
                  </p>
                  <p className="text-xs text-brand-dark/50 mt-0.5">
                    {formatDateTime(o.createdAt)} · {o.items.reduce((a, i) => a + i.qty, 0)} itens ·{' '}
                    {o.deliveryType === 'delivery' ? `Entrega (${o.municipalityName})` : 'Levantamento'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-black text-brand-red">{formatKz(o.total)}</span>
                  <Badge tone={o.status === 'pendente' ? 'gold' : o.status === 'entregue' ? 'green' : 'gray'}>
                    {ORDER_STATUS_LABELS[o.status]}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
