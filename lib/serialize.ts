import type { Activity, Category, Courier, JobApplication, Municipality, Partner, Product } from './types';

export function rowToProduct(row: Record<string, unknown>): Product {
  return {
    id: String(row.id),
    name: String(row.name),
    description: String(row.description || ''),
    price: Number(row.price),
    category: String(row.category) as Category,
    image: String(row.image || ''),
    tags: JSON.parse(String(row.tags || '[]')),
    available: Boolean(row.available),
    featured: Boolean(row.featured),
    sort: Number(row.sort || 0),
  };
}

export function rowToMunicipality(row: Record<string, unknown>): Municipality {
  return {
    id: Number(row.id),
    name: String(row.name),
    province: String(row.province || 'Luanda'),
    baseFee: Number(row.base_fee),
    perKm: Number(row.per_km),
    distanceKm: Number(row.distance_km),
    estMinutes: Number(row.est_minutes),
    adjustment: Number(row.adjustment || 0),
    active: Boolean(row.active),
    sort: Number(row.sort || 0),
  };
}

export function rowToPartner(row: Record<string, unknown>): Partner {
  return {
    id: Number(row.id),
    name: String(row.name),
    description: String(row.description || ''),
    image: String(row.image || ''),
    url: String(row.url || ''),
    active: Boolean(row.active),
    sort: Number(row.sort || 0),
  };
}

export function rowToActivity(row: Record<string, unknown>): Activity {
  return {
    id: Number(row.id),
    title: String(row.title),
    description: String(row.description || ''),
    image: String(row.image || ''),
    eventDate: String(row.event_date || ''),
    location: String(row.location || ''),
    active: Boolean(row.active),
    sort: Number(row.sort || 0),
  };
}

export function rowToCourier(row: Record<string, unknown>): Courier {
  return {
    id: Number(row.id),
    name: String(row.name),
    phone: String(row.phone || ''),
    motorcycle: String(row.motorcycle || ''),
    zone: String(row.zone || ''),
    available: Boolean(row.available),
    rating: Number(row.rating || 5),
    active: Boolean(row.active),
  };
}

export function rowToJob(row: Record<string, unknown>): JobApplication {
  return {
    id: Number(row.id),
    name: String(row.name),
    phone: String(row.phone),
    email: String(row.email || ''),
    position: String(row.position),
    message: String(row.message || ''),
    status: String(row.status) as JobApplication['status'],
    createdAt: String(row.created_at),
  };
}
