'use client';

import { useCallback, useEffect, useState } from 'react';
import type { JobApplication } from '@/lib/types';
import { JOB_STATUS_LABELS } from '@/lib/types';
import { formatDateTime } from '@/lib/format';
import { BRAND } from '@/lib/types';
import { Badge, EmptyState } from '@/components/admin/ui';
import { IconWhatsApp } from '@/components/icons';
import { waLink } from '@/lib/whatsapp';

const STATUSES: JobApplication['status'][] = ['nova', 'em_analise', 'contactada', 'arquivada'];

export function JobsManager() {
  const [jobs, setJobs] = useState<JobApplication[]>([]);

  const load = useCallback(() => {
    fetch('/api/admin/jobs')
      .then((r) => r.json())
      .then((d: JobApplication[]) => setJobs(d))
      .catch(() => undefined);
  }, []);

  useEffect(() => load(), [load]);

  const setStatus = async (job: JobApplication, status: JobApplication['status']) => {
    await fetch(`/api/admin/jobs/${job.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    load();
  };

  const tone = (s: JobApplication['status']) =>
    s === 'nova' ? 'gold' : s === 'contactada' ? 'green' : s === 'em_analise' ? 'gray' : 'red';

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display font-black text-3xl text-brand-dark">Candidaturas</h1>
        <p className="text-brand-dark/55 mt-1">
          Candidaturas recebidas pelo site — também enviadas para {BRAND.email} (requer SMTP configurado).
        </p>
      </header>

      {jobs.length === 0 ? (
        <div className="card"><EmptyState text="Ainda não há candidaturas." /></div>
      ) : (
        <div className="space-y-4">
          {jobs.map((j) => (
            <article key={j.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-black text-brand-dark">{j.name} <span className="text-sm font-semibold text-brand-dark/50">— {j.position}</span></p>
                  <p className="text-sm text-brand-dark/60 mt-1">{j.phone}{j.email ? ` · ${j.email}` : ''}</p>
                  <p className="text-xs text-brand-dark/40 mt-0.5">{formatDateTime(j.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={tone(j.status)}>{JOB_STATUS_LABELS[j.status]}</Badge>
                  <a href={waLink(j.phone, `Olá ${j.name}! Aqui é da equipa da ${BRAND.name}. Recebemos a tua candidatura para ${j.position}. 😊`)} target="_blank" rel="noreferrer" className="btn-whatsapp !px-4 !py-2 text-xs">
                    <IconWhatsApp /> Contactar
                  </a>
                </div>
              </div>
              {j.message && <p className="mt-3 text-sm bg-brand-cream rounded-xl p-4 text-brand-dark/70 whitespace-pre-wrap">{j.message}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => void setStatus(j, s)}
                    className={`rounded-full px-4 py-1.5 text-xs font-black transition ${j.status === s ? 'bg-brand-red text-white' : 'bg-brand-dark/5 text-brand-dark/60 hover:bg-brand-dark/10'}`}
                  >
                    {JOB_STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
