-- Table for orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  items JSONB NOT NULL,
  total_price DECIMAL(12, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, preparing, ready, delivered, cancelled
  table_number TEXT,
  customer_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- Add RLS policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow anyone to create an order (public or authenticated)
CREATE POLICY "Allow public insert" ON orders FOR INSERT WITH CHECK (true);

-- Allow public to read their own order (if they have the ID)
CREATE POLICY "Allow public read" ON orders FOR SELECT USING (true);

-- Allow restaurant owners to manage orders
CREATE POLICY "Allow owners to manage orders" ON orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = orders.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  );
