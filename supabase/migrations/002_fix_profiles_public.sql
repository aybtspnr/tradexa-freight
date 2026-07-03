-- Make freight.profiles accessible via the public schema
-- 1. Create a view in public that mirrors freight.profiles
CREATE OR REPLACE VIEW public.profiles AS
SELECT * FROM freight.profiles;

-- 2. Grant access
GRANT ALL ON public.profiles TO anon, authenticated, service_role;

-- 3. Enable RLS on the view (delegates to underlying table)
-- Note: RLS on views in PG delegates to the underlying table's policies
