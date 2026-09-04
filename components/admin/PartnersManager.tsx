'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Partner } from '@/lib/types';
import { Badge, EmptyState, Field, Modal } from '@/components/admin/ui';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { IconEdit, IconPlus, IconTrash } from '@/components/icons';

export function PartnersManager() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [editing, setEditing] = useState<Partial<Partner> | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    fetch('/api/admin/partners')
      .then((r) => r.json())
      .then((d: Partner[]) => setPartners(d))
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
      const res = await fetch(isNew ? '/api/admin/partners' : `/api/admin/partners/${editing.id}`, {
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

  const remove = async (p: Partner) => {
    if (!window.confirm(`Eliminar o parceiro "${p.name}"?`)) return;
    await fetch(`/api/admin/partners/${p.id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-3xl text-brand-dark">Parceiros</h1>
          <p className="text-brand-dark/55 mt-1">Imagem e nome dos parceiros, com upload de logótipo.</p>
        </div>
        <button onClick={() => { setEditing({ active: true }); setError(''); }} className="btn-primary !py-2.5 text-sm">
          <IconPlus /> Novo parceiro
        </button>
      </header>

      {partners.length === 0 ? (
        <div className="card"><EmptyState text="Sem parceiros." /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.map((p) => (
            <article key={p.id} className={`card p-5 space-y-3 ${!p.active ? 'opacity-60' : ''}`}>
              <div className="h-32 rounded-2xl overflow-hidden bg-brand-cream">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="font-black text-brand-dark">{p.name}</h3>
              <p className="text-sm text-brand-dark/55">{p.description}</p>
              <div className="flex items-center gap-2">
                <Badge tone={p.active ? 'green' : 'red'}>{p.active ? 'Ativo' : 'Inativo'}</Badge>
                <span className="flex-1" />
                <button onClick={() => { setEditing(p); setError(''); }} className="h-9 w-9 grid place-items-center rounded-full bg-brand-dark/5 hover:bg-brand-red hover:text-white transition" aria-label="Editar">
                  <IconEdit width={16} height={16} />
                </button>
                <button onClick={() => void remove(p)} className="h-9 w-9 grid place-items-center rounded-full bg-brand-dark/5 hover:bg-brand-red hover:text-white transition" aria-label="Eliminar">
                  <IconTrash width={16} height={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal open={!!editing} title={editing?.id ? 'Editar parceiro' : 'Novo parceiro'} onClose={() => setEditing(null)}>
        {editing && (
          <div className="space-y-4">
            <Field label="Nome">
              <input value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="input" />
            </Field>
            <Field label="Descrição">
              <textarea rows={2} value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="input resize-none" />
            </Field>
            <ImageUpload value={editing.image || ''} onChange={(image) => setEditing({ ...editing, image })} label="Logótipo / imagem" />
            <Field label="Site (opcional)">
              <input value={editing.url || ''} onChange={(e) => setEditing({ ...editing, url: e.target.value })} className="input" placeholder="https://…" />
            </Field>
            <div className="grid grid-cols-2 gap-4 items-end">
              <Field label="Ordem">
                <input type="number" value={editing.sort || 0} onChange={(e) => setEditing({ ...editing, sort: Number(e.target.value) })} className="input" />
              </Field>
              <label className="flex items-center gap-2 cursor-pointer pb-2">
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
