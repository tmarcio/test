import Link from 'next/link';
import { BRAND } from '@/lib/types';
import { IconFacebook, IconInstagram, IconMail, IconPhone, IconWhatsApp } from '@/components/icons';
import { waLink } from '@/lib/whatsapp';

const links = [
  { href: '/', label: 'Início' },
  { href: '/#cardapio', label: 'Cardápio' },
  { href: '/#parceiros', label: 'Parceiros' },
  { href: '/#eventos', label: 'Atividades' },
  { href: '/#trabalhe', label: 'Trabalhe connosco' },
  { href: '/rastreio', label: 'Rastrear encomenda' },
];

export function Footer() {
  return (
    <footer className="bg-brand-dark text-white">
      {/* Programa de fidelidade */}
      <div className="bg-gradient-to-r from-brand-red to-brand-redDark">
        <div className="container-lg py-8 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4 text-center md:text-left">
            <span className="text-4xl">🎁</span>
            <div>
              <p className="font-display font-black text-2xl">Programa de Fidelidade ALIADO+</p>
              <p className="text-white/80 text-sm mt-1">Pontos, descontos e ofertas exclusivas para clientes fiéis.</p>
            </div>
          </div>
          <a
            href={BRAND.loyaltyUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-gold shrink-0"
            aria-label={`Programa de fidelidade ${BRAND.loyaltyName}`}
          >
            Adere ao {BRAND.loyaltyName} →
          </a>
        </div>
      </div>

      <div className="container-lg py-16 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Aliado Food" className="h-12 w-12 rounded-2xl" />
            <span className="font-display font-black text-2xl">
              ALIADO <span className="text-brand-gold">FOOD</span>
            </span>
          </div>
          <p className="mt-5 text-white/60 text-sm leading-relaxed">
            Refeições, pizzas e bebidas com sabor de casa. Entrega por motorizada em Luanda e atendimento rápido pelo
            WhatsApp.
          </p>
          <div className="mt-6 flex gap-3">
            <a href={BRAND.instagramUrl} target="_blank" rel="noreferrer" className="h-11 w-11 grid place-items-center rounded-full bg-white/10 hover:bg-brand-gold hover:text-brand-dark transition" aria-label="Instagram">
              <IconInstagram />
            </a>
            <a href={BRAND.facebookUrl} target="_blank" rel="noreferrer" className="h-11 w-11 grid place-items-center rounded-full bg-white/10 hover:bg-brand-gold hover:text-brand-dark transition" aria-label="Facebook">
              <IconFacebook />
            </a>
            <a href={waLink(BRAND.whatsapp, `Olá ${BRAND.name}!`)} target="_blank" rel="noreferrer" className="h-11 w-11 grid place-items-center rounded-full bg-white/10 hover:bg-[#25D366] transition" aria-label="WhatsApp">
              <IconWhatsApp />
            </a>
            <a href={`mailto:${BRAND.email}`} className="h-11 w-11 grid place-items-center rounded-full bg-white/10 hover:bg-brand-gold hover:text-brand-dark transition" aria-label="E-mail">
              <IconMail />
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-display font-black text-lg text-brand-gold mb-5">Navegação</h3>
          <ul className="space-y-3 text-white/70 text-sm">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-brand-gold transition">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display font-black text-lg text-brand-gold mb-5">Contactos oficiais</h3>
          <ul className="space-y-4 text-sm text-white/70">
            <li>
              <a href={waLink(BRAND.whatsapp, `Olá ${BRAND.name}!`)} target="_blank" rel="noreferrer" className="flex items-start gap-3 hover:text-brand-gold transition">
                <IconPhone className="mt-0.5 text-brand-gold" /> Telefone & WhatsApp: {BRAND.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${BRAND.email}`} className="flex items-start gap-3 hover:text-brand-gold transition">
                <IconMail className="mt-0.5 text-brand-gold" /> {BRAND.email}
              </a>
            </li>
            <li>
              <a href={BRAND.instagramUrl} target="_blank" rel="noreferrer" className="flex items-start gap-3 hover:text-brand-gold transition">
                <IconInstagram className="mt-0.5 text-brand-gold" /> @{BRAND.instagram}
              </a>
            </li>
            <li>
              <a href={BRAND.facebookUrl} target="_blank" rel="noreferrer" className="flex items-start gap-3 hover:text-brand-gold transition">
                <IconFacebook className="mt-0.5 text-brand-gold" /> {BRAND.facebook}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display font-black text-lg text-brand-gold mb-5">Horário</h3>
          <ul className="space-y-2 text-sm text-white/70">
            <li className="flex justify-between"><span>Segunda – Sexta</span><span className="font-bold text-white">08h00 – 22h00</span></li>
            <li className="flex justify-between"><span>Sábado</span><span className="font-bold text-white">09h00 – 23h00</span></li>
            <li className="flex justify-between"><span>Domingo</span><span className="font-bold text-white">10h00 – 21h00</span></li>
          </ul>
          <p className="mt-6 text-xs text-white/40 leading-relaxed">
            Entregas em toda a província de Luanda. Taxa de entrega calculada por município com base na tabela Yango
            (entrega por motorizada).
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-lg py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>© {new Date().getFullYear()} {BRAND.name} · Todos os direitos reservados.</p>
          <p>Feito com ❤️ em Angola 🇦🇴 · <Link href="/admin" className="hover:text-brand-gold">Área da equipa</Link></p>
        </div>
      </div>
    </footer>
  );
}
