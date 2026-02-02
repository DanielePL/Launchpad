-- =============================================================================
-- Fix: Add INSERT policy for organizations table
-- Allows authenticated users to create new organizations
-- =============================================================================

-- Allow authenticated users to insert new organizations
CREATE POLICY "org_insert_authenticated" ON public.organizations
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Also need to allow users to insert themselves as members of the new org
-- Update existing members_insert_admin policy to also allow first member (owner)
DROP POLICY IF EXISTS "members_insert_admin" ON public.organization_members;

CREATE POLICY "members_insert" ON public.organization_members
  FOR INSERT TO authenticated
  WITH CHECK (
    -- Allow if user is admin of the org
    public.is_organization_admin(organization_id)
    OR
    -- Allow if inserting self as owner (for new org creation)
    (user_id = auth.uid() AND role = 'owner' AND NOT EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_id = organization_members.organization_id
    ))
  );

-- Ensure user_profiles allows INSERT for new users
DROP POLICY IF EXISTS "profile_insert" ON public.user_profiles;
CREATE POLICY "profile_insert" ON public.user_profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
