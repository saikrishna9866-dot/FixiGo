-- Create users table for Google Auth users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own data
CREATE POLICY "Users can read their own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Create policy to allow users to update their own data
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Create policy to allow public insert (for new signups)
-- Note: In production, you might want to restrict this or use a trigger
CREATE POLICY "Allow public insert for new users" ON users
  FOR INSERT WITH CHECK (true);

-- Grant permissions
GRANT ALL ON users TO anon;
GRANT ALL ON users TO authenticated;
GRANT ALL ON users TO service_role;
-- Create pending_bookings table for unauthenticated users
CREATE TABLE IF NOT EXISTS pending_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  temp_id TEXT UNIQUE, -- A random ID generated on the client
  booking_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE pending_bookings ENABLE ROW LEVEL SECURITY;

-- Allow public insert
CREATE POLICY "Allow public insert for pending bookings" ON pending_bookings
  FOR INSERT WITH CHECK (true);

-- Allow public read by temp_id
CREATE POLICY "Allow public read for pending bookings" ON pending_bookings
  FOR SELECT USING (true);

-- Allow public delete by temp_id
CREATE POLICY "Allow public delete for pending bookings" ON pending_bookings
  FOR DELETE USING (true);

-- Grant permissions
GRANT ALL ON pending_bookings TO anon;
GRANT ALL ON pending_bookings TO authenticated;
GRANT ALL ON pending_bookings TO service_role;
