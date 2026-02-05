-- =============================================================================
-- Fix: New User Flow - Organizations Access
-- Problem: New users get 403 when trying to access organizations
-- =============================================================================

-- 1. Grant INSERT on organizations (missing from tenant_rls_policies.sql)
GRANT INSERT ON public.organizations TO authenticated;

-- 2. Also ensure user_profiles has INSERT grant for new users
GRANT INSERT ON public.user_profiles TO authenticated;

-- 3. organization_members needs INSERT for self-add as owner
GRANT INSERT ON public.organization_members TO authenticated;

-- 4. Add a policy for users to see their own profile even without org membership
DROP POLICY IF EXISTS "profile_select_own" ON public.user_profiles;
CREATE POLICY "profile_select_own" ON public.user_profiles
  FOR SELECT TO authenticated
  USING (
    -- Always allow users to see their own profile
    id = auth.uid()
    OR
    -- Allow seeing profiles of people in same org
    EXISTS (
      SELECT 1 FROM public.organization_members om1
      JOIN public.organization_members om2 ON om1.organization_id = om2.organization_id
      WHERE om1.user_id = auth.uid() AND om2.user_id = user_profiles.id
    )
  );

-- 5. Ensure the members_insert policy exists and allows owner self-insert
DROP POLICY IF EXISTS "members_insert" ON public.organization_members;
DROP POLICY IF EXISTS "members_insert_admin" ON public.organization_members;

CREATE POLICY "members_insert" ON public.organization_members
  FOR INSERT TO authenticated
  WITH CHECK (
    -- Allow if user is admin of the org
    public.is_organization_admin(organization_id)
    OR
    -- Allow if inserting self as owner (for new org creation)
    (user_id = auth.uid() AND role = 'owner' AND NOT EXISTS (
      SELECT 1 FROM public.organization_members existing
      WHERE existing.organization_id = organization_members.organization_id
    ))
  );

-- 6. Ensure org_insert policy exists
DROP POLICY IF EXISTS "org_insert_authenticated" ON public.organizations;
CREATE POLICY "org_insert_authenticated" ON public.organizations
  FOR INSERT TO authenticated
  WITH CHECK (true);
