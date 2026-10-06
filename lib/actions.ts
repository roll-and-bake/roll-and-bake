"use server";

import db from "./db";
import { revalidatePath } from "next/cache";

// --- Products ---
export async function getProducts() {
  return db.prepare("SELECT * FROM products ORDER BY id ASC").all() as any[];
}

export async function toggleProductActive(id: number, currentStatus: number) {
  const newStatus = currentStatus === 1 ? 0 : 1;
  db.prepare("UPDATE products SET active = ? WHERE id = ?").run(newStatus, id);
  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function updateProductPrice(id: number, price: number) {
  db.prepare("UPDATE products SET price = ? WHERE id = ?").run(price, id);
  revalidatePath("/admin/products");
  revalidatePath("/");
}

// --- Orders ---
export async function createOrder(data: any) {
  const { customerName, phone, email, totalAmount, deliveryMethod, address, receiptPreference, notes, items } = data;
  
  const insertOrder = db.prepare(`
    INSERT INTO orders (customer_name, phone, email, total_amount, delivery_method, address, receipt_preference, notes, is_archived)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
  `);
  
  const result = insertOrder.run(customerName, phone, email, totalAmount, deliveryMethod, address, receiptPreference || "whatsapp", notes);
  const orderId = result.lastInsertRowid;
  
  const insertItem = db.prepare(`
    INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  const insertMany = db.transaction((items) => {
    for (const item of items) {
      insertItem.run(orderId, item.id, item.name, item.quantity, item.price);
    }
  });
  
  insertMany(items);
    generateSumitReceipt(Number(orderId));
  
  revalidatePath("/admin");
  revalidatePath("/admin/pipeline");
  
  return { success: true, orderId };
}

export async function getOrders() {
  const orders = db.prepare("SELECT * FROM orders WHERE is_archived = 0 OR is_archived IS NULL ORDER BY created_at DESC").all() as any[];
  for (const order of orders) {
    order.items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(order.id);
  }
  return orders;
}

export async function updateOrderStatus(id: number, status: string) {
  db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, id);
  revalidatePath("/admin/pipeline");
  revalidatePath("/admin");
}

// --- Settings (YPAY & Store) ---
export async function getSettings() {
  const rows = db.prepare("SELECT * FROM settings").all() as {key: string, value: string}[];
  const settings: Record<string, string> = {};
  for (const row of rows) settings[row.key] = row.value;
  return settings;
}

export async function updateSetting(key: string, value: string) {
  const existing = db.prepare("SELECT * FROM settings WHERE key = ?").get(key);
  if (existing) {
    db.prepare("UPDATE settings SET value = ? WHERE key = ?").run(value, key);
  } else {
    db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run(key, value);
  }
  revalidatePath("/");
  revalidatePath("/admin/settings");
}

export async function updateYpayToken(token: string) {
  db.prepare("UPDATE settings SET value = ? WHERE key = 'ypay_token'").run(token);
  revalidatePath("/admin");
}

// --- Dashboard Stats ---
export async function getDashboardStats() {
  const totalRevenue = (db.prepare("SELECT SUM(total_amount) as total FROM orders WHERE status != 'בוטל' AND (is_archived = 0 OR is_archived IS NULL)").get() as any).total || 0;
  const openOrders = (db.prepare("SELECT COUNT(*) as count FROM orders WHERE status NOT IN ('מוכן לאיסוף', 'הושלם', 'בוטל') AND (is_archived = 0 OR is_archived IS NULL)").get() as any).count || 0;
  const totalCustomers = (db.prepare("SELECT COUNT(DISTINCT phone) as count FROM orders WHERE (is_archived = 0 OR is_archived IS NULL)").get() as any).count || 0;
  
  return {
    totalRevenue,
    openOrders,
    totalCustomers
  };
}

// --- Bundles / Physical Packaging ---
export async function getBundles() {
  return db.prepare("SELECT * FROM bundles ORDER BY capacity ASC").all() as any[];
}

export async function addBundle(name: string, capacity: number, discount_percent: number) {
  db.prepare("INSERT INTO bundles (name, capacity, discount_percent) VALUES (?, ?, ?)").run(name, capacity, discount_percent);
  revalidatePath("/admin/products");
}

export async function updateBundle(id: number, name: string, capacity: number, discount_percent: number) {
  db.prepare("UPDATE bundles SET name = ?, capacity = ?, discount_percent = ? WHERE id = ?").run(name, capacity, discount_percent, id);
  revalidatePath("/admin/products");
}

export async function deleteBundle(id: number) {
  db.prepare("DELETE FROM bundles WHERE id = ?").run(id);
  revalidatePath("/admin/products");
}

// --- Discount Tiers (Quantity based) ---
export async function getDiscountTiers() {
  return db.prepare("SELECT * FROM discount_tiers ORDER BY min_qty ASC").all() as any[];
}

export async function addDiscountTier(min_qty: number, discount_percent: number) {
  db.prepare("INSERT INTO discount_tiers (min_qty, discount_percent) VALUES (?, ?)").run(min_qty, discount_percent);
  revalidatePath("/admin/products");
  revalidatePath("/admin/settings");
  revalidatePath("/");
}

export async function deleteDiscountTier(id: number) {
  db.prepare("DELETE FROM discount_tiers WHERE id = ?").run(id);
  revalidatePath("/admin/products");
  revalidatePath("/admin/settings");
  revalidatePath("/");
}

// --- Expenses ---
export async function getExpenses() {
  return db.prepare("SELECT * FROM expenses WHERE is_archived = 0 OR is_archived IS NULL ORDER BY expense_date DESC").all() as any[];
}

export async function addExpense(data: any) {
  const { date, supplier, category, amount, receipt_image_url } = data;
  db.prepare(`
    INSERT INTO expenses (expense_date, supplier, category, amount, receipt_image_url, is_archived) 
    VALUES (?, ?, ?, ?, ?, 0)
  `).run(date, supplier, category, amount, receipt_image_url || null);
  revalidatePath("/admin/expenses");
}

// --- Product Edits ---
export async function updateProductDetails(id: number, name: string, description: string, price: number, image_url: string) {
  db.prepare("UPDATE products SET name = ?, description = ?, price = ?, image_url = ? WHERE id = ?").run(name, description, price, image_url, id);
  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function addProduct(name: string, description: string, price: number, image_url: string) {
  db.prepare("INSERT INTO products (name, description, price, image_url) VALUES (?, ?, ?, ?)").run(name, description, price, image_url);
  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function deleteProduct(id: number) {
  db.prepare("DELETE FROM products WHERE id = ?").run(id);
  revalidatePath("/admin/products");
  revalidatePath("/");
}

// --- Data Reset & Archive ---
export async function archiveAllData(archiveName: string) {
  if (!archiveName) throw new Error("Archive name is required");
  db.prepare("UPDATE orders SET is_archived = 1, archive_name = ? WHERE is_archived = 0 OR is_archived IS NULL").run(archiveName);
  db.prepare("UPDATE expenses SET is_archived = 1, archive_name = ? WHERE is_archived = 0 OR is_archived IS NULL").run(archiveName);
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/pipeline");
  revalidatePath("/admin/expenses");
}

export async function deleteAllData() {
  db.prepare("DELETE FROM order_items").run();
  db.prepare("DELETE FROM orders").run();
  db.prepare("DELETE FROM expenses").run();
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/pipeline");
  revalidatePath("/admin/expenses");
}

// --- Archives Queries ---
export async function getArchiveNames() {
  const rows = db.prepare(`
    SELECT DISTINCT archive_name FROM orders WHERE is_archived = 1 AND archive_name IS NOT NULL
    UNION
    SELECT DISTINCT archive_name FROM expenses WHERE is_archived = 1 AND archive_name IS NOT NULL
  `).all() as { archive_name: string }[];
  return rows.map(r => r.archive_name).filter(Boolean);
}

export async function getArchiveData(archiveName: string) {
  const orders = db.prepare("SELECT * FROM orders WHERE is_archived = 1 AND archive_name = ? ORDER BY created_at DESC").all(archiveName) as any[];
  const expenses = db.prepare("SELECT * FROM expenses WHERE is_archived = 1 AND archive_name = ? ORDER BY expense_date DESC").all(archiveName) as any[];
  
  for (const order of orders) {
    order.items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(order.id);
  }
  
  return { orders, expenses };
}

import { writeFile } from "fs/promises";
import path from "path";

export async function uploadImage(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) throw new Error("No file uploaded");

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const filename = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;
  const filepath = path.join(process.cwd(), "public", "uploads", filename);
  
  await writeFile(filepath, buffer);
  
  return `/uploads/${filename}`;
}
async function generateSumitReceipt(orderId: number) {
  try {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as any;
    if (!order) return;
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId) as any[];

    const sumitCompanyId = db.prepare("SELECT value FROM settings WHERE key = 'sumit_company_id'").get() as any;
    const sumitApiKey = db.prepare("SELECT value FROM settings WHERE key = 'sumit_api_key'").get() as any;

    if (!sumitCompanyId?.value || !sumitApiKey?.value) {
      console.log('Sumit credentials missing, skipping receipt generation.');
      return;
    }

    const payload = {
      Credentials: {
        CompanyID: parseInt(sumitCompanyId.value),
        APIKey: sumitApiKey.value
      },
      Details: {
        Type: 2, 
        Customer: {
          Name: order.customer_name,
          Phone: order.phone,
          EmailAddress: order.email || ''
        },
        SendByEmail: order.email ? {
          EmailAddress: order.email,
          Original: true
        } : undefined
      },
      Payments: [
        {
          Amount: order.total_amount,
          Type: 6 
        }
      ],
      Items: items.map(item => ({
        Quantity: item.quantity,
        UnitPrice: item.price,
        TotalPrice: item.price * item.quantity,
        Item: {
          Name: item.product_name
        }
      })),
      VATIncluded: true
    };

    const res = await fetch('https://api.sumit.co.il/accounting/documents/create/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log('Sumit Response:', data);
  } catch (err) {
    console.error('Failed to generate Sumit receipt:', err);
  }
}
