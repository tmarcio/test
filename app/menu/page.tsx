import type { Metadata } from 'next';
import { MenuSection } from '@/components/MenuSection';
import { BRAND } from '@/lib/types';
import { waLink } from '@/lib/whatsapp';
import { IconWhatsApp } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Cardápio',
  description: 'Cardápio completo da Aliado Food — refeições, pizzas e bebidas com entrega em Luanda.',
};

export default function MenuPage() {
  return (
    <>
      <section className="relative bg-brand-dark pt-36 pb-20 hero-noise overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-red/30 blur-[120px]" />
        <div className="container-lg relative text-center">
          <p className="text-brand-gold font-black uppercase tracking-[0.3em] text-sm">Cardápio completo</p>
          <h1 className="font-display font-black text-white text-4xl md:text-6xl mt-4">
            O que apetece <span className="text-gold-gradient">hoje</span>?
          </h1>
          <p className="text-white/60 mt-4 max-w-xl mx-auto">
            Adiciona ao carrinho, escolhe levantamento ou entrega e selamos o pedido — com taxa de entrega calculada pelo
            município.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row justify-center gap-3">
            <a
              href={waLink(BRAND.whatsapp, `Olá ${BRAND.name}! Preciso de ajuda com o cardápio.`)}
              target="_blank"
              rel="noreferrer"
              className="btn-whatsapp"
            >
              <IconWhatsApp /> Pedir por WhatsApp
            </a>
          </div>
        </div>
      </section>
      <MenuSection compact />
    </>
  );
}
