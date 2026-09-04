'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Activity } from '@/lib/types';
import { formatDate } from '@/lib/format';
import { Badge, EmptyState, Field, Modal } from '@/components/admin/ui';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { IconEdit, IconPlus, IconTrash } from '@/components/icons';

export function ActivitiesManager() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [editing, setEditing] = useState<Partial<Activity> | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    fetch('/api/admin/activities')
      .then((r) => r.json())
      .then((d: Activity[]) => setActivities(d))
      .catch(() => undefined);
  }, []);

  useEffect(() => load(), [load]);

  const save = async () => {
    if (!editing) return;
    if (!editing.title?.trim()) {
      setError('O título é obrigatório.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const isNew = !editing.id;
      const res = await fetch(isNew ? '/api/admin/activities' : `/api/admin/activities/${editing.id}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editing, eventDate: editing.eventDate || '' }),
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

  const remove = async (a: Activity) => {
    if (!window.confirm(`Eliminar a atividade "${a.title}"?`)) return;
    await fetch(`/api/admin/activities/${a.id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-3xl text-brand-dark">Atividades & eventos</h1>
          <p className="text-brand-dark/55 mt-1">Publica atividades com imagem por upload.</p>
        </div>
        <button onClick={() => { setEditing({ active: true }); setError(''); }} className="btn-primary !py-2.5 text-sm">
          <IconPlus /> Nova atividade
        </button>
      </header>

      {activities.length === 0 ? (
        <div className="card"><EmptyState text="Sem atividades." /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activities.map((a) => (
            <article key={a.id} className={`card overflow-hidden ${!a.active ? 'opacity-60' : ''}`}>
              <div className="h-40 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.image} alt={a.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-5 space-y-2">
                <h3 className="font-black text-brand-dark leading-tight">{a.title}</h3>
                <p className="text-sm text-brand-dark/55 line-clamp-3">{a.description}</p>
                <p className="text-xs text-brand-dark/45">
                  {a.eventDate ? formatDate(a.eventDate) : 'Data a anunciar'} · {a.location || 'Ponto de venda'}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <Badge tone={a.active ? 'green' : 'red'}>{a.active ? 'Publicada' : 'Oculta'}</Badge>
                  <span className="flex-1" />
                  <button onClick={() => { setEditing(a); setError(''); }} className="h-9 w-9 grid place-items-center rounded-full bg-brand-dark/5 hover:bg-brand-red hover:text-white transition" aria-label="Editar">
                    <IconEdit width={16} height={16} />
                  </button>
                  <button onClick={() => void remove(a)} className="h-9 w-9 grid place-items-center rounded-full bg-brand-dark/5 hover:bg-brand-red hover:text-white transition" aria-label="Eliminar">
                    <IconTrash width={16} height={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal open={!!editing} title={editing?.id ? 'Editar atividade' : 'Nova atividade'} onClose={() => setEditing(null)}>
        {editing && (
          <div className="space-y-4">
            <Field label="Título">
              <input value={editing.title || ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="input" />
            </Field>
            <Field label="Descrição">
              <textarea rows={3} value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="input resize-none" />
            </Field>
            <ImageUpload value={editing.image || ''} onChange={(image) => setEditing({ ...editing, image })} label="Imagem do evento" />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Data (opcional)">
                <input type="date" value={editing.eventDate || ''} onChange={(e) => setEditing({ ...editing, eventDate: e.target.value })} className="input" />
              </Field>
              <Field label="Local">
                <input value={editing.location || ''} onChange={(e) => setEditing({ ...editing, location: e.target.value })} className="input" placeholder="Ponto de venda Aliado Food" />
              </Field>
              <Field label="Ordem">
                <input type="number" value={editing.sort || 0} onChange={(e) => setEditing({ ...editing, sort: Number(e.target.value) })} className="input" />
              </Field>
              <label className="flex items-center gap-2 cursor-pointer pb-2">
                <input type="checkbox" checked={!!editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} className="h-4 w-4 accent-brand-red" />
                <span className="text-sm font-bold">Publicada</span>
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
