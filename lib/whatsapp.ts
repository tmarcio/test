import { BRAND, type Order, type Partner, type Courier } from './types';
import { formatKz } from './format';

export function waNumber(phone: string): string {
  return phone.replace(/\D/g, '').replace(/^0+/, '').replace(/^([23])\d{8}$/, '244$1$2');
}

export function waLink(phone: string, text: string): string {
  return `https://wa.me/${waNumber(phone)}?text=${encodeURIComponent(text)}`;
}

export function orderWhatsAppMessage(order: Order): string {
  const lines: string[] = [];
  lines.push(`Olá ${BRAND.name}! 🍽️ Quero confirmar a minha encomenda.`);
  lines.push('');
  lines.push(`📦 Ref: ${order.ref}`);
  lines.push(`👤 ${order.customerName}`);
  lines.push(`📞 ${order.customerPhone}`);
  lines.push('');
  lines.push('🛒 Itens:');
  for (const item of order.items) {
    lines.push(`• ${item.qty}× ${item.name} — ${formatKz(item.price * item.qty)}`);
  }
  lines.push('');
  lines.push(`Subtotal: ${formatKz(order.subtotal)}`);
  if (order.deliveryType === 'delivery') {
    lines.push(`Taxa de entrega: ${formatKz(order.deliveryFee)}`);
    lines.push(`🛵 Entrega: ${order.municipalityName}${order.bairro ? ` — Bairro: ${order.bairro}` : ''}${order.rua ? ` — Rua: ${order.rua}` : ''}`);
  } else {
    lines.push('🏪 Levantamento no ponto de venda Aliado Food');
  }
  lines.push('');
  lines.push(`💰 Total: ${formatKz(order.total)}`);
  lines.push(`💳 Pagamento: ${order.paymentMethod}`);
  lines.push('');
  lines.push('Por favor, confirmem a disponibilidade. Obrigado!');
  return lines.join('\n');
}

export function orderWhatsAppLink(order: Order): string {
  return waLink(BRAND.whatsapp, orderWhatsAppMessage(order));
}

export function partnerWhatsAppLink(p: Partner): string {
  return waLink(BRAND.whatsapp, `Olá ${BRAND.name}! Sou da empresa ${p.name} e gostaria de falar sobre uma parceria.`);
}

export function courierWhatsAppLink(c: Courier, orderRef: string, orderSummary: string): string {
  const text = [
    `Olá ${c.name}! 🛵`,
    `${BRAND.name} tem uma encomenda para ti.`,
    '',
    `📦 Referência: ${orderRef}`,
    orderSummary,
    '',
    'Estás disponível para a entrega? Responde-nos, por favor. Obrigado!',
  ].join('\n');
  return waLink(c.phone, text);
}

export function trackUrl(ref: string): string {
  return `${process.env.NEXT_PUBLIC_SITE_URL || ''}/rastreio?ref=${encodeURIComponent(ref)}`;
}
