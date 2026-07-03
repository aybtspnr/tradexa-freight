-- Fix infinite recursion in admin RLS policy
-- The original policy queried freight.profiles recursively:
--   EXISTS (SELECT 1 FROM freight.profiles WHERE id = auth.uid() AND role = 'admin')
-- This caused: "infinite recursion detected in policy for relation 'profiles'"
--
-- Fix: use a SECURITY DEFINER function to check admin role
-- (bypasses RLS on the subquery)

CREATE OR REPLACE FUNCTION freight.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM freight.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

DROP POLICY IF EXISTS "Admins can read all profiles" ON freight.profiles;
CREATE POLICY "Admins can read all profiles"
  ON freight.profiles
  FOR SELECT
  USING (freight.is_admin());
