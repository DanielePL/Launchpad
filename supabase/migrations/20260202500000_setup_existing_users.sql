-- =============================================================================
-- Setup Existing Users for Multi-Tenant System
-- Adds existing auth.users to user_profiles and default organization
-- =============================================================================

-- Default organization ID from the foundation migration
DO $$
DECLARE
  default_org_id uuid := '00000000-0000-0000-0000-000000000001';
  user_record RECORD;
BEGIN
  -- Create user_profiles for any users that don't have one
  INSERT INTO public.user_profiles (id, email, full_name)
  SELECT
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1))
  FROM auth.users u
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_profiles p WHERE p.id = u.id
  )
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE 'Created user_profiles for existing users';

  -- Add all users to the default organization if not already a member
  INSERT INTO public.organization_members (organization_id, user_id, role)
  SELECT
    default_org_id,
    u.id,
    'admin'  -- Give existing users admin role
  FROM auth.users u
  WHERE NOT EXISTS (
    SELECT 1 FROM public.organization_members m
    WHERE m.user_id = u.id AND m.organization_id = default_org_id
  )
  ON CONFLICT (organization_id, user_id) DO NOTHING;

  RAISE NOTICE 'Added existing users to default organization';

  -- Set current_organization_id for all users who don't have one
  UPDATE public.user_profiles
  SET current_organization_id = default_org_id
  WHERE current_organization_id IS NULL;

  RAISE NOTICE 'Set default organization for all users';
END $$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.organizations TO authenticated;
GRANT SELECT, UPDATE ON public.user_profiles TO authenticated;
GRANT SELECT ON public.organization_members TO authenticated;

-- Also ensure anon can access for initial data fetch (will be blocked by RLS for unauthorized)
GRANT SELECT ON public.organizations TO anon;
GRANT SELECT ON public.user_profiles TO anon;
GRANT SELECT ON public.organization_members TO anon;
GRANT SELECT, INSERT ON public.login_audit_logs TO anon;
