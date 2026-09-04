'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Courier } from '@/lib/types';
import { Badge, EmptyState, Field, Modal } from '@/components/admin/ui';
import { IconEdit, IconPlus, IconTrash, IconWhatsApp } from '@/components/icons';
import { waLink } from '@/lib/whatsapp';

export function CouriersManager() {
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [editing, setEditing] = useState<Partial<Courier> | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    fetch('/api/admin/couriers')
      .then((r) => r.json())
      .then((d: Courier[]) => setCouriers(d))
      .catch(() => undefined);
  }, []);

  useEffect(() => load(), [load]);

  const save = async () => {
    if (!editing) return;
    if (!editing.name?.trim()) {
      setError('O nome é obrigatório.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const isNew = !editing.id;
      const res = await fetch(isNew ? '/api/admin/couriers' : `/api/admin/couriers/${editing.id}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || 'Erro ao guardar.');
      setEditing(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao guardar.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (c: Courier) => {
    if (!window.confirm(`Remover o estafeta "${c.name}"?`)) return;
    await fetch(`/api/admin/couriers/${c.id}`, { method: 'DELETE' });
    load();
  };

  const toggleAvailable = async (c: Courier) => {
    await fetch(`/api/admin/couriers/${c.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...c, available: !c.available }),
    });
    load();
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-3xl text-brand-dark">Estafetas</h1>
          <p className="text-brand-dark/55 mt-1">A equipa de entregas por motorizada. O estado “Disponível” permite a atribuição de encomendas.</p>
        </div>
        <button onClick={() => { setEditing({ active: true, available: true, rating: 5 }); setError(''); }} className="btn-primary !py-2.5 text-sm">
          <IconPlus /> Novo estafeta
        </button>
      </header>

      {couriers.length === 0 ? (
        <div className="card"><EmptyState text="Sem estafetas cadastrados." /></div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {couriers.map((c) => (
            <article key={c.id} className="card p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-black text-brand-dark">{c.name}</h3>
                  <p className="text-sm text-brand-dark/55">{c.motorcycle} · Zona: {c.zone}</p>
                  <p className="text-sm text-brand-dark/70 mt-1 font-semibold">{c.phone}</p>
                </div>
                <span className="font-black text-brand-gold relative top-0">★ {c.rating.toFixed(1)}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={c.available ? 'green' : 'red'}>{c.available ? 'Disponível' : 'Indisponível'}</Badge>
                <Badge tone={c.active ? 'gold' : 'gray'}>{c.active ? 'Ativo' : 'Inativo'}</Badge>
                <span className="flex-1" />
                <button onClick={() => void toggleAvailable(c)} className="rounded-full bg-brand-dark/5 px-3 py-1.5 text-xs font-black hover:bg-brand-red hover:text-white transition">
                  {c.available ? 'Marcar indisponível' : 'Marcar disponível'}
                </button>
                <a href={waLink(c.phone, `Olá ${c.name}!`)} target="_blank" rel="noreferrer" className="h-9 w-9 grid place-items-center rounded-full bg-[#25D366]/15 text-[#128C4B] hover:bg-[#25D366] hover:text-white transition" aria-label="WhatsApp">
                  <IconWhatsApp width={16} height={16} />
                </a>
                <button onClick={() => { setEditing(c); setError(''); }} className="h-9 w-9 grid place-items-center rounded-full bg-brand-dark/5 hover:bg-brand-red hover:text-white transition" aria-label="Editar">
                  <IconEdit width={16} height={16} />
                </button>
                <button onClick={() => void remove(c)} className="h-9 w-9 grid place-items-center rounded-full bg-brand-dark/5 hover:bg-brand-red hover:text-white transition" aria-label="Remover">
                  <IconTrash width={16} height={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal open={!!editing} title={editing?.id ? 'Editar estafeta' : 'Novo estafeta'} onClose={() => setEditing(null)}>
        {editing && (
          <div className="space-y-4">
            <Field label="Nome">
              <input value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="input" />
            </Field>
            <Field label="Telefone (formatos: +244 923 111 222 ou 923 111 222)">
              <input value={editing.phone || ''} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} className="input" placeholder="+244 9xx xxx xxx" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Motorizada">
                <input value={editing.motorcycle || ''} onChange={(e) => setEditing({ ...editing, motorcycle: e.target.value })} className="input" placeholder="ex.: Honda Biz 125" />
              </Field>
              <Field label="Classificação (0–5)">
                <input type="number" min={0} max={5} step={0.1} value={editing.rating ?? 5} onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) })} className="input" />
              </Field>
            </div>
            <Field label="Zona de atuação">
              <input value={editing.zone || ''} onChange={(e) => setEditing({ ...editing, zone: e.target.value })} className="input" placeholder="ex.: Talatona / Belas" />
            </Field>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!editing.available} onChange={(e) => setEditing({ ...editing, available: e.target.checked })} className="h-4 w-4 accent-brand-red" />
                <span className="text-sm font-bold">Disponível</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} className="h-4 w-4 accent-brand-red" />
                <span className="text-sm font-bold">Ativo</span>
              </label>
            </div>
            {error && <p className="text-sm font-bold text-brand-red">{error}</p>}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setEditing(null)} className="btn-outline flex-1">Cancelar</button>
              <button onClick={() => void save()} disabled={busy} className="btn-primary flex-1 disabled:opacity-60">
                {busy ? 'A guardar…' : 'Guardar'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
