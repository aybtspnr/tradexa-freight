-- Migration: 00001_create_schema_freight
-- Description: Create freight schema, profiles table, and auto-profile trigger

-- 1. Create freight schema
CREATE SCHEMA IF NOT EXISTS freight;

-- 2. Create user_role enum
DO $$ BEGIN
  CREATE TYPE freight.user_role AS ENUM ('carrier', 'shipper', 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 3. Create profiles table
CREATE TABLE IF NOT EXISTS freight.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  name        TEXT,
  role        freight.user_role NOT NULL DEFAULT 'shipper',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Enable Row Level Security
ALTER TABLE freight.profiles ENABLE ROW LEVEL SECURITY;

-- 5. RLS policies
-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON freight.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON freight.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON freight.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM freight.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 6. Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION freight.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO freight.profiles (id, email, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- 7. Trigger on auth.users to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION freight.handle_new_user();

-- 8. Grant usage
GRANT USAGE ON SCHEMA freight TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA freight TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA freight TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA freight TO anon, authenticated, service_role;
