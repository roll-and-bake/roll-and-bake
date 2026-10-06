const db = require('better-sqlite3')('bakery.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS bundles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    discount_percent REAL NOT NULL DEFAULT 0
  );
`);

const count = db.prepare('SELECT COUNT(*) as c FROM bundles').get();
if (count.c === 0) {
  const insert = db.prepare('INSERT INTO bundles (name, capacity, discount_percent) VALUES (?, ?, ?)');
  insert.run('מארז זוגי', 2, 5);
  insert.run('מארז שלישייה', 3, 8);
  insert.run('מארז שישייה', 6, 15);
  console.log("Bundles seeded.");
}

try {
  db.exec('ALTER TABLE orders ADD COLUMN receipt_preference TEXT DEFAULT "whatsapp"');
  console.log("Added receipt_preference to orders.");
} catch(e) {
  // column might already exist
}

console.log("Migration complete.");
db.exec('CREATE TABLE IF NOT EXISTS expenses (id INTEGER PRIMARY KEY AUTOINCREMENT, expense_date TEXT NOT NULL, supplier TEXT NOT NULL, category TEXT NOT NULL, amount REAL NOT NULL, receipt_image_url TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);'); console.log('Expenses created');
