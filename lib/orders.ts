import { getDb, yangoDeliveryFee } from './db';
import { generateRef, sanitizeText } from './format';
import type { Order, OrderEvent, OrderItem, OrderStatus } from './types';

interface OrderRow {
  id: number;
  ref: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  delivery_type: 'pickup' | 'delivery';
  municipality_id: number | null;
  municipality_name: string;
  bairro: string;
  rua: string;
  address_notes: string;
  delivery_fee: number;
  subtotal: number;
  total: number;
  payment_method: string;
  status: OrderStatus;
  courier_id: number | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface ItemRow {
  id: number;
  order_id: number;
  product_id: string;
  name: string;
  price: number;
  qty: number;
  notes: string;
}

interface EventRow {
  id: number;
  order_id: number;
  status: OrderStatus;
  note: string;
  created_at: string;
}

export function mapOrder(row: OrderRow, items: ItemRow[] = [], events: EventRow[] = []): Order {
  return {
    id: row.id,
    ref: row.ref,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email,
    deliveryType: row.delivery_type,
    municipalityId: row.municipality_id,
    municipalityName: row.municipality_name,
    bairro: row.bairro,
    rua: row.rua,
    addressNotes: row.address_notes,
    deliveryFee: row.delivery_fee,
    subtotal: row.subtotal,
    total: row.total,
    paymentMethod: row.payment_method,
    status: row.status,
    courierId: row.courier_id,
    courierName: '',
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items: items.map((i) => mapItem(i)),
    events: events.map((e) => mapEvent(e)),
  };
}

export function mapItem(row: ItemRow): OrderItem {
  return {
    id: row.id,
    orderId: row.order_id,
    productId: row.product_id,
    name: row.name,
    price: row.price,
    qty: row.qty,
    notes: row.notes,
  };
}

export function mapEvent(row: EventRow): OrderEvent {
  return {
    id: row.id,
    orderId: row.order_id,
    status: row.status,
    note: row.note,
    createdAt: row.created_at,
  };
}

export function getMunicipality(id: number) {
  const row = getDb().prepare('SELECT * FROM municipalities WHERE id = ?').get(id) as
    | {
        id: number;
        name: string;
        base_fee: number;
        per_km: number;
        distance_km: number;
        adjustment: number;
        est_minutes: number;
      }
    | undefined;
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    baseFee: row.base_fee,
    perKm: row.per_km,
    distanceKm: row.distance_km,
    adjustment: row.adjustment,
    estMinutes: row.est_minutes,
    fee: yangoDeliveryFee({ baseFee: row.base_fee, perKm: row.per_km, distanceKm: row.distance_km, adjustment: row.adjustment }),
  };
}

export interface CreateOrderInput {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryType: 'pickup' | 'delivery';
  municipalityId?: number | null;
  bairro?: string;
  rua?: string;
  addressNotes?: string;
  paymentMethod: string;
  notes?: string;
  items: { productId: string; qty: number; notes?: string }[];
}

export function createOrder(input: CreateOrderInput): Order {
  const db = getDb();
  if (!input.items.length) throw new Error('A encomenda não tem itens.');

  const productStmt = db.prepare('SELECT id, name, price FROM products WHERE id = ? AND available = 1');
  const items: { productId: string; name: string; price: number; qty: number; notes: string }[] = [];
  let subtotal = 0;
  for (const item of input.items) {
    const product = productStmt.get(item.productId) as { id: string; name: string; price: number } | undefined;
    if (!product) throw new Error(`Produto indisponível: ${item.productId}`);
    const qty = Math.max(1, Math.min(99, Math.floor(Number(item.qty) || 1)));
    const price = Number(product.price);
    items.push({
      productId: product.id,
      name: product.name,
      price,
      qty,
      notes: sanitizeText(item.notes || ''),
    });
    subtotal += price * qty;
  }

  let deliveryFee = 0;
  let municipalityName = '';
  let municipalityId: number | null = null;
  if (input.deliveryType === 'delivery') {
    const mun = input.municipalityId ? getMunicipality(input.municipalityId) : null;
    if (!mun) throw new Error('Seleciona o município de entrega.');
    deliveryFee = mun.fee;
    municipalityName = mun.name;
    municipalityId = mun.id;
  }

  const ref = generateRef();
  const now = new Date().toISOString();
  const orderResult = db
    .prepare(
      `INSERT INTO orders
        (ref, customer_name, customer_phone, customer_email, delivery_type, municipality_id, municipality_name,
         bairro, rua, address_notes, delivery_fee, subtotal, total, payment_method, status, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendente', ?, ?, ?)`,
    )
    .run(
      ref,
      sanitizeText(input.customerName),
      sanitizeText(input.customerPhone),
      sanitizeText(input.customerEmail || ''),
      input.deliveryType,
      municipalityId,
      municipalityName,
      sanitizeText(input.bairro || ''),
      sanitizeText(input.rua || ''),
      sanitizeText(input.addressNotes || ''),
      deliveryFee,
      subtotal,
      subtotal + deliveryFee,
      sanitizeText(input.paymentMethod || 'Dinheiro na entrega'),
      sanitizeText(input.notes || ''),
      now,
      now,
    );

  const orderId = Number(orderResult.lastInsertRowid);
  const itemStmt = db.prepare(
    'INSERT INTO order_items (order_id, product_id, name, price, qty, notes) VALUES (?, ?, ?, ?, ?, ?)',
  );
  for (const it of items) itemStmt.run(orderId, it.productId, it.name, it.price, it.qty, it.notes);
  db.prepare('INSERT INTO order_events (order_id, status, note, created_at) VALUES (?, ?, ?, ?)').run(
    orderId,
    'pendente',
    'Encomenda criada pelo cliente.',
    now,
  );

  const order = getOrderById(orderId);
  if (!order) throw new Error('Erro ao criar encomenda.');
  return order;
}

