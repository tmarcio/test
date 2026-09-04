export type Category = 'refeicoes' | 'pizzas' | 'bebidas';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  image: string;
  tags: string[];
  available: boolean;
  featured: boolean;
  sort: number;
}

export interface Municipality {
  id: number;
  name: string;
  province: string;
  baseFee: number;
  perKm: number;
  distanceKm: number;
  estMinutes: number;
  adjustment: number;
  active: boolean;
  sort: number;
}

export interface Partner {
  id: number;
  name: string;
  description: string;
  image: string;
  url: string;
  active: boolean;
  sort: number;
}

export interface Activity {
  id: number;
  title: string;
  description: string;
  image: string;
  eventDate: string;
  location: string;
  active: boolean;
  sort: number;
}

export interface Courier {
  id: number;
  name: string;
  phone: string;
  motorcycle: string;
  zone: string;
  available: boolean;
  rating: number;
  active: boolean;
}

export type OrderStatus =
  | 'pendente'
  | 'confirmada'
  | 'em_preparacao'
  | 'pronta'
  | 'em_entrega'
  | 'entregue'
  | 'cancelada';

export interface OrderItem {
  id: number;
  orderId: number;
  productId: string;
  name: string;
  price: number;
  qty: number;
  notes: string;
}

export interface OrderEvent {
  id: number;
  orderId: number;
  status: OrderStatus;
  note: string;
  createdAt: string;
}

export interface Order {
  id: number;
  ref: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryType: 'pickup' | 'delivery';
  municipalityId: number | null;
  municipalityName: string;
  bairro: string;
  rua: string;
  addressNotes: string;
  deliveryFee: number;
  subtotal: number;
  total: number;
  paymentMethod: string;
  status: OrderStatus;
  courierId: number | null;
  courierName: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  events: OrderEvent[];
}

export interface JobApplication {
  id: number;
  name: string;
  phone: string;
  email: string;
  position: string;
  message: string;
  status: 'nova' | 'em_analise' | 'contactada' | 'arquivada';
  createdAt: string;
}

export const BRAND = {
  name: 'Aliado Food',
  phone: '+244929809889',
  phoneDisplay: '+244 929 809 889',
  whatsapp: '244929809889',
  email: 'aliadofood@hotmail.com',
  instagram: 'aliadofood',
  instagramUrl: 'https://www.instagram.com/aliadofood/',
  facebook: 'aliadofood.ao',
  facebookUrl: 'https://www.facebook.com/aliadofood.ao',
  loyaltyUrl: 'https://aliadomais.lovable.app',
  loyaltyName: 'ALIADO+',
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pendente: 'Pendente',
  confirmada: 'Confirmada',
  em_preparacao: 'Em preparação',
  pronta: 'Pronta',
  em_entrega: 'Em entrega',
  entregue: 'Entregue',
  cancelada: 'Cancelada',
};

export const ORDER_FLOW: OrderStatus[] = [
  'pendente',
  'confirmada',
  'em_preparacao',
  'pronta',
  'em_entrega',
  'entregue',
];

export const JOB_STATUS_LABELS: Record<JobApplication['status'], string> = {
  nova: 'Nova',
  em_analise: 'Em análise',
  contactada: 'Contactada',
  arquivada: 'Arquivada',
};
