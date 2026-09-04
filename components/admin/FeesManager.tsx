'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Municipality } from '@/lib/types';
import { MUNICIPALITY_TABLE } from '@/lib/catalog';
import { formatKz } from '@/lib/format';
import { Badge, EmptyState, Field, Modal, Toggle } from '@/components/admin/ui';
import { IconEdit, IconPlus, IconTrash } from '@/components/icons';

export function FeesManager() {
  const [rows, setRows] = useState<(Municipality & { fee: number })[]>([]);
  const [editing, setEditing] = useState<Partial<Municipality> | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    fetch('/api/admin/municipalities')
      .then((r) => r.json())
      .then((d: (Municipality & { fee: number })[]) => setRows(d))
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
      const res = await fetch(isNew ? '/api/admin/municipalities' : `/api/admin/municipalities/${editing.id}`, {
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

  const remove = async (m: Municipality) => {
    if (!window.confirm(`Eliminar o município "${m.name}"?`)) return;
    await fetch(`/api/admin/municipalities/${m.id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-3xl text-brand-dark">Taxas de entrega</h1>
          <p className="text-brand-dark/55 mt-1">Baseadas na tabela oficial Yango — Delivery by motorizada, Luanda.</p>
        </div>
        <button onClick={() => { setEditing({ active: true, province: 'Luanda', baseFee: MUNICIPALITY_TABLE.base, perKm: MUNICIPALITY_TABLE.perKm, adjustment: 0, sort: rows.length + 1 }); setError(''); }} className="btn-primary !py-2.5 text-sm">
          <IconPlus /> Novo município
        </button>
      </header>

      <div className="rounded-2xl bg-brand-gold/15 border border-brand-gold/40 p-4 text-sm space-y-1">
        <p className="font-black text-brand-dark">📊 {MUNICIPALITY_TABLE.source}</p>
        <p className="text-brand-dark/70">{MUNICIPALITY_TABLE.note}</p>
        <p className="text-xs text-brand-dark/50">Mínimo {formatKz(MUNICIPALITY_TABLE.base)} (2,3 km incluídos) + {MUNICIPALITY_TABLE.perKm.toLocaleString('pt-PT')} Kz/km · válido até {MUNICIPALITY_TABLE.validUntil}</p>
      </div>

      {rows.length === 0 ? (
        <div className="card"><EmptyState text="Sem municípios." /></div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-brand-dark/45 border-b border-brand-dark/10">
                <th className="px-4 py-3">Município</th>
                <th className="px-4 py-3">Distância estimada</th>
                <th className="px-4 py-3">Base</th>
                <th className="px-4 py-3">+ Kz/km</th>
                <th className="px-4 py-3">Ajuste</th>
                <th className="px-4 py-3">Taxa ao cliente</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.id} className="border-b border-brand-dark/5 last:border-0">
                  <td className="px-4 py-3 font-black text-brand-dark">{m.name}</td>
                  <td className="px-4 py-3">{m.distanceKm.toLocaleString('pt-PT')} km · ~{m.estMinutes} min</td>
                  <td className="px-4 py-3">{formatKz(m.baseFee)}</td>
                  <td className="px-4 py-3">{m.perKm.toLocaleString('pt-PT')} Kz</td>
                  <td className="px-4 py-3">{m.adjustment ? formatKz(m.adjustment) : '—'}</td>
                  <td className="px-4 py-3 font-black text-brand-red">{formatKz(m.fee)}</td>
                  <td className="px-4 py-3"><Badge tone={m.active ? 'green' : 'red'}>{m.active ? 'Ativo' : 'Inativo'}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setEditing(m); setError(''); }} className="h-9 w-9 grid place-items-center rounded-full bg-brand-dark/5 hover:bg-brand-red hover:text-white transition" aria-label="Editar">
                        <IconEdit width={16} height={16} />
                      </button>
                      <button onClick={() => void remove(m)} className="h-9 w-9 grid place-items-center rounded-full bg-brand-dark/5 hover:bg-brand-red hover:text-white transition" aria-label="Eliminar">
                        <IconTrash width={16} height={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!editing} title={editing?.id ? 'Editar município' : 'Novo município'} onClose={() => setEditing(null)}>
        {editing && (
          <div className="space-y-4">
            <Field label="Nome do município">
              <input value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="input" placeholder="ex.: Maianga" />
            </Field>
            <Field label="Província">
              <input value={editing.province || 'Luanda'} onChange={(e) => setEditing({ ...editing, province: e.target.value })} className="input" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Distância estimada (km) desde o ponto de venda">
                <input type="number" min={0} step={0.5} value={editing.distanceKm || ''} onChange={(e) => setEditing({ ...editing, distanceKm: Number(e.target.value) })} className="input" />
              </Field>
              <Field label="Tempo estimado (min)">
                <input type="number" min={0} value={editing.estMinutes || ''} onChange={(e) => setEditing({ ...editing, estMinutes: Number(e.target.value) })} className="input" />
              </Field>
              <Field label="Taxa base Yango (Kz)">
                <input type="number" min={0} step={10} value={editing.baseFee ?? ''} onChange={(e) => setEditing({ ...editing, baseFee: Number(e.target.value) })} className="input" />
              </Field>
              <Field label="Valor por km adicional (Kz/km)">
                <input type="number" min={0} step={0.1} value={editing.perKm ?? ''} onChange={(e) => setEditing({ ...editing, perKm: Number(e.target.value) })} className="input" />
              </Field>
              <Field label="Ajuste manual (Kz, pode ser negativo)" hint="Somado à taxa calculada">
                <input type="number" step={50} value={editing.adjustment ?? 0} onChange={(e) => setEditing({ ...editing, adjustment: Number(e.target.value) })} className="input" />
              </Field>
              <Field label="Ordem">
                <input type="number" value={editing.sort || 0} onChange={(e) => setEditing({ ...editing, sort: Number(e.target.value) })} className="input" />
              </Field>
            </div>
            <Toggle checked={!!editing.active} onChange={(v) => setEditing({ ...editing, active: v })} label="Município ativo para entregas" />
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
