import nodemailer from 'nodemailer';
import { BRAND, type JobApplication, type Order } from './types';
import { formatDateTime, formatKz } from './format';

const HOST = process.env.SMTP_HOST || '';
const PORT = Number(process.env.SMTP_PORT || 587);
const USER = process.env.SMTP_USER || '';
const PASS = process.env.SMTP_PASS || '';
const FROM = process.env.SMTP_FROM || process.env.SMTP_USER || BRAND.email;

function transport() {
  if (!HOST || !USER || !PASS) return null;
  return nodemailer.createTransport({
    host: HOST,
    port: PORT,
    secure: PORT === 465,
    auth: { user: USER, pass: PASS },
  });
}

export async function sendMail(opts: { to: string; subject: string; html: string; text: string }) {
  const t = transport();
  if (!t) {
    console.log(`[mailer:sem SMTP] Para: ${opts.to} | Assunto: ${opts.subject}`);
    return { ok: false, reason: 'SMTP not configured' };
  }
  try {
    await t.sendMail({ from: FROM, to: opts.to, subject: opts.subject, html: opts.html, text: opts.text });
    return { ok: true };
  } catch (err) {
    console.error('[mailer] Falha ao enviar e-mail:', err);
    return { ok: false, reason: String(err) };
  }
}

export function orderEmailHtml(order: Order): string {
  const items = order.items
    .map((i) => `<tr><td>${i.qty}× ${i.name}</td><td align="right">${formatKz(i.price * i.qty)}</td></tr>`)
    .join('');
  return `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;background:#fff;border:1px solid #eee;border-radius:12px;overflow:hidden">
      <div style="background:#D62828;color:#fff;padding:20px 28px">
        <h1 style="margin:0">${BRAND.name}</h1>
        <p style="margin:6px 0 0;opacity:.9">Nova encomenda — Ref. ${order.ref}</p>
      </div>
      <div style="padding:24px 28px">
        <p><strong>Cliente:</strong> ${order.customerName} — ${order.customerPhone}</p>
        <p><strong>Tipo:</strong> ${order.deliveryType === 'delivery' ? 'Entrega ao domicílio' : 'Levantamento no ponto de venda'}</p>
        ${
          order.deliveryType === 'delivery'
            ? `<p><strong>Município:</strong> ${order.municipalityName}${order.bairro ? ` — Bairro: ${order.bairro}` : ''}${order.rua ? ` — Rua: ${order.rua}` : ''}</p>`
            : ''
        }
        <p><strong>Pagamento:</strong> ${order.paymentMethod}</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <thead><tr><th align="left" style="border-bottom:2px solid #eee">Item</th><th align="right" style="border-bottom:2px solid #eee">Total</th></tr></thead>
          <tbody>${items}</tbody>
        </table>
        <p style="display:flex;justify-content:space-between"><strong>Subtotal</strong><span>${formatKz(order.subtotal)}</span></p>
        ${order.deliveryType === 'delivery' ? `<p style="display:flex;justify-content:space-between"><strong>Entrega</strong><span>${formatKz(order.deliveryFee)}</span></p>` : ''}
        <p style="display:flex;justify-content:space-between;font-size:18px;border-top:2px solid #eee;padding-top:12px"><strong>TOTAL</strong><strong style="color:#D62828">${formatKz(order.total)}</strong></p>
      </div>
    </div>`;
}

export function jobEmailHtml(job: JobApplication): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;background:#fff;border:1px solid #eee;border-radius:12px;overflow:hidden">
      <div style="background:#D62828;color:#fff;padding:20px 28px">
        <h1 style="margin:0">${BRAND.name}</h1>
        <p style="margin:6px 0 0;opacity:.9">Candidatura — ${job.position}</p>
      </div>
      <div style="padding:24px 28px">
        <p><strong>Nome:</strong> ${job.name}</p>
        <p><strong>Telefone:</strong> ${job.phone}</p>
        <p><strong>E-mail:</strong> ${job.email || '—'}</p>
        <p><strong>Função pretendida:</strong> ${job.position}</p>
        <p><strong>Mensagem:</strong></p>
        <p style="background:#f7f7f7;padding:14px;border-radius:8px;white-space:pre-wrap">${job.message}</p>
        <p style="color:#888;font-size:12px">Recebida a ${formatDateTime(job.createdAt)}</p>
      </div>
    </div>`;
}

export function orderEmailText(order: Order): string {
  const items = order.items.map((i) => `- ${i.qty}x ${i.name} (${formatKz(i.price * i.qty)})`).join('\n');
  return [
    `Nova encomenda ${order.ref} — ${BRAND.name}`,
    '',
    `Cliente: ${order.customerName} (${order.customerPhone})`,
    `Tipo: ${order.deliveryType === 'delivery' ? 'Entrega' : 'Levantamento'}`,
    order.deliveryType === 'delivery' ? `Entrega: ${order.municipalityName}${order.bairro ? `, ${order.bairro}` : ''}${order.rua ? `, ${order.rua}` : ''}` : '',
    `Pagamento: ${order.paymentMethod}`,
    '',
    items,
    '',
    `Subtotal: ${formatKz(order.subtotal)}`,
    order.deliveryType === 'delivery' ? `Entrega: ${formatKz(order.deliveryFee)}` : '',
    `TOTAL: ${formatKz(order.total)}`,
  ]
    .filter(Boolean)
    .join('\n');
}

export function jobEmailText(job: JobApplication): string {
  return [
    `Candidatura ${BRAND.name} — ${job.position}`,
    '',
    `Nome: ${job.name}`,
    `Telefone: ${job.phone}`,
    `E-mail: ${job.email || '—'}`,
    '',
    job.message,
  ].join('\n');
}