export function getOrderById(id: number): Order | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as OrderRow | undefined;
  if (!row) return null;
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ? ORDER BY id').all(id) as ItemRow[];
  const events = db.prepare('SELECT * FROM order_events WHERE order_id = ? ORDER BY id').all(id) as EventRow[];
  const courier = row.courier_id ? (db.prepare('SELECT name FROM couriers WHERE id = ?').get(row.courier_id) as { name: string } | undefined) : undefined;
  const order = mapOrder(row, items, events);
  order.courierName = courier?.name || '';
  return order;
}

export function getOrderByRef(ref: string): Order | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM orders WHERE ref = ?').get(ref.toUpperCase()) as OrderRow | undefined;
  if (!row) return null;
  return getOrderById(row.id);
}

export function listOrders(status?: OrderStatus | 'todas'): Order[] {
  const db = getDb();
  const rows = (
    status && status !== 'todas'
      ? db.prepare('SELECT * FROM orders WHERE status = ? ORDER BY id DESC').all(status)
      : db.prepare('SELECT * FROM orders ORDER BY id DESC').all()
  ) as OrderRow[];
  const itemsStmt = db.prepare('SELECT * FROM order_items WHERE order_id = ? ORDER BY id');
  const eventsStmt = db.prepare('SELECT * FROM order_events WHERE order_id = ? ORDER BY id');
  return rows.map((row) =>
    mapOrder(row, itemsStmt.all(row.id) as ItemRow[], eventsStmt.all(row.id) as EventRow[]),
  );
}

export function updateOrderStatus(
  orderId: number,
  status: OrderStatus,
  opts: { note?: string; courierId?: number | null } = {},
): Order | null {
  const db = getDb();
  const order = getOrderById(orderId);
  if (!order) return null;
  const now = new Date().toISOString();
  db.prepare('UPDATE orders SET status = ?, courier_id = ?, updated_at = ? WHERE id = ?').run(
    status,
    opts.courierId === undefined ? order.courierId : opts.courierId,
    now,
    orderId,
  );
  db.prepare('INSERT INTO order_events (order_id, status, note, created_at) VALUES (?, ?, ?, ?)').run(
    orderId,
    status,
    opts.note || '',
    now,
  );
  return getOrderById(orderId);
}

export function orderStats() {
  const db = getDb();
  const total = (db.prepare('SELECT COUNT(*) c FROM orders').get() as { c: number }).c;
  const today = (db.prepare("SELECT COUNT(*) c FROM orders WHERE date(created_at) = date('now')").get() as { c: number }).c;
  const revenue = (
    db.prepare("SELECT COALESCE(SUM(total),0) s FROM orders WHERE status NOT IN ('cancelada')").get() as { s: number }
  ).s;
  const pending = (db.prepare("SELECT COUNT(*) c FROM orders WHERE status = 'pendente'").get() as { c: number }).c;
  const couriers = (db.prepare('SELECT COUNT(*) c FROM couriers WHERE available = 1 AND active = 1').get() as { c: number }).c;
  return { total, today, revenue, pending, couriers };
}
