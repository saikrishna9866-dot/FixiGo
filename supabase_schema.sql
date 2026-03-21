-- 1. Create categories table
CREATE TABLE IF NOT EXISTS users_profile (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create services table
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure new columns exist if the table was already created previously
ALTER TABLE services ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Ensure new columns exist for bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pincode TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS landmark TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_date DATE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_time TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS problem_description TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_type TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS item_count TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS problem_image TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_price NUMERIC;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN DEFAULT false;

-- Ensure new columns exist for service_providers table
ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 4.5;
ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS experience TEXT DEFAULT '3 years';
ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS phone TEXT;

-- 3. Insert Categories
INSERT INTO categories (name) VALUES
  ('Home & Repair Services'),
  ('Vehicle Services'),
  ('Construction & Labor'),
  ('Personal Services'),
  ('Professional Services'),
  ('Emergency Services')
ON CONFLICT (name) DO NOTHING;

-- 4. Insert Services
-- Note: This uses a subquery to find the correct category_id
INSERT INTO services (category_id, title, description, image_url)
SELECT id, 'Plumbing', 'Expert plumbing services for all your home needs.', 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=800&auto=format&fit=crop' FROM categories WHERE name = 'Home & Repair Services' UNION ALL
SELECT id, 'Electricians', 'Professional electrical repairs and installations.', 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=800&auto=format&fit=crop' FROM categories WHERE name = 'Home & Repair Services' UNION ALL
SELECT id, 'Carpenters', 'Custom woodwork and furniture repair.', 'https://images.unsplash.com/photo-1581147036324-c1e199e03310?q=80&w=800&auto=format&fit=crop' FROM categories WHERE name = 'Home & Repair Services' UNION ALL
SELECT id, 'Painters', 'Interior and exterior painting services.', 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=800&auto=format&fit=crop' FROM categories WHERE name = 'Home & Repair Services' UNION ALL
SELECT id, 'AC / Fridge / Washing Machine repair', 'Appliance repair and maintenance.', 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=800&auto=format&fit=crop' FROM categories WHERE name = 'Home & Repair Services' UNION ALL
SELECT id, 'Pest control', 'Comprehensive pest management solutions.', 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&auto=format&fit=crop' FROM categories WHERE name = 'Home & Repair Services' UNION ALL
SELECT id, 'House cleaning', 'Deep cleaning and regular maintenance.', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop' FROM categories WHERE name = 'Home & Repair Services' UNION ALL
SELECT id, 'Water Purifier Installation', 'Safe and clean water solutions.', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop' FROM categories WHERE name = 'Home & Repair Services' UNION ALL
SELECT id, 'False Ceiling Experts', 'Modern ceiling designs and installation.', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop' FROM categories WHERE name = 'Home & Repair Services' UNION ALL
SELECT id, 'Solar Panel Installation', 'Renewable energy solutions.', 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=800&auto=format&fit=crop' FROM categories WHERE name = 'Home & Repair Services' UNION ALL
SELECT id, 'RO Repair & Maintenance', 'Water purifier servicing.', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop' FROM categories WHERE name = 'Home & Repair Services' UNION ALL
SELECT id, 'Modular Kitchen Setup', 'Modern kitchen design and installation.', 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=800&auto=format&fit=crop' FROM categories WHERE name = 'Home & Repair Services' UNION ALL

SELECT id, 'Bike mechanics', 'Expert bike repair and maintenance.', 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=800&auto=format&fit=crop' FROM categories WHERE name = 'Vehicle Services' UNION ALL
SELECT id, 'Car mechanics', 'Professional car servicing and repairs.', 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=800&auto=format&fit=crop' FROM categories WHERE name = 'Vehicle Services' UNION ALL
SELECT id, 'Car wash / Bike wash', 'Premium cleaning for your vehicles.', 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?q=80&w=800&auto=format&fit=crop' FROM categories WHERE name = 'Vehicle Services' UNION ALL
SELECT id, 'Towing services', '24/7 breakdown assistance and towing.', 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?q=80&w=800&auto=format&fit=crop' FROM categories WHERE name = 'Vehicle Services' UNION ALL
SELECT id, 'Battery Jumpstart', 'Emergency battery assistance.', 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=800&auto=format&fit=crop' FROM categories WHERE name = 'Vehicle Services' UNION ALL
SELECT id, 'Tyre Replacement', 'On-site tyre change and repair.', 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=800&auto=format&fit=crop' FROM categories WHERE name = 'Vehicle Services' UNION ALL

SELECT id, 'Masons', 'Bricklaying, concrete, and masonry work.', 'https://images.unsplash.com/photo-1504307651254-35680f356f12?q=80&w=800&auto=format&fit=crop' FROM categories WHERE name = 'Construction & Labor' UNION ALL
SELECT id, 'Constructors / Contractors', 'Full-scale construction management.', 'https://images.unsplash.com/photo-1541888086425-d81bb19240f5?q=80&w=800&auto=format&fit=crop' FROM categories WHERE name = 'Construction & Labor' UNION ALL
SELECT id, 'Daily Wage Labor', 'Reliable labor for various tasks.', 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=800&auto=format&fit=crop' FROM categories WHERE name = 'Construction & Labor' UNION ALL
SELECT id, 'Interior Designers', 'Creative interior space planning.', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop' FROM categories WHERE name = 'Construction & Labor' UNION ALL

SELECT id, 'Tailors', 'Custom stitching and alterations.', 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=800&auto=format&fit=crop' FROM categories WHERE name = 'Personal Services' UNION ALL
SELECT id, 'Beauticians / Makeup Artists', 'Professional beauty and makeup services.', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=800&auto=format&fit=crop' FROM categories WHERE name = 'Personal Services' UNION ALL
SELECT id, 'Fitness trainers / Yoga trainers', 'Personalized fitness and yoga sessions.', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop' FROM categories WHERE name = 'Personal Services' UNION ALL
SELECT id, 'Home tutors', 'Expert tutoring for all subjects and grades.', 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=800&auto=format&fit=crop' FROM categories WHERE name = 'Personal Services' UNION ALL
SELECT id, 'Babysitters / Caretakers', 'Trusted childcare and elderly care.', 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=800&auto=format&fit=crop' FROM categories WHERE name = 'Personal Services' UNION ALL
SELECT id, 'Pet groomers / Pet trainers', 'Professional pet grooming and training.', 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=800&auto=format&fit=crop' FROM categories WHERE name = 'Personal Services' UNION ALL

SELECT id, 'Photographers / Videographers', 'Professional event photography and videography.', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop' FROM categories WHERE name = 'Professional Services' UNION ALL
SELECT id, 'Event managers', 'End-to-end event planning and management.', 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800&auto=format&fit=crop' FROM categories WHERE name = 'Professional Services' UNION ALL
SELECT id, 'Catering services', 'Delicious catering for all occasions.', 'https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=800&auto=format&fit=crop' FROM categories WHERE name = 'Professional Services' UNION ALL
SELECT id, 'Movers & Packers', 'Safe and efficient home relocation services.', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop' FROM categories WHERE name = 'Professional Services' UNION ALL
SELECT id, 'Accountants / Tax consultants', 'Expert financial and tax advisory.', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=800&auto=format&fit=crop' FROM categories WHERE name = 'Professional Services' UNION ALL

SELECT id, 'Ambulance booking', 'Quick and reliable ambulance services.', 'https://images.unsplash.com/photo-1587559070757-f72a388edbba?q=80&w=800&auto=format&fit=crop' FROM categories WHERE name = 'Emergency Services' UNION ALL
SELECT id, 'Doctor at home / Telemedicine', 'On-demand medical consultations.', 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800&auto=format&fit=crop' FROM categories WHERE name = 'Emergency Services' UNION ALL
SELECT id, 'Locksmiths', 'Emergency lock repair and key duplication.', 'https://images.unsplash.com/photo-1558025137-0b406e9cb1ad?q=80&w=800&auto=format&fit=crop' FROM categories WHERE name = 'Emergency Services' UNION ALL
-- 5. Disable RLS for all tables (Optional, for easier development)
-- ALTER TABLE users_profile DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE services DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE service_providers DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
