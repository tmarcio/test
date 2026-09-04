'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Category, Product } from '@/lib/types';
import { CATEGORY_LABELS } from '@/lib/catalog';
import { formatKz, slugify } from '@/lib/format';
import { Badge, EmptyState, Field, Modal, Toggle } from '@/components/admin/ui';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { IconEdit, IconPlus, IconTrash } from '@/components/icons';

const CATEGORIES: Category[] = ['refeicoes', 'pizzas', 'bebidas'];

const empty: Omit<Product, 'id'> & { id?: string } = {
  name: '',
  description: '',
  price: 0,
  category: 'refeicoes',
  image: '',
  tags: [],
  available: true,
  featured: false,
  sort: 0,
};

export function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Omit<Product, 'id'> & { id?: string } | null>(null);
  const [tagsText, setTagsText] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    fetch('/api/admin/products')
      .then((r) => r.json())
      .then((d: Product[]) => setProducts(d))
      .catch(() => undefined);
  }, []);

  useEffect(() => load(), [load]);

  const openEdit = (p?: Product) => {
    setEditing(p ? { ...p } : { ...empty });
    setTagsText(p ? p.tags.join(', ') : '');
    setError('');
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.name.trim() || !(editing.price > 0)) {
      setError('Preenche o nome e um preço válido.');
      return;
    }
    setBusy(true);
    setError('');
    const body = {
      ...editing,
      tags: tagsText.split(',').map((t) => t.trim()).filter(Boolean),
    };
    try {
      const isNew = !body.id;
      const id =
        body.id ||
        (Math.random().toString(36).slice(2, 8) + '-' + slugify(body.name)).replace(/[^a-z0-9-]/g, '').slice(0, 48);
      const res = await fetch(isNew ? '/api/admin/products' : `/api/admin/products/${body.id}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, id }),
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

  const remove = async (p: Product) => {
    if (!window.confirm(`Eliminar "${p.name}"?`)) return;
    await fetch(`/api/admin/products/${p.id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-3xl text-brand-dark">Cardápio</h1>
          <p className="text-brand-dark/55 mt-1">Adiciona, edita ou desativa produtos com imagem por upload.</p>
        </div>
        <button onClick={() => openEdit()} className="btn-primary !py-2.5 text-sm">
          <IconPlus /> Novo produto
        </button>
      </header>

      {products.length === 0 ? (
        <div className="card"><EmptyState text="Sem produtos." /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <article key={p.id} className={`card p-4 ${!p.available ? 'opacity-60' : ''}`}>
              <div className="h-36 rounded-2xl overflow-hidden bg-brand-dark/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <div className="mt-3 flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-black text-brand-dark leading-tight">{p.name}</h3>
                  <p className="text-xs text-brand-dark/50 mt-0.5">{CATEGORY_LABELS[p.category]}</p>
                </div>
                <span className="font-black text-brand-red text-sm whitespace-nowrap">{formatKz(p.price)}</span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Badge tone={p.available ? 'green' : 'red'}>{p.available ? 'Ativo' : 'Esgotado'}</Badge>
                {p.featured && <Badge>Destaque</Badge>}
                <span className="flex-1" />
                <button onClick={() => openEdit(p)} className="h-9 w-9 grid place-items-center rounded-full bg-brand-dark/5 hover:bg-brand-red hover:text-white transition" aria-label="Editar">
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

      <Modal open={!!editing} title={editing?.id ? 'Editar produto' : 'Novo produto'} onClose={() => setEditing(null)}>
        {editing && (
          <div className="space-y-4">
            <Field label="Nome">
              <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="input" placeholder="ex.: Frango Grelhado com Funge" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Preço (Kz)">
                <input type="number" min={0} step={50} value={editing.price || ''} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} className="input" />
              </Field>
              <Field label="Categoria">
                <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value as Category })} className="input">
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Descrição">
              <textarea rows={2} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="input resize-none" />
            </Field>
            <ImageUpload value={editing.image} onChange={(image) => setEditing({ ...editing, image })} />
            <Field label="Etiquetas (separadas por vírgula)" hint="ex.: Mais vendido, Grelhado">
              <input value={tagsText} onChange={(e) => setTagsText(e.target.value)} className="input" />
            </Field>
            <div className="grid grid-cols-3 items-end gap-4">
              <Field label="Ordem">
                <input type="number" value={editing.sort || 0} onChange={(e) => setEditing({ ...editing, sort: Number(e.target.value) })} className="input" />
              </Field>
              <Toggle checked={editing.available} onChange={(v) => setEditing({ ...editing, available: v })} label="Ativo" />
              <Toggle checked={editing.featured} onChange={(v) => setEditing({ ...editing, featured: v })} label="Destaque" />
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
