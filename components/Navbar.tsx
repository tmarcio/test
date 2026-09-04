'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCart } from '@/components/CartContext';
import { BRAND } from '@/lib/types';
import { IconCart, IconPhone, IconWhatsApp } from '@/components/icons';
import { waLink } from '@/lib/whatsapp';

const LINKS = [
  { href: '/', label: 'Início' },
  { href: '/#cardapio', label: 'Cardápio' },
  { href: '/#parceiros', label: 'Parceiros' },
  { href: '/#eventos', label: 'Atividades' },
  { href: '/#trabalhe', label: 'Trabalhe Connosco' },
  { href: '/rastreio', label: 'Rastrear' },
];

export function Navbar() {
  const { count, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-brand-dark/95 backdrop-blur-xl shadow-lg py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="container-lg flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3" onClick={() => setMenuOpen(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Aliado Food" className="h-11 w-11 rounded-2xl shadow-neon" />
          <span className="hidden sm:block leading-tight">
            <span className="block font-display font-black text-xl text-white tracking-tight">
              ALIADO <span className="text-brand-gold">FOOD</span>
            </span>
            <span className="block text-[11px] uppercase tracking-[0.25em] text-brand-gold/80">Seu aliado na fome.</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-semibold text-white/80 hover:text-brand-gold transition">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <a
            href={waLink(BRAND.whatsapp, `Olá ${BRAND.name}! Gostaria de fazer uma encomenda.`)}
            target="_blank"
            rel="noreferrer"
            className="hidden md:inline-flex btn-whatsapp !px-5 !py-2.5 text-sm"
            aria-label="Pedir pelo WhatsApp"
          >
            <IconWhatsApp /> Pedir agora
          </a>
          <button
            onClick={openCart}
            className="relative inline-flex items-center justify-center h-11 w-11 rounded-full bg-brand-gold text-brand-dark hover:bg-brand-goldLight transition shadow-neon"
            aria-label="Abrir carrinho"
          >
            <IconCart />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-brand-red text-white text-[11px] font-black grid place-items-center animation-pulseGlow">
                {count}
              </span>
            )}
          </button>
          <button
            className="lg:hidden inline-flex items-center justify-center h-11 w-11 rounded-full bg-white/10 text-white"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden bg-brand-dark/98 border-t border-white/10 mt-3">
          <nav className="container-lg py-4 flex flex-col gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="py-3 px-2 rounded-xl text-white/85 font-semibold hover:bg-white/5 hover:text-brand-gold"
              >
                {l.label}
              </Link>
            ))}
            <a
              href={waLink(BRAND.whatsapp, `Olá ${BRAND.name}! Gostaria de fazer uma encomenda.`)}
              target="_blank"
              rel="noreferrer"
              className="btn-whatsapp mt-3"
            >
              <IconWhatsApp /> Pedir pelo WhatsApp
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
