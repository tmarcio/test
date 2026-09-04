'use client';

import { useEffect, useMemo, useState } from 'react';
import { useCart } from '@/components/CartContext';
import { formatKz } from '@/lib/format';
import type { Category, Product } from '@/lib/types';
import { IconPlus, IconMinus, IconSearch } from '@/components/icons';
import { Reveal } from '@/components/Reveal';

const TABS: { id: Category | 'todos'; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'refeicoes', label: 'Refeições' },
  { id: 'pizzas', label: 'Pizzas' },
  { id: 'bebidas', label: 'Bebidas' },
];

export function MenuSection({ compact = false }: { compact?: boolean }) {
  const { items, add, setQty } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Category | 'todos'>('todos');
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetch('/api/menu')
      .then((r) => r.json())
      .then((data: Product[]) => setProducts(data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (tab !== 'todos' && p.category !== tab) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [products, tab, query]);

  return (
    <section id="cardapio" className="section-pad relative bg-brand-creamDark/40 scroll-mt-24">
      <div className="container-lg">
        <Reveal className="text-center max-w-2xl mx-auto">
          <p className="text-brand-red font-black uppercase tracking-[0.25em] text-sm">O nosso cardápio</p>
          <h2 className="font-display font-black text-4xl md:text-5xl mt-3 text-brand-dark">
            Escolha o que apetecer
          </h2>
          <p className="mt-4 text-brand-dark/60 text-lg">
            Adicione ao carrinho, diga-nos o seu município e a taxa de entrega aparece logo. Simples assim.
          </p>
        </Reveal>

        <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex flex-wrap justify-center gap-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`chip ${tab === t.id ? 'bg-brand-red text-white shadow-neon' : 'bg-white text-brand-dark/70 border border-brand-dark/10 hover:border-brand-red/50'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <label className="relative w-full md:w-72">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/40">
              <IconSearch />
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Procurar prato, pizza ou bebida…"
              className="input !pl-11"
            />
          </label>
        </div>

        {loading ? (
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card h-80 animate-pulse bg-white/60" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="mt-14 text-center text-brand-dark/50 py-16">
            <p className="text-4xl mb-3">🍽️</p>
            <p className="font-bold">Nenhum item encontrado. Experimenta outra pesquisa.</p>
          </div>
        ) : (
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.map((p, idx) => {
              const inCart = items.find((i) => i.productId === p.id);
              return (
                <Reveal key={p.id} delay={Math.min(idx, 5) * 60}>
                  <article className="card group hover:-translate-y-1.5 hover:shadow-neon transition-all duration-300 h-full flex flex-col">
                    <div className="relative h-52 overflow-hidden bg-brand-dark">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.image}
                        alt={p.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {p.tags.length > 0 && (
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          {p.tags.slice(0, 2).map((t) => (
                            <span key={t} className="rounded-full bg-brand-gold text-brand-dark text-[11px] font-black px-3 py-1">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-display font-black text-lg text-brand-dark leading-tight">{p.name}</h3>
                        <span className="shrink-0 font-black text-brand-red whitespace-nowrap">{formatKz(p.price)}</span>
                      </div>
                      <p className="mt-2 text-sm text-brand-dark/55 leading-relaxed flex-1">{p.description}</p>
                      <div className="mt-4">
                        {inCart ? (
                          <div className="flex items-center justify-between rounded-full bg-brand-red text-white pl-2 pr-2 py-1.5">
                            <button
                              onClick={() => setQty(p.id, inCart.qty - 1)}
                              className="grid place-items-center w-9 h-9 rounded-full hover:bg-white/15"
                              aria-label="Diminuir"
                            >
                              <IconMinus width={18} height={18} />
                            </button>
                            <span className="font-black">{inCart.qty} no carrinho</span>
                            <button
                              onClick={() => setQty(p.id, inCart.qty + 1)}
                              className="grid place-items-center w-9 h-9 rounded-full hover:bg-white/15"
                              aria-label="Aumentar"
                            >
                              <IconPlus width={18} height={18} />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => add({ productId: p.id, name: p.name, price: p.price, image: p.image })} className="btn-dark w-full !py-3 text-sm">
                            <IconPlus width={18} height={18} /> Adicionar ao carrinho
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        )}

        {!compact && (
          <Reveal className="mt-14 text-center">
            <p className="text-brand-dark/60 mb-4">Não encontra o que procura? Fale connosco.</p>
            <a href="#trabalhe" className="btn-outline">
              Pedido personalizado no WhatsApp
            </a>
          </Reveal>
        )}
      </div>
    </section>
  );
}
