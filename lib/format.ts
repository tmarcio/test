import { ORDER_STATUS_LABELS, type OrderStatus } from './types';

export function formatKz(value: number): string {
  const rounded = Math.round(value);
  return `${rounded.toLocaleString('pt-PT')} Kz`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' })} ${d.toLocaleTimeString(
    'pt-PT',
    { hour: '2-digit', minute: '2-digit' },
  )}`;
}

export function statusLabel(status: OrderStatus): string {
  return ORDER_STATUS_LABELS[status] ?? status;
}

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function generateRef(): string {
  const time = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `AF-${time}${rand}`;
}

export function sanitizeText(input: string): string {
  return input.replace(/[<>]/g, '').trim();
}
