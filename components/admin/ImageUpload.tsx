'use client';

import { useRef, useState } from 'react';
import { IconUpload } from '@/components/icons';

export function ImageUpload({
  value,
  onChange,
  label = 'Imagem',
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const upload = async (file: File) => {
    setUploading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || 'Falha no upload.');
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha no upload.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex items-start gap-4">
        <div className="h-24 w-24 rounded-2xl overflow-hidden bg-brand-cream border border-brand-dark/10 shrink-0 grid place-items-center">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Pré-visualização" className="w-full h-full object-cover" />
          ) : (
            <span className="text-brand-dark/25">sem imagem</span>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void upload(f);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="btn-dark !px-4 !py-2 text-sm disabled:opacity-60"
          >
            <IconUpload /> {uploading ? 'A carregar…' : 'Carregar imagem'}
          </button>
          <input
            value={value.startsWith('/api/files/') || value.startsWith('/images/') || value.startsWith('http') ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="ou cola um URL de imagem"
            className="input !py-2 text-sm"
          />
          {error && <p className="text-xs font-bold text-brand-red">{error}</p>}
          <p className="text-[11px] text-brand-dark/40">PNG, JPG, WEBP, GIF ou SVG · máx. 5 MB</p>
        </div>
      </div>
    </div>
  );
}
