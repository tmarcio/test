'use client';

import { Reveal } from '@/components/Reveal';
import { IconBike, IconCart, IconRoute, IconCheck } from '@/components/icons';
import { useCart } from '@/components/CartContext';

const steps = [
  {
    icon: <IconCart width={30} height={30} />,
    title: '1 · Monta o teu pedido',
    text: 'Escolhe refeições, pizzas e bebidas e adiciona ao carrinho.',
  },
  {
    icon: <IconRoute width={30} height={30} />,
    title: '2 · Escolhe como receber',
    text: 'Levanta no ponto de venda ou recebe em casa — a taxa aparece logo, segundo o município.',
  },
  {
    icon: <IconBike width={30} height={30} />,
    title: '3 · Rastreia a tua encomenda',
    text: 'Recebe uma referência única e acompanha o estado até chegar.',
  },
];

export function HowItWorks() {
  const { openCart } = useCart();
  return (
    <section className="section-pad bg-brand-cream">
      <div className="container-lg">
        <Reveal className="text-center max-w-2xl mx-auto">
          <p className="text-brand-red font-black uppercase tracking-[0.25em] text-sm">Como funciona</p>
          <h2 className="font-display font-black text-4xl md:text-5xl mt-3 text-brand-dark">
            Do carrinho à tua porta
          </h2>
        </Reveal>
        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 100}>
              <div className="card p-8 h-full text-center hover:-translate-y-1.5 hover:shadow-neon transition-all duration-300 group">
                <span className="mx-auto h-16 w-16 rounded-2xl bg-brand-red/10 grid place-items-center text-brand-red group-hover:bg-brand-red group-hover:text-white transition-all duration-300 rotate-3 group-hover:rotate-0">
                  {s.icon}
                </span>
                <h3 className="font-display font-black text-xl text-brand-dark mt-6">{s.title}</h3>
                <p className="text-brand-dark/55 mt-3 leading-relaxed text-sm">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-12 text-center">
          <button onClick={openCart} className="btn-primary">
            <IconCheck /> Começar agora
          </button>
        </Reveal>
      </div>
    </section>
  );
}
