'use client';

import { useEffect, useState } from 'react';
import type { Activity } from '@/lib/types';
import { formatDate } from '@/lib/format';
import { Reveal } from '@/components/Reveal';
import { IconMapPin, IconClock } from '@/components/icons';

export function ActivitiesSection() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    fetch('/api/activities')
      .then((r) => r.json())
      .then((d: Activity[]) => setActivities(d))
      .catch(() => setActivities([]));
  }, []);

  return (
    <section id="eventos" className="section-pad bg-brand-cream scroll-mt-24">
      <div className="container-lg">
        <Reveal className="text-center max-w-2xl mx-auto">
          <p className="text-brand-red font-black uppercase tracking-[0.25em] text-sm">Vida Aliado</p>
          <h2 className="font-display font-black text-4xl md:text-5xl mt-3 text-brand-dark">
            Atividades & eventos
          </h2>
          <p className="mt-4 text-brand-dark/60 text-lg">
            Noites temáticas, festivais e momentos para toda a família. Participa e fica a par das novidades.
          </p>
        </Reveal>

        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {activities.map((a, idx) => (
            <Reveal key={a.id} delay={idx * 90}>
              <article className="card group hover:-translate-y-1.5 hover:shadow-neon transition-all duration-300 h-full flex flex-col">
                <div className="h-48 overflow-hidden relative bg-brand-dark">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.image} alt={a.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-display font-black text-xl text-brand-dark">{a.title}</h3>
                  <p className="mt-2 text-sm text-brand-dark/55 leading-relaxed flex-1">{a.description}</p>
                  <div className="mt-4 pt-4 border-t border-brand-dark/10 space-y-1.5 text-sm text-brand-dark/60">
                    {a.eventDate && (
                      <p className="flex items-center gap-2">
                        <IconClock width={16} height={16} className="text-brand-red" /> {formatDate(a.eventDate)}
                      </p>
                    )}
                    <p className="flex items-center gap-2">
                      <IconMapPin width={16} height={16} className="text-brand-red" /> {a.location || 'Ponto de venda Aliado Food'}
                    </p>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 text-center">
          <a
            href="https://www.instagram.com/aliadofood/"
            target="_blank"
            rel="noreferrer"
            className="btn-dark"
          >
            Segue @aliadofood para as novidades
          </a>
        </Reveal>
      </div>
    </section>
  );
}
