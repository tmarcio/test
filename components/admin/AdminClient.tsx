'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Overview } from '@/components/admin/Overview';
import { OrdersManager } from '@/components/admin/OrdersManager';
import { ProductsManager } from '@/components/admin/ProductsManager';
import { FeesManager } from '@/components/admin/FeesManager';
import { CouriersManager } from '@/components/admin/CouriersManager';
import { PartnersManager } from '@/components/admin/PartnersManager';
import { ActivitiesManager } from '@/components/admin/ActivitiesManager';
import { JobsManager } from '@/components/admin/JobsManager';
import { IconLogout } from '@/components/icons';

type Tab = 'resumo' | 'encomendas' | 'cardapio' | 'taxas' | 'estafetas' | 'parceiros' | 'atividades' | 'candidaturas';

const TABS: { id: Tab; label: string }[] = [
  { id: 'resumo', label: 'Resumo' },
  { id: 'encomendas', label: 'Encomendas' },
  { id: 'cardapio', label: 'Cardápio' },
  { id: 'taxas', label: 'Taxas / Municípios' },
  { id: 'estafetas', label: 'Estafetas' },
  { id: 'parceiros', label: 'Parceiros' },
  { id: 'atividades', label: 'Atividades' },
  { id: 'candidaturas', label: 'Candidaturas' },
];

export function AdminClient() {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [tab, setTab] = useState<Tab>('resumo');

  useEffect(() => {
    fetch('/api/admin/session')
      .then((r) => r.json())
      .then((d) => setAuthenticated(Boolean(d.authenticated)))
      .catch(() => setAuthenticated(false))
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen grid place-items-center bg-brand-dark">
        <p className="text-white/60 font-bold">A verificar sessão…</p>
      </div>
    );
  }

  if (!authenticated) {
    return <LoginForm onSuccess={() => setAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-brand-cream md:pl-64">
      <aside className="fixed inset-y-0 left-0 w-64 bg-brand-dark text-white hidden md:flex flex-col">
        <Link href="/" className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Aliado Food" className="h-10 w-10 rounded-xl" />
          <span className="font-display font-black leading-tight">
            ALIADO <span className="text-brand-gold">FOOD</span>
            <span className="block text-[10px] uppercase tracking-[0.3em] text-white/50">Painel da equipa</span>
          </span>
        </Link>
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition ${tab === t.id ? 'bg-brand-gold text-brand-dark' : 'text-white/70 hover:bg-white/10'}`}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <div className="px-4 py-5 border-t border-white/10 space-y-2">
          <Link href="/" className="block text-center text-sm text-white/60 hover:text-brand-gold font-semibold">
            ← Ver site público
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* Barra mobile */}
      <div className="md:hidden sticky top-0 z-30 bg-brand-dark text-white">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="font-display font-black">
            ALIADO <span className="text-brand-gold">FOOD</span> <span className="text-xs text-white/50">· Painel</span>
          </Link>
          <LogoutButton compact />
        </div>
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-thin">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold ${tab === t.id ? 'bg-brand-gold text-brand-dark' : 'bg-white/10 text-white/70'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="px-4 md:px-8 py-8 max-w-6xl">
        {tab === 'resumo' && <Overview goTo={setTab} />}
        {tab === 'encomendas' && <OrdersManager />}
        {tab === 'cardapio' && <ProductsManager />}
        {tab === 'taxas' && <FeesManager />}
        {tab === 'estafetas' && <CouriersManager />}
        {tab === 'parceiros' && <PartnersManager />}
        {tab === 'atividades' && <ActivitiesManager />}
        {tab === 'candidaturas' && <JobsManager />}
      </main>
    </div>
  );
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || 'Palavra-passe incorreta.');
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro. Tenta novamente.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-brand-dark hero-noise p-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-card space-y-4 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="Aliado Food" className="h-16 w-16 mx-auto rounded-2xl" />
        <div>
          <h1 className="font-display font-black text-2xl text-brand-dark">Painel Aliado Food</h1>
          <p className="text-sm text-brand-dark/50 mt-1">Área reservada à equipa</p>
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Palavra-passe"
          className="input text-center"
          autoFocus
        />
        {error && <p className="text-sm font-bold text-brand-red">{error}</p>}
        <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
          {busy ? 'A entrar…' : 'Entrar'}
        </button>
        <Link href="/" className="block text-sm text-brand-dark/50 hover:text-brand-red font-semibold">
          ← Voltar ao site
        </Link>
      </form>
    </div>
  );
}

function LogoutButton({ compact = false }: { compact?: boolean }) {
  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.reload();
  };
  return (
    <button
      onClick={() => void logout()}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold text-sm transition ${compact ? 'bg-white/10 text-white/80 px-3 py-1.5 hover:bg-brand-red' : 'w-full bg-white/10 text-white/80 py-2.5 hover:bg-brand-red'}`}
    >
      <IconLogout width={16} height={16} /> Sair
    </button>
  );
}
