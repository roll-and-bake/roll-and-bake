import Database from 'better-sqlite3';
import path from 'path';

// Define DB path
const dbPath = path.join(process.cwd(), 'bakery.db');

// Connect to SQLite
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Initialize schema if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    image_url TEXT,
    description TEXT,
    active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    total_amount REAL NOT NULL,
    status TEXT DEFAULT 'ממתין לאימות',
    delivery_method TEXT,
    address TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    product_id INTEGER,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY(order_id) REFERENCES orders(id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Insert default products if table is empty
const count = db.prepare('SELECT COUNT(*) as c FROM products').get() as { c: number };
if (count.c === 0) {
  const insert = db.prepare('INSERT INTO products (name, price, image_url, description) VALUES (?, ?, ?, ?)');
  insert.run('סינבון קינמון קלאסי', 20, '/סינבון בטעם קינמון קלאסי.png', 'בצק שמרים רך ונימוח במילוי קינמון עשיר.');
  insert.run('סינבון שוקולד עשיר', 22, '/סינבון בטעם שוקולד עשיר.png', 'הקלאסיקה המוכרת בגרסה שוקולדית.');
  insert.run('סינבון פקאן וקרמל', 24, '/סינבון בטעם פקאן קרמל.png', 'שילוב מעודן של מתוק ומלוח.');
}

// Ensure settings exist
const checkSetting = db.prepare('SELECT value FROM settings WHERE key = ?');
const insertSetting = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');

if (!checkSetting.get('ypay_token')) insertSetting.run('ypay_token', '');
if (!checkSetting.get('sumit_company_id')) insertSetting.run('sumit_company_id', '2422708697');
if (!checkSetting.get('sumit_api_key')) insertSetting.run('sumit_api_key', '1hvvEIVHWUz3vDAbIleFFRkBGMV1njPYFDHJ4kxChH5a3ijPhD');

// V2 Migrations:
db.exec(`
  CREATE TABLE IF NOT EXISTS bundles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    discount_percent INTEGER NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    expense_date TEXT NOT NULL,
    supplier TEXT NOT NULL,
    category TEXT NOT NULL,
    amount REAL NOT NULL,
    receipt_image_url TEXT
  );

  CREATE TABLE IF NOT EXISTS discount_tiers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    min_qty INTEGER NOT NULL,
    discount_percent INTEGER NOT NULL
  );
`);

// Add columns safely
try { db.exec("ALTER TABLE orders ADD COLUMN is_archived INTEGER DEFAULT 0;"); } catch (e) { /* ignores if exists */ }
try { db.exec("ALTER TABLE expenses ADD COLUMN is_archived INTEGER DEFAULT 0;"); } catch (e) { /* ignores if exists */ }
try { db.exec("ALTER TABLE orders ADD COLUMN archive_name TEXT;"); } catch (e) { /* ignores if exists */ }
try { db.exec("ALTER TABLE expenses ADD COLUMN archive_name TEXT;"); } catch (e) { /* ignores if exists */ }

export default db;
