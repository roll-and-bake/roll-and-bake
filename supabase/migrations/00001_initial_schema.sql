-- Supabase Migration: 00001_initial_schema
-- Roll & Bake Cinnabon Bakery Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: customers
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  loyalty_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id),
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'ממתין לאימות', -- 'ממתין לאימות', 'שולם', 'בתנור', 'מוכן', 'הושלם'
  delivery_method TEXT NOT NULL, -- 'pickup' or 'delivery'
  delivery_address TEXT,
  notes TEXT,
  ypay_receipt_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: order_items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL
);

-- Table: expenses
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expense_date DATE NOT NULL,
  supplier TEXT NOT NULL,
  category TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  receipt_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Only authenticated users (Admin) can manage data
CREATE POLICY "Allow all access to authenticated users" ON customers FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all access to authenticated users" ON orders FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all access to authenticated users" ON order_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all access to authenticated users" ON expenses FOR ALL TO authenticated USING (true);

-- Allow anonymous users to INSERT into orders and customers when checking out
CREATE POLICY "Allow anonymous insert orders" ON orders FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous insert order_items" ON order_items FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous insert/update customers" ON customers FOR ALL TO anon USING (true) WITH CHECK (true);
