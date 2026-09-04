'use client';

import { useEffect, useMemo, useState } from 'react';
import { useCart } from '@/components/CartContext';
import { BRAND, type Order } from '@/lib/types';
import { formatKz } from '@/lib/format';
import { orderWhatsAppLink, waLink } from '@/lib/whatsapp';
import {
  IconCart,
  IconCheck,
  IconChevronRight,
  IconChevronDown,
  IconMinus,
  IconPhone,
  IconPlus,
  IconRoute,
  IconTrash,
  IconWhatsApp,
  IconX,
} from '@/components/icons';

interface MunicipalityOption {
  id: number;
  name: string;
  fee: number;
  estMinutes: number;
}

const PAYMENT_METHODS = [
  'Dinheiro na entrega / levantamento',
  'Multicaixa Express',
  'Transferência bancária',
];

type Step = 'cart' | 'entrega' | 'dados' | 'revisao' | 'sucesso';

export function CartDrawer() {
  const { items, subtotal, count, isOpen, closeCart, setQty, remove, clear } = useCart();
  const [step, setStep] = useState<Step>('cart');
  const [municipalities, setMunicipalities] = useState<MunicipalityOption[]>([]);
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [munId, setMunId] = useState<number | ''>('');
  const [bairro, setBairro] = useState('');
  const [rua, setRua] = useState('');
  const [enderecoNotas, setEnderecoNotas] = useState('');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [pagamento, setPagamento] = useState(PAYMENT_METHODS[0]);
  const [notas, setNotas] = useState('');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/municipalities')
        .then((r) => r.json())
        .then((d) => setMunicipalities(d.municipalities || []))
        .catch(() => setMunicipalities([]));
    }
  }, [isOpen]);

  const selectedMun = useMemo(
    () => municipalities.find((m) => m.id === munId) || null,
    [municipalities, munId],
  );

  const closeAndReset = () => {
    closeCart();
    setTimeout(() => {
      setStep('cart');
      setError('');
      setLastOrder(null);
    }, 300);
  };

  const cartWaText = useMemo(() => {
    const lines: string[] = [`Olá ${BRAND.name}! 🍽️ Quero encomendar:`];
    for (const i of items) lines.push(`• ${i.qty}× ${i.name} — ${formatKz(i.price * i.qty)}`);
    lines.push('', `Subtotal: ${formatKz(subtotal)}`, 'Pode confirmar a disponibilidade? Obrigado!');
    return lines.join('\n');
  }, [items, subtotal]);

  const canContinue = (): boolean => {
    if (deliveryType === 'delivery' && !selectedMun) {
      setError('Seleciona o município para calcular a taxa de entrega.');
      return false;
    }
    if (deliveryType === 'pickup') {
      // levantamento não precisa de município
    }
    return true;
  };

  const submit = async () => {
    setError('');
    if (!nome.trim() || telefone.replace(/\D/g, '').length < 9) {
      const msg = !nome.trim() ? 'Indica o teu nome.' : 'Indica um telefone válido (ex.: 929 809 889).';
      setError(msg);
      return;
    }
    if (deliveryType === 'delivery' && !selectedMun) {
      setError('Seleciona o município de entrega.');
      return;
    }
    setPlacing(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: nome,
          customerPhone: telefone,
          customerEmail: email,
          deliveryType,
          municipalityId: deliveryType === 'delivery' ? munId : null,
          bairro,
          rua,
          addressNotes: enderecoNotas,
          paymentMethod: pagamento,
          notes: notas,
          items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
        }),
      });
      const data = (await res.json()) as { ok?: boolean; order?: Order; error?: string };
      if (!res.ok || !data.order) throw new Error(data.error || 'Erro ao criar a encomenda.');
      setLastOrder(data.order);
      setStep('sucesso');
      clear();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao criar a encomenda.');
    } finally {
      setPlacing(false);
    }
  };

  const municipalitiesSorted = [...municipalities].sort((a, b) => a.fee - b.fee || a.name.localeCompare(b.name));

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={closeAndReset}
        aria-hidden
      />
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-2xl transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        aria-label="Carrinho de compras"
      >
        {/* Cabeçalho */}
        <div className="px-6 py-5 bg-brand-dark text-white flex items-center justify-between">
          <div>
            <h2 className="font-display font-black text-xl flex items-center gap-2">
              <IconCart /> {step === 'sucesso' ? 'Encomenda criada' : 'A tua encomenda'}
            </h2>
            <p className="text-white/60 text-sm mt-0.5">
              {step === 'sucesso' ? lastOrder?.ref : `${count} ${count === 1 ? 'item' : 'itens'} · ${formatKz(subtotal)}`}
            </p>
          </div>
          <button onClick={closeAndReset} className="h-10 w-10 grid place-items-center rounded-full hover:bg-white/10" aria-label="Fechar">
            <IconX />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin">
          {/* PASSO 1 — ITENS */}
          {step === 'cart' && (
            <div className="space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-20 text-brand-dark/50">
                  <p className="text-5xl mb-4">🛒</p>
                  <p className="font-bold text-brand-dark">O carrinho está vazio.</p>
                  <p className="text-sm mt-1">Adiciona pratos, pizzas e bebidas do cardápio.</p>
                  <button onClick={closeAndReset} className="btn-primary mt-6">
                    Ver o cardápio
                  </button>
                </div>
              ) : (
                <>
                  <ul className="space-y-4">
                    {items.map((i) => (
                      <li key={i.productId} className="flex gap-4 items-center bg-brand-cream rounded-2xl p-3 border border-brand-dark/5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={i.image} alt={i.name} className="w-16 h-16 rounded-xl object-cover bg-brand-dark/5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-brand-dark leading-snug truncate">{i.name}</p>
                          <p className="text-brand-red font-black text-sm mt-0.5">{formatKz(i.price * i.qty)}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <button onClick={() => setQty(i.productId, i.qty - 1)} className="h-8 w-8 grid place-items-center rounded-full bg-brand-dark text-white hover:bg-brand-red" aria-label="Diminuir">
                              <IconMinus width={14} height={14} />
                            </button>
                            <span className="w-8 text-center font-black">{i.qty}</span>
                            <button onClick={() => setQty(i.productId, i.qty + 1)} className="h-8 w-8 grid place-items-center rounded-full bg-brand-dark text-white hover:bg-brand-red" aria-label="Aumentar">
                              <IconPlus width={14} height={14} />
                            </button>
                          </div>
                        </div>
                        <button onClick={() => remove(i.productId)} className="h-9 w-9 grid place-items-center rounded-full text-brand-dark/40 hover:text-brand-red hover:bg-brand-red/10" aria-label="Remover">
                          <IconTrash width={18} height={18} />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between font-black text-brand-dark text-lg pt-4 border-t border-brand-dark/10">
                    <span>Subtotal</span>
                    <span className="text-brand-red">{formatKz(subtotal)}</span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* PASSO 2 — ENTREGA OU LEVANTAMENTO */}
          {step === 'entrega' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setDeliveryType('pickup')}
                  className={`rounded-2xl border-2 p-4 text-left transition ${deliveryType === 'pickup' ? 'border-brand-red bg-brand-red/5' : 'border-brand-dark/10 hover:border-brand-dark/30'}`}
                >
                  <span className="text-2xl">🏪</span>
                  <p className="font-black text-brand-dark mt-2">Levantar</p>
                  <p className="text-xs text-brand-dark/55 mt-1">No ponto de venda da Aliado Food</p>
                </button>
                <button
                  onClick={() => setDeliveryType('delivery')}
                  className={`rounded-2xl border-2 p-4 text-left transition ${deliveryType === 'delivery' ? 'border-brand-red bg-brand-red/5' : 'border-brand-dark/10 hover:border-brand-dark/30'}`}
                >
                  <span className="text-2xl">🛵</span>
                  <p className="font-black text-brand-dark mt-2">Receber em casa</p>
                  <p className="text-xs text-brand-dark/55 mt-1">Entrega por motorizada — taxa por município</p>
                </button>
              </div>

              {deliveryType === 'delivery' && (
                <div className="space-y-4">
                  <div>
                    <label className="label" htmlFor="municipio">Município *</label>
                    <div className="relative">
                      <select
                        id="municipio"
                        value={munId}
                        onChange={(e) => setMunId(e.target.value ? Number(e.target.value) : '')}
                        className="input appearance-none pr-10"
                      >
                        <option value="">— Seleciona o município —</option>
                        {municipalitiesSorted.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} · {formatKz(m.fee)}
                          </option>
                        ))}
                      </select>
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-brand-dark/40">
                        <IconChevronDown />
                      </span>
                    </div>
                    <p className="text-xs text-brand-dark/50 mt-2 flex items-center gap-1.5">
                      <IconRoute width={14} height={14} /> Taxa de referência para entrega por motorizada, em Luanda.
                    </p>
                  </div>

                  {selectedMun && (
                    <div className="rounded-2xl bg-brand-gold/15 border border-brand-gold/40 p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-brand-dark">Taxa de entrega</span>
                        <span className="font-display font-black text-2xl text-brand-red">{formatKz(selectedMun.fee)}</span>
                      </div>
                      <p className="text-sm text-brand-dark/60 mt-1">
                        Chegada estimada: {selectedMun.estMinutes} a {selectedMun.estMinutes + 15} min
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label" htmlFor="bairro">Bairro (opcional)</label>
                      <input id="bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} className="input" placeholder="ex.: Maianga" />
                    </div>
                    <div>
                      <label className="label" htmlFor="rua">Rua (opcional)</label>
                      <input id="rua" value={rua} onChange={(e) => setRua(e.target.value)} className="input" placeholder="ex.: Rua 12" />
                    </div>
                  </div>
                  <div>
                    <label className="label" htmlFor="end-obs">Ponto de referência (opcional)</label>
                    <input id="end-obs" value={enderecoNotas} onChange={(e) => setEnderecoNotas(e.target.value)} className="input" placeholder="ex.: Portão azul, ao lado da escola" />
                  </div>
                  <p className="text-xs text-brand-dark/45">
                    Bairro e rua são opcionais — apenas o município define a taxa de entrega.
                  </p>
                </div>
              )}

              {deliveryType === 'pickup' && (
                <div className="rounded-2xl bg-brand-cream p-4 text-sm text-brand-dark/70">
                  🏪 <strong>Ponto de venda Aliado Food</strong> — Luanda. O nosso atendimento confirma a disponibilidade
                  dos teus itens via WhatsApp.
                </div>
              )}
            </div>
          )}

          {/* PASSO 3 — DADOS DO CLIENTE */}
          {step === 'dados' && (
            <div className="space-y-4">
              <div>
                <label className="label" htmlFor="nome">Nome completo *</label>
                <input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} className="input" placeholder="O teu nome" autoComplete="name" />
              </div>
              <div>
                <label className="label" htmlFor="telefone">Telefone / WhatsApp *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/40"><IconPhone /></span>
                  <input
                    id="telefone"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    className="input !pl-11"
                    placeholder="929 809 889"
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </div>
                <p className="text-xs text-brand-dark/50 mt-1.5">Usado para confirmar a encomenda e o rastreio.</p>
              </div>
              <div>
                <label className="label" htmlFor="email">E-mail (opcional)</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="nome@email.com" autoComplete="email" />
              </div>
              <div>
                <label className="label" htmlFor="pagamento">Método de pagamento</label>
                <div className="relative">
                  <select id="pagamento" value={pagamento} onChange={(e) => setPagamento(e.target.value)} className="input appearance-none pr-10">
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-brand-dark/40">
                    <IconChevronDown />
                  </span>
                </div>
              </div>
              <div>
                <label className="label" htmlFor="notas">Notas para a equipa (opcional)</label>
                <textarea id="notas" value={notas} onChange={(e) => setNotas(e.target.value)} rows={3} className="input resize-none" placeholder="ex.: sem cebola, molho à parte…" />
              </div>
            </div>
          )}

          {/* PASSO 4 — REVISÃO */}
          {step === 'revisao' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-brand-cream p-4 space-y-2">
                {items.map((i) => (
                  <div key={i.productId} className="flex justify-between text-sm">
                    <span className="font-semibold">{i.qty}× {i.name}</span>
                    <span className="font-black">{formatKz(i.price * i.qty)}</span>
                  </div>
                ))}
                <div className="border-t border-brand-dark/10 pt-2 flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatKz(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Entrega</span>
                  <span>{deliveryType === 'delivery' ? formatKz(selectedMun?.fee || 0) : 'Gratuita (levantamento)'}</span>
                </div>
                <div className="flex justify-between font-black text-lg pt-2 border-t border-brand-dark/10">
                  <span>Total</span>
                  <span className="text-brand-red">{formatKz(subtotal + (deliveryType === 'delivery' ? selectedMun?.fee || 0 : 0))}</span>
                </div>
              </div>
              <dl className="text-sm space-y-2">
                <div className="flex justify-between"><dt className="text-brand-dark/55">Cliente</dt><dd className="font-bold">{nome}</dd></div>
                <div className="flex justify-between"><dt className="text-brand-dark/55">Telefone</dt><dd className="font-bold">{telefone}</dd></div>
                <div className="flex justify-between"><dt className="text-brand-dark/55">Método</dt><dd className="font-bold">{pagamento}</dd></div>
                <div className="flex justify-between"><dt className="text-brand-dark/55">Tipo</dt>
                  <dd className="font-bold">{deliveryType === 'delivery' ? `Entrega — ${selectedMun?.name}` : 'Levantamento no ponto de venda'}</dd>
                </div>
                {bairro || rua ? (
                  <div className="flex justify-between gap-4"><dt className="text-brand-dark/55 shrink-0">Endereço</dt><dd className="font-bold text-right">{[bairro, rua].filter(Boolean).join(', ')}</dd></div>
                ) : null}
              </dl>
            </div>
          )}

          {/* PASSO 5 — SUCESSO */}
          {step === 'sucesso' && lastOrder && (
            <div className="text-center py-8">
              <div className="mx-auto w-20 h-20 rounded-full bg-[#25D366]/15 grid place-items-center text-[#1eb457] animate-pulseGlow">
                <IconCheck width={40} height={40} />
              </div>
              <h3 className="font-display font-black text-3xl mt-6 text-brand-dark">Pedido registado!</h3>
              <p className="mt-3 text-brand-dark/60">Guarda a tua referência para rastrear a encomenda:</p>
              <div className="mt-5 inline-block rounded-2xl bg-brand-dark text-brand-gold font-display font-black text-3xl tracking-[0.15em] px-8 py-4">
                {lastOrder.ref}
              </div>
              <p className="mt-4 text-sm text-brand-dark/55">
                Envia-nos a encomenda pelo WhatsApp para um atendimento mais célere — ou acompanha o estado em{" "}
                <a href={`/rastreio?ref=${encodeURIComponent(lastOrder.ref)}`} className="font-bold text-brand-red underline">
                  Rastrear
                </a>.
              </p>
              <div className="mt-7 flex flex-col gap-3">
                <a href={orderWhatsAppLink(lastOrder)} target="_blank" rel="noreferrer" className="btn-whatsapp">
                  <IconWhatsApp /> Confirmar pelo WhatsApp
                </a>
                <a href={`/rastreio?ref=${encodeURIComponent(lastOrder.ref)}`} className="btn-outline">
                  Rastrear encomenda
                </a>
                <button onClick={closeAndReset} className="btn-dark">
                  Continuar a explorar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé de ações */}
        {step !== 'sucesso' && items.length > 0 && (
          <div className="border-t border-brand-dark/10 px-6 py-5 bg-white space-y-3">
            {error && <p className="text-sm font-bold text-brand-red bg-brand-red/10 rounded-xl px-4 py-2.5">{error}</p>}
            {step === 'cart' && (
              <div className="flex flex-col gap-2.5">
                <button onClick={() => { setError(''); setStep('entrega'); }} className="btn-primary w-full">
                  Continuar <IconChevronRight />
                </button>
                <a href={waLink(BRAND.whatsapp, cartWaText)} target="_blank" rel="noreferrer" className="btn-whatsapp w-full">
                  <IconWhatsApp /> Pedir já pelo WhatsApp
                </a>
              </div>
            )}
            {step === 'entrega' && (
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between font-black">
                  <span>Total parcial</span>
                  <span className="text-brand-red">{formatKz(subtotal + (deliveryType === 'delivery' ? selectedMun?.fee || 0 : 0))}</span>
                </div>
                <div className="flex gap-2.5">
                  <button onClick={() => setStep('cart')} className="btn-outline flex-1 !px-4">Voltar</button>
                  <button onClick={() => { if (canContinue()) { setError(''); setStep('dados'); } }} className="btn-primary flex-1">
                    Os meus dados
                  </button>
                </div>
              </div>
            )}
            {step === 'dados' && (
              <div className="flex gap-2.5">
                <button onClick={() => setStep('entrega')} className="btn-outline flex-1 !px-4">Voltar</button>
                <button onClick={() => { setError(''); setStep('revisao'); }} className="btn-primary flex-1">
                  Rever pedido
                </button>
              </div>
            )}
            {step === 'revisao' && (
              <div className="flex gap-2.5">
                <button onClick={() => setStep('dados')} className="btn-outline flex-1 !px-4" disabled={placing}>Voltar</button>
                <button onClick={submit} disabled={placing} className="btn-gold flex-1">
                  {placing ? 'A registar…' : 'Selar pedido ✓'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Rodapé quando vazio */}
        {step === 'cart' && items.length === 0 && (
          <div className="border-t border-brand-dark/10 px-6 py-4 text-center text-sm text-brand-dark/50">
            Entrega em Luanda · taxa calculada por município
          </div>
        )}
      </aside>
    </>
  );
}
