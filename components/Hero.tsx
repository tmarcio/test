'use client';

import { useCart } from '@/components/CartContext';
import { BRAND } from '@/lib/types';
import { waLink } from '@/lib/whatsapp';
import { IconBike, IconFlame, IconRoute, IconStar, IconWhatsApp, IconCheck } from '@/components/icons';

const miniStats = [
  { value: '15–50', label: 'min entrega média' },
  { value: '14', label: 'municípios cobertos' },
  { value: '4.9★', label: 'satisfação dos clientes' },
];

export function Hero() {
  const { openCart } = useCart();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-brand-dark hero-noise">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[560px] h-[560px] rounded-full bg-brand-red/30 blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[480px] h-[480px] rounded-full bg-brand-gold/20 blur-[130px]" />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-white/5 blur-[80px]" />
      </div>

      <div className="container-lg relative grid lg:grid-cols-[1.05fr_0.95fr] gap-14 items-center pt-32 pb-20 lg:pt-28">
        {/* Texto */}
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-gold/40 bg-brand-gold/10 text-brand-gold px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] mb-7 animate-fadeUp">
            <IconFlame width={16} height={16} /> Delivery de motorizada em Luanda
          </div>

          <h1 className="font-display font-black text-white text-5xl md:text-6xl xl:text-7xl leading-[1.02] tracking-tight">
            O sabor de <span className="text-gold-gradient">Angola</span>
            <br />
            chega até <span className="text-brand-red">si</span>.
          </h1>

          <p className="mt-6 text-lg md:text-xl text-white/70 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Refeições, pizzas e bebidas da <strong className="text-white">Aliado Food</strong> — escolha levantar no ponto de
            venda ou receber em casa, com taxa de entrega calculada automaticamente pelo seu município.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <a href="#cardapio" className="btn-primary text-lg w-full sm:w-auto">
              Explorar o cardápio <IconBike />
            </a>
            <a
              href={waLink(BRAND.whatsapp, `Olá ${BRAND.name}! Gostaria de fazer uma encomenda. 🍽️`)}
              target="_blank"
              rel="noreferrer"
              className="btn-whatsapp text-lg w-full sm:w-auto"
            >
              <IconWhatsApp /> Encomendar no WhatsApp
            </a>
          </div>

          <ul className="mt-8 flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 text-sm text-white/60">
            {['Rastreio por referência', 'Pagamento na entrega', 'Fidelidade ALIADO+'].map((t) => (
              <li key={t} className="inline-flex items-center gap-2">
                <IconCheck width={16} height={16} className="text-brand-gold" /> {t}
              </li>
            ))}
          </ul>

          <div className="mt-12 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0 border-t border-white/10 pt-8">
            {miniStats.map((s) => (
              <div key={s.label} className="text-center lg:text-left">
                <div className="font-display font-black text-2xl md:text-3xl text-white">{s.value}</div>
                <div className="text-xs text-white/50 mt-1 leading-snug">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Imagem */}
        <div className="relative hidden lg:block">
          <div className="relative mx-auto w-[420px] xl:w-[470px]">
            <div className="absolute -inset-6 rounded-[3rem] bg-gradient-to-br from-brand-red via-transparent to-brand-gold opacity-60 blur-2xl" />
            <div className="relative rounded-[3rem] overflow-hidden border border-white/10 shadow-card animate-floatSlow">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/hero-dish.jpg" alt="Pratos Aliado Food" className="w-full h-[520px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/70 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <p className="font-display font-black text-2xl">Feito hoje, servido quente.</p>
                <p className="text-white/70 text-sm">Ingredientes frescos · cozinha de casa</p>
              </div>
            </div>

            {/* Cartões flutuantes */}
            <div className="absolute -left-16 top-16 glass rounded-2xl px-4 py-3 flex items-center gap-3 animate-float shadow-neon">
              <span className="grid place-items-center w-11 h-11 rounded-xl bg-brand-red text-white">
                <IconBike />
              </span>
              <div>
                <p className="font-bold text-sm text-brand-dark">Entrega por motorizada</p>
                <p className="text-xs text-brand-dark/60">Estafetas Aliado dedicados</p>
              </div>
            </div>

            <div className="absolute -right-10 top-1/2 glass rounded-2xl px-4 py-3 flex items-center gap-3 animate-float [animation-delay:1.5s]">
              <span className="grid place-items-center w-11 h-11 rounded-xl bg-brand-gold text-brand-dark">
                <IconRoute />
              </span>
              <div>
                <p className="font-bold text-sm text-brand-dark">Taxa por município</p>
                <p className="text-xs text-brand-dark/60">Calculada em tempo real</p>
              </div>
            </div>

            <div className="absolute -bottom-8 left-10 glass rounded-2xl px-4 py-3 flex items-center gap-3 animate-float [animation-delay:0.8s]">
              <span className="grid place-items-center w-11 h-11 rounded-xl bg-[#25D366] text-white">
                <IconStar />
              </span>
              <div>
                <p className="font-bold text-sm text-brand-dark">4,9/5 satisfação</p>
                <p className="text-xs text-brand-dark/60">Clientes aliados</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Faixa decorativa */}
      <div className="absolute bottom-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand-red via-brand-gold to-brand-red" />
    </section>
  );
}
