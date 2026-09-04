'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Order } from '@/lib/types';
import { ORDER_FLOW, ORDER_STATUS_LABELS } from '@/lib/types';
import { formatDateTime, formatKz } from '@/lib/format';
import { orderWhatsAppLink } from '@/lib/whatsapp';
import { IconCheck, IconPhone, IconWhatsApp } from '@/components/icons';
import { Reveal } from '@/components/Reveal';

export default function TrackPage() {
  return (
    <>
      <section className="relative bg-brand-dark pt-36 pb-16 hero-noise overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-brand-gold/20 blur-[120px]" />
        <div className="container-lg relative text-center">
          <p className="text-brand-gold font-black uppercase tracking-[0.3em] text-sm">Acompanha a tua encomenda</p>
          <h1 className="font-display font-black text-white text-4xl md:text-6xl mt-4">Rastrear encomenda</h1>
          <p className="text-white/60 mt-4 max-w-xl mx-auto">
            Insere a referência <span className="font-black text-brand-gold">AF-XXXXXX</span> recebida ao selar o teu pedido.
          </p>
        </div>
      </section>
      <section className="section-pad bg-brand-cream">
        <div className="container-lg max-w-3xl">
          <Suspense fallback={<p className="text-center">A carregar…</p>}>
            <TrackForm />
          </Suspense>
        </div>
      </section>
    </>
  );
}

function TrackForm() {
  const params = useSearchParams();
  const [ref, setRef] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initial = params.get('ref');
    if (initial) {
      setRef(initial);
      void search(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const search = async (value?: string) => {
    const code = (value ?? ref).trim().toUpperCase();
    if (!code) {
      setError('Escreve a referência da encomenda.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/orders/track?ref=${encodeURIComponent(code)}`);
      const data = (await res.json()) as { order?: Order; error?: string };
      if (!res.ok || !data.order) throw new Error(data.error || 'Encomenda não encontrada.');
      setOrder(data.order);
    } catch (e) {
      setOrder(null);
      setError(e instanceof Error ? e.message : 'Erro ao procurar a encomenda.');
    } finally {
      setLoading(false);
    }
  };

  const activeIndex = order ? ORDER_FLOW.indexOf(order.status) : -1;
  const done = order?.status === 'entregue';
  const cancelled = order?.status === 'cancelada';

  return (
    <div className="space-y-6">
      <div className="card p-6 md:p-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void search();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            placeholder="AF-XXXXXX"
            className="input uppercase tracking-widest font-black text-center sm:text-left"
            autoComplete="off"
          />
          <button type="submit" disabled={loading} className="btn-primary shrink-0 disabled:opacity-60">
            {loading ? 'A procurar…' : 'Rastrear'}
          </button>
        </form>
        {error && <p className="text-brand-red font-bold text-sm mt-4">{error}</p>}
      </div>

      {order && (
        <Reveal className="card p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-brand-dark/50 font-bold">Referência</p>
              <p className="font-display font-black text-3xl text-brand-dark">{order.ref}</p>
            </div>
            <span
              className={`self-start rounded-full px-5 py-2 font-black text-sm ${
                done
                  ? 'bg-[#25D366]/15 text-[#128C4B]'
                  : cancelled
                    ? 'bg-brand-red/15 text-brand-red'
                    : 'bg-brand-gold/20 text-[#9B6600]'
              }`}
            >
              {cancelled ? 'Cancelada' : done ? 'Entregue ✓' : ORDER_STATUS_LABELS[order.status]}
            </span>
          </div>

          {/* Timeline */}
          {!cancelled ? (
            <div className="mt-8">
              {ORDER_FLOW.map((s, i) => {
                const isDone = done || i <= activeIndex;
                const isCurrent = i === activeIndex;
                return (
                  <div key={s} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span
                        className={`timeline-dot ${isDone ? 'bg-brand-red border-brand-red text-white grid place-items-center' : 'border-brand-dark/20 bg-white'}`}
                      >
                        {isDone && <IconCheck width={12} height={12} className="text-white" />}
                      </span>
                      {i < ORDER_FLOW.length - 1 && (
                        <span className={`w-1 flex-1 min-h-8 ${i < activeIndex || done ? 'bg-brand-red' : 'bg-brand-dark/15'}`} />
                      )}
                    </div>
                    <div className="pb-7">
                      <p className={`font-black ${isCurrent || done ? 'text-brand-dark' : 'text-brand-dark/40'}`}>
                        {ORDER_STATUS_LABELS[s]}
                      </p>
                      <p className="text-xs text-brand-dark/45 mt-0.5">
                        {isDone
                          ? order.events.find((e) => e.status === s)?.createdAt
                            ? formatDateTime(order.events.find((e) => e.status === s)!.createdAt)
                            : s === 'pendente'
                              ? formatDateTime(order.createdAt)
                              : '—'
                          : isCurrent && !done
                            ? 'Em curso…'
                            : 'Próximo passo'}
                      </p>
                      {isCurrent && !done && order.status !== 'pendente' && (
                        <p className="text-xs font-bold text-brand-red mt-1">{order.events.at(-1)?.note}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-6 text-brand-red font-bold bg-brand-red/10 rounded-xl px-4 py-3">
              Esta encomenda foi cancelada. Contacta-nos para mais informações.
            </p>
          )}

          {/* Resumo */}
          <div className="mt-4 rounded-2xl bg-brand-cream p-5 space-y-2 text-sm">
            {order.items.map((i) => (
              <div key={i.id} className="flex justify-between">
                <span className="font-semibold">{i.qty}× {i.name}</span>
                <span className="font-bold">{formatKz(i.price * i.qty)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-brand-dark/10 pt-2">
              <span>Subtotal</span>
              <span>{formatKz(order.subtotal)}</span>
            </div>
            {order.deliveryType === 'delivery' && (
              <div className="flex justify-between">
                <span>Entrega ({order.municipalityName})</span>
                <span>{formatKz(order.deliveryFee)}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-base pt-2">
              <span>Total</span>
              <span className="text-brand-red">{formatKz(order.total)}</span>
            </div>
          </div>

          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <a href={orderWhatsAppLink(order)} target="_blank" rel="noreferrer" className="btn-whatsapp flex-1">
              <IconWhatsApp /> Falar com a Aliado Food
            </a>
            <span className="btn-outline flex-1 !cursor-default">
              <IconPhone /> {order.customerPhone}
            </span>
          </div>
        </Reveal>
      )}
    </div>
  );
}
