import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { initialActivities, initialCouriers, initialMunicipalities, initialPartners, initialProducts } from './catalog';

const DB_FILE = process.env.DB_FILE || path.join(process.cwd(), 'data', 'aliado-food.db');

type GlobalWithDb = typeof globalThis & { __aliadoDb?: Database.Database };

function createDb(): Database.Database {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
  const db = new Database(DB_FILE);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  migrate(db);
  seed(db);
  return db;
}

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      price REAL NOT NULL,
      category TEXT NOT NULL,
      image TEXT NOT NULL DEFAULT '',
      tags TEXT NOT NULL DEFAULT '[]',
      available INTEGER NOT NULL DEFAULT 1,
      featured INTEGER NOT NULL DEFAULT 0,
      sort INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS municipalities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      province TEXT NOT NULL DEFAULT 'Luanda',
      base_fee REAL NOT NULL DEFAULT 292.5,
      per_km REAL NOT NULL DEFAULT 51.3,
      distance_km REAL NOT NULL DEFAULT 2.5,
      est_minutes INTEGER NOT NULL DEFAULT 20,
      adjustment REAL NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      sort INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS partners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      image TEXT NOT NULL DEFAULT '',
      url TEXT NOT NULL DEFAULT '',
      active INTEGER NOT NULL DEFAULT 1,
      sort INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      image TEXT NOT NULL DEFAULT '',
      event_date TEXT NOT NULL DEFAULT '',
      location TEXT NOT NULL DEFAULT '',
      active INTEGER NOT NULL DEFAULT 1,
      sort INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS couriers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      motorcycle TEXT NOT NULL DEFAULT '',
      zone TEXT NOT NULL DEFAULT '',
      available INTEGER NOT NULL DEFAULT 1,
      rating REAL NOT NULL DEFAULT 5,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ref TEXT NOT NULL UNIQUE,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT NOT NULL DEFAULT '',
      delivery_type TEXT NOT NULL,
      municipality_id INTEGER,
      municipality_name TEXT NOT NULL DEFAULT '',
      bairro TEXT NOT NULL DEFAULT '',
      rua TEXT NOT NULL DEFAULT '',
      address_notes TEXT NOT NULL DEFAULT '',
      delivery_fee REAL NOT NULL DEFAULT 0,
      subtotal REAL NOT NULL,
      total REAL NOT NULL,
      payment_method TEXT NOT NULL DEFAULT 'Dinheiro na entrega',
      status TEXT NOT NULL DEFAULT 'pendente',
      courier_id INTEGER,
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      qty INTEGER NOT NULL,
      notes TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS order_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      status TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL DEFAULT '',
      position TEXT NOT NULL,
      message TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'nova',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

export function deliveryFeeByDistance(m: {
  baseFee: number;
  perKm: number;
  distanceKm: number;
  adjustment: number;
}): number {
  const included = 2.3;
  const raw = Math.max(m.baseFee, m.baseFee + m.perKm * Math.max(0, m.distanceKm - included)) + m.adjustment;
  return Math.ceil(raw / 50) * 50;
}

const b = (v: boolean | number): number => (v ? 1 : 0);

function seed(db: Database.Database) {
  const productCount = (db.prepare('SELECT COUNT(*) c FROM products').get() as { c: number }).c;
  if (productCount === 0) {
    const stmt = db.prepare(
      `INSERT INTO products (id, name, description, price, category, image, tags, available, featured, sort)
       VALUES (@id, @name, @description, @price, @category, @image, @tags, @available, @featured, @sort)`,
    );
    const tx = db.transaction((rows: typeof initialProducts) => {
      for (const p of rows)
        stmt.run({
          ...p,
          tags: JSON.stringify(p.tags),
          available: b(p.available),
          featured: b(p.featured),
        });
    });
    tx(initialProducts);
  }

  const munCount = (db.prepare('SELECT COUNT(*) c FROM municipalities').get() as { c: number }).c;
  if (munCount === 0) {
    const stmt = db.prepare(
      `INSERT INTO municipalities (id, name, province, base_fee, per_km, distance_km, est_minutes, adjustment, active, sort)
       VALUES (@id, @name, @province, @baseFee, @perKm, @distanceKm, @estMinutes, @adjustment, @active, @sort)`,
    );
    const tx = db.transaction((rows: typeof initialMunicipalities) => {
      for (const m of rows) stmt.run({ ...m, active: b(m.active) });
    });
    tx(initialMunicipalities);
  }

  const partnerCount = (db.prepare('SELECT COUNT(*) c FROM partners').get() as { c: number }).c;
  if (partnerCount === 0) {
    const stmt = db.prepare(
      `INSERT INTO partners (id, name, description, image, url, active, sort)
       VALUES (@id, @name, @description, @image, @url, @active, @sort)`,
    );
    const tx = db.transaction((rows: typeof initialPartners) => {
      for (const p of rows) stmt.run({ ...p, active: b(p.active) });
    });
    tx(initialPartners);
  }

  const activityCount = (db.prepare('SELECT COUNT(*) c FROM activities').get() as { c: number }).c;
  if (activityCount === 0) {
    const stmt = db.prepare(
      `INSERT INTO activities (id, title, description, image, event_date, location, active, sort)
       VALUES (@id, @title, @description, @image, @eventDate, @location, @active, @sort)`,
    );
    const tx = db.transaction((rows: typeof initialActivities) => {
      for (const a of rows) stmt.run({ ...a, active: b(a.active) });
    });
    tx(initialActivities);
  }

  const courierCount = (db.prepare('SELECT COUNT(*) c FROM couriers').get() as { c: number }).c;
  if (courierCount === 0) {
    const stmt = db.prepare(
      `INSERT INTO couriers (id, name, phone, motorcycle, zone, available, rating, active)
       VALUES (@id, @name, @phone, @motorcycle, @zone, @available, @rating, @active)`,
    );
    const tx = db.transaction((rows: typeof initialCouriers) => {
      for (const c of rows) stmt.run({ ...c, available: b(c.available), active: b(c.active) });
    });
    tx(initialCouriers);
  }
}

export function getDb(): Database.Database {
  const g = globalThis as GlobalWithDb;
  if (!g.__aliadoDb) {
    g.__aliadoDb = createDb();
  }
  return g.__aliadoDb;
}
