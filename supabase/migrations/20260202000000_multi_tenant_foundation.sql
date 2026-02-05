-- =============================================================================
-- LaunchPad Multi-Tenant Foundation
-- Phase 1 & 2: Core tables for multi-tenancy
-- =============================================================================

-- Enable pgcrypto extension for gen_random_bytes
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================================================
-- 1. ORGANIZATIONS (Tenants)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,  -- URL-friendly: "my-company"

  -- Stripe Billing
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text NOT NULL DEFAULT 'trialing'
    CHECK (subscription_status IN ('trialing', 'active', 'past_due', 'canceled', 'incomplete')),
  subscription_plan text NOT NULL DEFAULT 'starter'
    CHECK (subscription_plan IN ('starter', 'professional', 'enterprise')),
  trial_ends_at timestamptz DEFAULT (now() + interval '14 days'),

  -- Limits (can be overridden per org)
  max_seats integer NOT NULL DEFAULT 3,
  max_creators integer NOT NULL DEFAULT 50,

  -- Metadata
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_stripe_customer ON public.organizations(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_organizations_subscription_status ON public.organizations(subscription_status);

-- =============================================================================
-- 2. USER PROFILES
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  current_organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_current_org ON public.user_profiles(current_organization_id);

-- =============================================================================
-- 3. ORGANIZATION MEMBERS (Links users to orgs)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member'
    CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  permissions text[] DEFAULT '{}',  -- Custom permission overrides
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE(organization_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_role ON public.organization_members(role);

-- =============================================================================
-- 4. ORGANIZATION INVITATIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.organization_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'member'
    CHECK (role IN ('admin', 'member', 'viewer')),  -- Can't invite as owner
  token text UNIQUE NOT NULL DEFAULT replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE(organization_id, email)  -- One invite per email per org
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_org_invitations_org_id ON public.organization_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_invitations_email ON public.organization_invitations(email);
CREATE INDEX IF NOT EXISTS idx_org_invitations_token ON public.organization_invitations(token);
CREATE INDEX IF NOT EXISTS idx_org_invitations_expires ON public.organization_invitations(expires_at);

-- =============================================================================
-- 5. ADD organization_id TO EXISTING TABLES
-- =============================================================================

-- Tasks
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.task_projects
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Sales
ALTER TABLE public.sales_leads
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.sales_notes
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Contracts & Files
ALTER TABLE public.creator_contracts
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.team_files
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Task related tables
ALTER TABLE public.task_subtasks
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.task_attachments
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.task_comments
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Create indexes for organization_id columns
CREATE INDEX IF NOT EXISTS idx_tasks_org_id ON public.tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_task_projects_org_id ON public.task_projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_sales_leads_org_id ON public.sales_leads(organization_id);
CREATE INDEX IF NOT EXISTS idx_sales_notes_org_id ON public.sales_notes(organization_id);
CREATE INDEX IF NOT EXISTS idx_creator_contracts_org_id ON public.creator_contracts(organization_id);
CREATE INDEX IF NOT EXISTS idx_team_files_org_id ON public.team_files(organization_id);
CREATE INDEX IF NOT EXISTS idx_task_subtasks_org_id ON public.task_subtasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_task_attachments_org_id ON public.task_attachments(organization_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_org_id ON public.task_comments(organization_id);

-- =============================================================================
-- 6. HELPER FUNCTIONS FOR RLS
-- =============================================================================

-- Get current user's active organization from JWT claims
CREATE OR REPLACE FUNCTION public.get_current_organization_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::jsonb->>'organization_id')::uuid,
    (SELECT current_organization_id FROM public.user_profiles WHERE id = auth.uid())
  )
$$;

-- Check if user belongs to an organization
CREATE OR REPLACE FUNCTION public.belongs_to_organization(org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = org_id AND user_id = auth.uid()
  )
$$;

-- Get user's role in an organization
CREATE OR REPLACE FUNCTION public.get_organization_role(org_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.organization_members
  WHERE organization_id = org_id AND user_id = auth.uid()
$$;

-- Check if user is owner of organization
CREATE OR REPLACE FUNCTION public.is_organization_owner(org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = org_id AND user_id = auth.uid() AND role = 'owner'
  )
$$;

-- Check if user is admin or owner of organization
CREATE OR REPLACE FUNCTION public.is_organization_admin(org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = org_id AND user_id = auth.uid() AND role IN ('owner', 'admin')
  )
$$;

-- =============================================================================
-- 7. TRIGGERS FOR updated_at
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_org_members_updated_at
  BEFORE UPDATE ON public.organization_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- 8. AUTO-CREATE USER PROFILE ON SIGNUP
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- 9. RLS POLICIES FOR NEW TABLES
-- =============================================================================

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;

-- Organizations: Users can only see orgs they belong to
CREATE POLICY "org_select_member" ON public.organizations
  FOR SELECT TO authenticated
  USING (public.belongs_to_organization(id));

CREATE POLICY "org_update_admin" ON public.organizations
  FOR UPDATE TO authenticated
  USING (public.is_organization_admin(id))
  WITH CHECK (public.is_organization_admin(id));

-- User Profiles: Users can see profiles of people in their org
CREATE POLICY "profile_select_own" ON public.user_profiles
  FOR SELECT TO authenticated
  USING (
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.organization_members om1
      JOIN public.organization_members om2 ON om1.organization_id = om2.organization_id
      WHERE om1.user_id = auth.uid() AND om2.user_id = user_profiles.id
    )
  );

CREATE POLICY "profile_update_own" ON public.user_profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Organization Members: Viewable by members, manageable by admins
CREATE POLICY "members_select" ON public.organization_members
  FOR SELECT TO authenticated
  USING (public.belongs_to_organization(organization_id));

CREATE POLICY "members_insert_admin" ON public.organization_members
  FOR INSERT TO authenticated
  WITH CHECK (public.is_organization_admin(organization_id));

CREATE POLICY "members_update_admin" ON public.organization_members
  FOR UPDATE TO authenticated
  USING (public.is_organization_admin(organization_id))
  WITH CHECK (public.is_organization_admin(organization_id));

CREATE POLICY "members_delete_admin" ON public.organization_members
  FOR DELETE TO authenticated
  USING (public.is_organization_admin(organization_id));

-- Organization Invitations: Viewable/manageable by admins, or by the invited user
CREATE POLICY "invitations_select" ON public.organization_invitations
  FOR SELECT TO authenticated
  USING (
    public.is_organization_admin(organization_id) OR
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "invitations_insert_admin" ON public.organization_invitations
  FOR INSERT TO authenticated
  WITH CHECK (public.is_organization_admin(organization_id));

CREATE POLICY "invitations_delete_admin" ON public.organization_invitations
  FOR DELETE TO authenticated
  USING (public.is_organization_admin(organization_id));

-- =============================================================================
-- 10. DEFAULT ORGANIZATION FOR MIGRATION
-- This creates a default org for existing data
-- =============================================================================

-- Insert default organization (will be used to migrate existing data)
INSERT INTO public.organizations (id, name, slug, subscription_plan, subscription_status, max_seats, max_creators)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Prometheus Team',
  'prometheus-team',
  'enterprise',
  'active',
  100,
  10000
)
ON CONFLICT (id) DO NOTHING;

-- Update existing data to belong to default org
UPDATE public.tasks SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
UPDATE public.task_projects SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
UPDATE public.sales_leads SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
UPDATE public.sales_notes SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
UPDATE public.creator_contracts SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
UPDATE public.team_files SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
UPDATE public.task_subtasks SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
UPDATE public.task_attachments SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
UPDATE public.task_comments SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
