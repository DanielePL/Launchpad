-- =============================================================================
-- Activity Audit Logging
-- Tracks sensitive operations across the application
-- =============================================================================

-- =============================================================================
-- 1. ACTIVITY LOGS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email text,  -- Preserved even if user is deleted

  -- Activity details
  action text NOT NULL,  -- e.g., 'member.invited', 'creator.deleted', 'settings.updated'
  entity_type text NOT NULL,  -- e.g., 'member', 'creator', 'task', 'organization'
  entity_id text,  -- ID of the affected entity (nullable for some actions)
  entity_name text,  -- Human-readable name for display

  -- Additional context
  details jsonb DEFAULT '{}',  -- Additional metadata about the action
  ip_address text,
  user_agent text,

  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_activity_logs_org_id ON public.activity_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type ON public.activity_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_activity_logs_org_created
  ON public.activity_logs(organization_id, created_at DESC);

-- =============================================================================
-- 2. RLS POLICIES
-- =============================================================================

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Only org admins/owners can view activity logs
CREATE POLICY "activity_logs_select" ON public.activity_logs
  FOR SELECT TO authenticated
  USING (
    auth.belongs_to_organization(organization_id)
    AND auth.organization_role(organization_id) IN ('owner', 'admin')
  );

-- Any authenticated user can insert (logging is allowed)
-- The RPC function will handle validation
CREATE POLICY "activity_logs_insert" ON public.activity_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.belongs_to_organization(organization_id)
  );

-- =============================================================================
-- 3. HELPER FUNCTION FOR LOGGING
-- =============================================================================

CREATE OR REPLACE FUNCTION public.log_activity(
  p_action text,
  p_entity_type text,
  p_entity_id text DEFAULT NULL,
  p_entity_name text DEFAULT NULL,
  p_details jsonb DEFAULT '{}'::jsonb,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
  v_user_id uuid;
  v_user_email text;
  v_org_id uuid;
  v_log_id uuid;
BEGIN
  -- Get current user info
  v_user_id := auth.uid();

  -- Get user email
  SELECT email INTO v_user_email
  FROM public.user_profiles
  WHERE id = v_user_id;

  -- Get current organization
  v_org_id := auth.organization_id();

  -- Insert the activity log
  INSERT INTO public.activity_logs (
    organization_id,
    user_id,
    user_email,
    action,
    entity_type,
    entity_id,
    entity_name,
    details,
    ip_address,
    user_agent
  ) VALUES (
    v_org_id,
    v_user_id,
    v_user_email,
    p_action,
    p_entity_type,
    p_entity_id,
    p_entity_name,
    p_details,
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.log_activity TO authenticated;

-- =============================================================================
-- 4. AUTOMATIC TRIGGERS FOR KEY OPERATIONS
-- =============================================================================

-- Trigger function for member changes
CREATE OR REPLACE FUNCTION public.log_member_changes() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_activity(
      'member.added',
      'member',
      NEW.user_id::text,
      (SELECT email FROM public.user_profiles WHERE id = NEW.user_id),
      jsonb_build_object('role', NEW.role)
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.role IS DISTINCT FROM NEW.role THEN
    PERFORM public.log_activity(
      'member.role_changed',
      'member',
      NEW.user_id::text,
      (SELECT email FROM public.user_profiles WHERE id = NEW.user_id),
      jsonb_build_object('old_role', OLD.role, 'new_role', NEW.role)
    );
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_activity(
      'member.removed',
      'member',
      OLD.user_id::text,
      (SELECT email FROM public.user_profiles WHERE id = OLD.user_id),
      jsonb_build_object('role', OLD.role)
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger to organization_members
DROP TRIGGER IF EXISTS trigger_log_member_changes ON public.organization_members;
CREATE TRIGGER trigger_log_member_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.organization_members
  FOR EACH ROW EXECUTE FUNCTION public.log_member_changes();

-- Trigger function for invitation changes
CREATE OR REPLACE FUNCTION public.log_invitation_changes() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_activity(
      'invitation.sent',
      'invitation',
      NEW.id::text,
      NEW.email,
      jsonb_build_object('role', NEW.role)
    );
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_activity(
      'invitation.revoked',
      'invitation',
      OLD.id::text,
      OLD.email,
      jsonb_build_object('role', OLD.role)
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger to organization_invitations
DROP TRIGGER IF EXISTS trigger_log_invitation_changes ON public.organization_invitations;
CREATE TRIGGER trigger_log_invitation_changes
  AFTER INSERT OR DELETE ON public.organization_invitations
  FOR EACH ROW EXECUTE FUNCTION public.log_invitation_changes();

-- Trigger function for organization settings changes
CREATE OR REPLACE FUNCTION public.log_organization_changes() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Only log if meaningful fields changed
    IF OLD.name IS DISTINCT FROM NEW.name
       OR OLD.slug IS DISTINCT FROM NEW.slug
       OR OLD.subscription_plan IS DISTINCT FROM NEW.subscription_plan THEN
      PERFORM public.log_activity(
        'organization.updated',
        'organization',
        NEW.id::text,
        NEW.name,
        jsonb_build_object(
          'changes', jsonb_build_object(
            'name', CASE WHEN OLD.name IS DISTINCT FROM NEW.name
                    THEN jsonb_build_object('old', OLD.name, 'new', NEW.name) END,
            'slug', CASE WHEN OLD.slug IS DISTINCT FROM NEW.slug
                    THEN jsonb_build_object('old', OLD.slug, 'new', NEW.slug) END,
            'plan', CASE WHEN OLD.subscription_plan IS DISTINCT FROM NEW.subscription_plan
                    THEN jsonb_build_object('old', OLD.subscription_plan, 'new', NEW.subscription_plan) END
          )
        )
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger to organizations
DROP TRIGGER IF EXISTS trigger_log_organization_changes ON public.organizations;
CREATE TRIGGER trigger_log_organization_changes
  AFTER UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.log_organization_changes();
