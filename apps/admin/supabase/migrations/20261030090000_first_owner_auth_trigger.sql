DROP TRIGGER IF EXISTS on_auth_user_created_bootstrap ON auth.users;

CREATE OR REPLACE FUNCTION public.assign_first_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.raw_app_meta_data ->> 'pyrite_owner' = 'true' THEN
    PERFORM pg_advisory_xact_lock(hashtext('pyrite_first_owner'));
    IF NOT EXISTS (
      SELECT 1 FROM public.user_roles WHERE role = 'owner'::public.app_role
    ) THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, 'owner'::public.app_role);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.assign_first_owner() FROM PUBLIC;

CREATE TRIGGER on_auth_user_created_assign_first_owner
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.assign_first_owner();
