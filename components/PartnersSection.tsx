'use client';

import { useEffect, useState } from 'react';
import { BRAND, type Partner } from '@/lib/types';
import { partnerWhatsAppLink } from '@/lib/whatsapp';
import { Reveal } from '@/components/Reveal';
import { IconWhatsApp } from '@/components/icons';

export function PartnersSection() {
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    fetch('/api/partners')
      .then((r) => r.json())
      .then((d: Partner[]) => setPartners(d))
      .catch(() => setPartners([]));
  }, []);

  return (
    <section id="parceiros" className="section-pad bg-brand-dark relative overflow-hidden scroll-mt-24">
      <div className="absolute -top-32 right-0 w-96 h-96 rounded-full bg-brand-red/20 blur-[120px]" />
      <div className="container-lg relative">
        <Reveal className="text-center max-w-2xl mx-auto">
          <p className="text-brand-gold font-black uppercase tracking-[0.25em] text-sm">Quem caminha connosco</p>
          <h2 className="font-display font-black text-4xl md:text-5xl mt-3 text-white">Os nossos parceiros</h2>
          <p className="mt-4 text-white/60 text-lg">
            Marcas que tornam cada encomenda uma experiência — produtos, bebidas e entregas de confiança.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-5">
          {partners.map((p, idx) => (
            <Reveal key={p.id} delay={idx * 80}>
              {p.url ? (
                <a href={p.url} target="_blank" rel="noreferrer" className="group block">
                  <PartnerCard partner={p} />
                </a>
              ) : (
                <PartnerCard partner={p} />
              )}
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-14 text-center">
          <p className="text-white/60 mb-5">És uma marca e queres crescer com a Aliado Food?</p>
          <a
            href={partnerWhatsAppLink({ name: 'a tua empresa' } as Partner)}
            target="_blank"
            rel="noreferrer"
            className="btn-gold"
          >
            <IconWhatsApp className="!text-brand-dark" /> Tornar-me parceiro
          </a>
        </Reveal>
      </div>
    </section>
  );
}

function PartnerCard({ partner }: { partner: Partner }) {
  return (
    <div className="card !rounded-3xl p-6 text-center bg-white/95 hover:bg-white transition group-hover:-translate-y-1.5 h-full flex flex-col items-center justify-center">
      <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-md mb-4 bg-brand-cream">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={partner.image} alt={partner.name} loading="lazy" className="w-full h-full object-cover" />
      </div>
      <h3 className="font-display font-black text-brand-dark leading-tight">{partner.name}</h3>
      <p className="text-sm text-brand-dark/55 mt-2 leading-relaxed">{partner.description}</p>
    </div>
  );
}
