-- StayNest Kenya Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar VARCHAR(255),
  is_host BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  price_per_night INTEGER NOT NULL,
  beds INTEGER DEFAULT 1,
  baths INTEGER DEFAULT 1,
  max_guests INTEGER DEFAULT 2,
  highlight VARCHAR(100),
  amenities TEXT[],
  images TEXT[],
  host_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  rating NUMERIC(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL,
  checkout_date DATE NOT NULL,
  guests INTEGER NOT NULL,
  nights INTEGER NOT NULL,
  total_amount INTEGER NOT NULL,
  service_fee INTEGER NOT NULL,
  payment_method VARCHAR(20) DEFAULT 'mpesa',
  status VARCHAR(20) DEFAULT 'confirmed',
  booking_ref VARCHAR(20) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seed properties data
INSERT INTO properties (title, location, category, price_per_night, beds, baths, max_guests, highlight, amenities, images, rating, review_count) VALUES
(
  'Diani Oceanfront Villa',
  'Diani Beach, Kwale County',
  'beach',
  18500,
  4, 3, 8,
  'Beachfront',
  ARRAY['Infinity Pool', 'Private Beach', 'Full Kitchen', 'WiFi', 'Air Conditioning', 'Outdoor BBQ', 'Daily Housekeeping', 'Beach Towels'],
  ARRAY['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80', 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80'],
  4.95, 128
),
(
  'Maasai Mara Bush Cottage',
  'Narok County, Maasai Mara',
  'safari',
  24000,
  2, 2, 4,
  'Wildlife Views',
  ARRAY['Game Drives', 'Private Deck', 'Bush Breakfast', 'WiFi', 'Solar Power', 'Outdoor Shower', 'Guided Walks', 'Campfire'],
  ARRAY['https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&q=80', 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&q=80'],
  4.98, 87
),
(
  'Aberdare Forest Retreat',
  'Nyeri County, Central Kenya',
  'mountain',
  9800,
  3, 2, 6,
  'Forest Views',
  ARRAY['Fireplace', 'Mountain Views', 'Hiking Trails', 'Full Kitchen', 'Library', 'Garden', 'BBQ Grill', 'Free Parking'],
  ARRAY['https://images.unsplash.com/photo-1601918774946-25832a4be0d6?w=800&q=80', 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80'],
  4.88, 54
),
(
  'Nairobi Westlands Penthouse',
  'Westlands, Nairobi',
  'city',
  12500,
  2, 2, 4,
  'Skyline Views',
  ARRAY['City Views', 'Rooftop Pool', 'Gym Access', 'WiFi', 'Smart TV', 'Concierge', 'Parking', 'Air Conditioning'],
  ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'],
  4.82, 211
),
(
  'Lake Naivasha Floating Cottage',
  'Naivasha, Nakuru County',
  'lakeside',
  11200,
  2, 1, 4,
  'Lakefront',
  ARRAY['Lake Access', 'Kayaks', 'Fishing Gear', 'Deck', 'Full Kitchen', 'WiFi', 'Bird Watching', 'Boat Tours'],
  ARRAY['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&q=80'],
  4.91, 73
),
(
  'Limuru Tea Farm Cottage',
  'Limuru, Kiambu County',
  'farm',
  6500,
  2, 1, 4,
  'Tea Farm',
  ARRAY['Tea Factory Tour', 'Farm Activities', 'Rift Valley Views', 'Full Kitchen', 'Fireplace', 'Gardens', 'Parking', 'WiFi'],
  ARRAY['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80'],
  4.79, 39
),
(
  'Watamu Coral Reef Bungalow',
  'Watamu, Kilifi County',
  'beach',
  14800,
  3, 2, 6,
  'Marine Park',
  ARRAY['Beach Access', 'Snorkeling Gear', 'Garden', 'Full Kitchen', 'Outdoor Shower', 'WiFi', 'Bicycle Hire', 'BBQ'],
  ARRAY['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80', 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80'],
  4.93, 96
),
(
  'Samburu Desert Lodge',
  'Samburu County, Northern Kenya',
  'safari',
  21000,
  1, 1, 2,
  'Rare Wildlife',
  ARRAY['Game Drives', 'River Deck', 'Full Board', 'Stargazing', 'Cultural Visits', 'Sundowners', 'Laundry', 'WiFi'],
  ARRAY['https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=800&q=80', 'https://images.unsplash.com/photo-1533044309907-0fa3413da946?w=800&q=80'],
  4.97, 62
)
ON CONFLICT DO NOTHING;
