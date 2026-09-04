'use client';

import { useState } from 'react';
import { BRAND } from '@/lib/types';
import { JOB_POSITIONS } from '@/lib/catalog';
import { waLink } from '@/lib/whatsapp';
import { Reveal } from '@/components/Reveal';
import { IconCheck, IconWhatsApp } from '@/components/icons';

const PERKS = [
  'Equipa jovem e ambiente familiar',
  'Oportunidades de crescimento',
  'Refeições a preço de equipa',
  'Estafetas com rentabilidade por entregas',
];

export function JobsSection() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', position: JOB_POSITIONS[0], message: '' });
  const [state, setState] = useState<{ status: 'idle' | 'sending' | 'ok' | 'error'; msg?: string }>({ status: 'idle' });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState({ status: 'sending' });
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || 'Erro ao enviar.');
      setState({ status: 'ok', msg: 'Candidatura recebida! A nossa equipa vai contactar-te em breve. 🎉' });
      setForm({ name: '', phone: '', email: '', position: JOB_POSITIONS[0], message: '' });
    } catch (err) {
      setState({ status: 'error', msg: err instanceof Error ? err.message : 'Erro ao enviar a candidatura.' });
    }
  };

  return (
    <section id="trabalhe" className="section-pad bg-brand-creamDark/40 scroll-mt-24">
      <div className="container-lg grid lg:grid-cols-2 gap-14 items-center">
        <Reveal>
          <p className="text-brand-red font-black uppercase tracking-[0.25em] text-sm">Junta-te à equipa</p>
          <h2 className="font-display font-black text-4xl md:text-5xl mt-3 text-brand-dark leading-tight">
            Trabalha <span className="text-brand-red">connosco</span>
          </h2>
          <p className="mt-5 text-lg text-brand-dark/60 leading-relaxed">
            Procuramos pessoas com energia para cozinhar, atender e entregar o melhor da Aliado Food. Envia a tua
            candidatura e nós respondemos para o teu contacto.
          </p>
          <ul className="mt-8 space-y-3">
            {PERKS.map((p) => (
              <li key={p} className="flex items-center gap-3 font-semibold text-brand-dark/80">
                <span className="h-7 w-7 rounded-full bg-brand-gold/20 grid place-items-center text-brand-red">
                  <IconCheck width={16} height={16} />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={120}>
          <form onSubmit={submit} className="card p-7 md:p-8 space-y-4">
            <h3 className="font-display font-black text-2xl text-brand-dark">Formulário de candidatura</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="jname">Nome *</label>
                <input id="jname" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="O teu nome" />
              </div>
              <div>
                <label className="label" htmlFor="jphone">Telefone *</label>
                <input id="jphone" required inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" placeholder="929 809 889" />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="jemail">E-mail (opcional)</label>
              <input id="jemail" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" placeholder="nome@email.com" />
            </div>
            <div>
              <label className="label" htmlFor="jposition">Função pretendida *</label>
              <select id="jposition" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="input">
                {JOB_POSITIONS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="jmsg">Fala-nos de ti (opcional)</label>
              <textarea id="jmsg" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input resize-none" placeholder="Experiência, disponibilidade, motivação…" />
            </div>
            {state.msg && (
              <p className={`text-sm font-bold rounded-xl px-4 py-3 ${state.status === 'ok' ? 'bg-[#25D366]/10 text-[#128C4B]' : 'bg-brand-red/10 text-brand-red'}`}>
                {state.msg}
              </p>
            )}
            <button type="submit" disabled={state.status === 'sending'} className="btn-primary w-full disabled:opacity-60">
              {state.status === 'sending' ? 'A enviar…' : 'Enviar candidatura'}
            </button>
            <p className="text-xs text-brand-dark/45 text-center">
              A candidatura é enviada para o nosso e-mail oficial {BRAND.email}.
            </p>
            <a href={waLink(BRAND.whatsapp, `Olá ${BRAND.name}! Quero trabalhar convosco. 😊`)} target="_blank" rel="noreferrer" className="btn-whatsapp w-full">
              <IconWhatsApp /> Prefiro pelo WhatsApp
            </a>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
