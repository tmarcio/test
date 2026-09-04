'use client';

import { type ReactNode } from 'react';
import { IconX } from '@/components/icons';

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {hint && <p className="text-xs text-brand-dark/50 mt-1">{hint}</p>}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2.5 cursor-pointer"
      aria-pressed={checked}
    >
      <span className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-brand-red' : 'bg-brand-dark/20'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </span>
      {label && <span className="text-sm font-semibold text-brand-dark/80">{label}</span>}
    </button>
  );
}

export function Badge({ children, tone = 'gold' }: { children: ReactNode; tone?: 'gold' | 'green' | 'red' | 'gray' }) {
  const map = {
    gold: 'bg-brand-gold/20 text-[#8A5A00]',
    green: 'bg-[#25D366]/15 text-[#128C4B]',
    red: 'bg-brand-red/15 text-brand-red',
    gray: 'bg-brand-dark/10 text-brand-dark/60',
  } as const;
  return <span className={`inline-block rounded-full px-3 py-1 text-xs font-black ${map[tone]}`}>{children}</span>;
}

export function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl p-6 md:p-8 scrollbar-thin">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-black text-xl text-brand-dark">{title}</h3>
          <button onClick={onClose} className="h-10 w-10 grid place-items-center rounded-full hover:bg-brand-dark/5" aria-label="Fechar">
            <IconX />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return <p className="text-center text-brand-dark/40 py-14 font-semibold">{text}</p>;
}
