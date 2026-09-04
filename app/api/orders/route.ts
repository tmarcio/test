import { NextResponse } from 'next/server';
import { createOrder, type CreateOrderInput } from '@/lib/orders';
import { sendMail, orderEmailHtml, orderEmailText } from '@/lib/mailer';
import { BRAND } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<CreateOrderInput>;
    if (!body.items?.length) {
      return NextResponse.json({ error: 'A encomenda não tem itens.' }, { status: 400 });
    }
    const order = createOrder({
      customerName: body.customerName || '',
      customerPhone: body.customerPhone || '',
      customerEmail: body.customerEmail || '',
      deliveryType: body.deliveryType === 'delivery' ? 'delivery' : 'pickup',
      municipalityId: body.municipalityId || null,
      bairro: body.bairro || '',
      rua: body.rua || '',
      addressNotes: body.addressNotes || '',
      paymentMethod: body.paymentMethod || 'Dinheiro na entrega',
      notes: body.notes || '',
      items: body.items,
    });
    // Notifica o e-mail oficial (se SMTP configurado; caso contrário fica registado na BD)
    await sendMail({
      to: BRAND.email,
      subject: `Nova encomenda ${order.ref} — ${BRAND.name}`,
      html: orderEmailHtml(order),
      text: orderEmailText(order),
    });
    return NextResponse.json({ ok: true, order }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao criar a encomenda.';
    console.error('[orders]', err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
