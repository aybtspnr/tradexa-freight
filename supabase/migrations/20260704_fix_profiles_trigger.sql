-- Fix trigger to pass role from user_metadata
CREATE OR REPLACE FUNCTION freight.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO freight.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    COALESCE(
      (NEW.raw_user_meta_data ->> 'role')::freight.user_role,
      'shipper'::freight.user_role
    )
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role;
  RETURN NEW;
END;
$$;

-- Also fix signUp to pass role via user_metadata when creating auth users
-- This is handled in the frontend, but this ensures existing users get fixed too

-- Re-create the public.profiles view (was never created)
CREATE OR REPLACE VIEW public.profiles AS
SELECT * FROM freight.profiles;

GRANT ALL ON public.profiles TO anon, authenticated, service_role;
