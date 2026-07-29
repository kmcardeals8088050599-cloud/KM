-- KM Car Deals Supabase Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Cars table
CREATE TABLE IF NOT EXISTS cars (
  id TEXT PRIMARY KEY DEFAULT 'car-' || extract(epoch from now()) || '-' || substr(md5(random()::text), 1, 6),
  title TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  variant TEXT DEFAULT '',
  year INTEGER NOT NULL DEFAULT 2022,
  price NUMERIC(10,2) NOT NULL DEFAULT 10,
  raw_price BIGINT NOT NULL DEFAULT 1000000,
  original_price NUMERIC(10,2),
  kilometers INTEGER NOT NULL DEFAULT 0,
  fuel_type TEXT NOT NULL DEFAULT 'Petrol',
  transmission TEXT NOT NULL DEFAULT 'Manual',
  body_type TEXT NOT NULL DEFAULT 'SUV',
  owner_count TEXT DEFAULT '1st Owner',
  color TEXT DEFAULT 'Black',
  location TEXT DEFAULT 'Kalaburagi',
  status TEXT NOT NULL DEFAULT 'Available',
  is_featured BOOLEAN DEFAULT true,
  is_certified BOOLEAN DEFAULT true,
  registration_year INTEGER,
  insurance_type TEXT DEFAULT 'Comprehensive',
  engine_capacity TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  description TEXT DEFAULT '',
  specs JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY DEFAULT 'lead-' || extract(epoch from now()) || '-' || substr(md5(random()::text), 1, 6),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  car_id TEXT,
  car_title TEXT,
  type TEXT DEFAULT 'Inquiry',
  message TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'New',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Exchange requests table
CREATE TABLE IF NOT EXISTS exchange_requests (
  id TEXT PRIMARY KEY DEFAULT 'ex-' || extract(epoch from now()) || '-' || substr(md5(random()::text), 1, 6),
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  current_brand TEXT NOT NULL,
  current_model TEXT NOT NULL,
  current_year INTEGER DEFAULT 2020,
  current_kilometers INTEGER DEFAULT 50000,
  fuel_type TEXT DEFAULT 'Petrol',
  transmission TEXT DEFAULT 'Manual',
  expected_price NUMERIC(10,2) DEFAULT 0,
  comments TEXT DEFAULT '',
  images JSONB DEFAULT '[]'::jsonb,
  target_car_id TEXT,
  target_car_title TEXT,
  status TEXT NOT NULL DEFAULT 'New',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Users table (for admin auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'Admin',
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cars_brand ON cars(brand);
CREATE INDEX IF NOT EXISTS idx_cars_status ON cars(status);
CREATE INDEX IF NOT EXISTS idx_cars_body_type ON cars(body_type);
CREATE INDEX IF NOT EXISTS idx_cars_fuel_type ON cars(fuel_type);
CREATE INDEX IF NOT EXISTS idx_cars_is_featured ON cars(is_featured);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_exchange_requests_status ON exchange_requests(status);

-- Row Level Security (RLS) - Enable on all tables
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Public read access for cars (anyone can browse inventory)
CREATE POLICY "Public can view cars" ON cars FOR SELECT USING (true);

-- Authenticated full access for cars (admin CRUD)
CREATE POLICY "Admin full access on cars" ON cars FOR ALL USING (true) WITH CHECK (true);

-- Public can insert leads and exchange requests (forms)
CREATE POLICY "Public can submit leads" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can submit exchanges" ON exchange_requests FOR INSERT WITH CHECK (true);

-- Admin can read/update leads
CREATE POLICY "Admin full access on leads" ON leads FOR ALL USING (true) WITH CHECK (true);

-- Admin can read/update exchange requests
CREATE POLICY "Admin full access on exchanges" ON exchange_requests FOR ALL USING (true) WITH CHECK (true);

-- Users table - no public access
CREATE POLICY "No public user access" ON users FOR ALL USING (false) WITH CHECK (false);

-- ── PRICE DROP ALERTS TABLE (Feature 7) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS price_alerts (
  id TEXT PRIMARY KEY,
  car_id TEXT NOT NULL,
  car_title TEXT NOT NULL,
  phone TEXT NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notified_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_price_alerts_car ON price_alerts(car_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_phone ON price_alerts(phone);
CREATE INDEX IF NOT EXISTS idx_price_alerts_active ON price_alerts(is_active);
