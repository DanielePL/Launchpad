-- =============================================================================
-- App Launch AI - Database Foundation
-- Tables for the AI-powered app publishing assistant
-- =============================================================================

-- =============================================================================
-- 1. APP PROJECTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.app_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Basic Info
  name text NOT NULL,
  description text,
  package_name text,           -- Android: com.company.app
  bundle_id text,              -- iOS: com.company.App

  -- Platforms
  platforms text[] NOT NULL DEFAULT '{}',  -- ['android', 'ios']

  -- Status & Progress
  status text NOT NULL DEFAULT 'setup'
    CHECK (status IN ('setup', 'preparing', 'beta', 'review', 'approved', 'live', 'updating')),
  completion_percentage integer DEFAULT 0,

  -- Dates
  target_launch_date date,
  launched_at timestamptz,

  -- Store Links (after publishing)
  google_play_url text,
  app_store_url text,

  -- Metadata
  app_category text,
  content_rating text,
  icon_url text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_app_projects_org_id ON public.app_projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_app_projects_status ON public.app_projects(status);
CREATE INDEX IF NOT EXISTS idx_app_projects_created_at ON public.app_projects(created_at DESC);

-- =============================================================================
-- 2. PROJECT CHECKLIST ITEMS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.project_checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.app_projects(id) ON DELETE CASCADE,

  -- Categorization
  category text NOT NULL,  -- 'setup', 'store_listing', 'assets', 'compliance', 'beta', 'release'
  item_key text NOT NULL,  -- Unique identifier within category
  sort_order integer DEFAULT 0,

  -- Content
  title text NOT NULL,
  description text,
  help_text text,          -- AI-generated help

  -- Status
  is_required boolean DEFAULT true,
  is_completed boolean DEFAULT false,
  is_blocked boolean DEFAULT false,
  blocked_reason text,

  -- Completion tracking
  completed_at timestamptz,
  completed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Platform specific
  platform text,  -- NULL = both, 'android', 'ios'

  created_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE(project_id, category, item_key)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_checklist_project_id ON public.project_checklist_items(project_id);
CREATE INDEX IF NOT EXISTS idx_checklist_category ON public.project_checklist_items(category);
CREATE INDEX IF NOT EXISTS idx_checklist_completed ON public.project_checklist_items(is_completed);

-- =============================================================================
-- 3. STORE CREDENTIALS (Encrypted)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.store_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Credential Info
  platform text NOT NULL CHECK (platform IN ('google_play', 'app_store')),
  credential_type text NOT NULL,  -- 'service_account', 'api_key', 'certificate', 'keystore', etc.
  name text NOT NULL,             -- User-friendly name

  -- Encrypted Storage
  encrypted_data text NOT NULL,   -- Base64 encoded encrypted data
  encryption_iv text NOT NULL,    -- Initialization vector

  -- Status
  is_valid boolean DEFAULT true,
  last_validated_at timestamptz,
  expires_at timestamptz,

  -- Metadata (non-sensitive)
  metadata jsonb DEFAULT '{}',    -- e.g., key_id, issuer_id for App Store

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,

  UNIQUE(organization_id, platform, credential_type, name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_credentials_org_id ON public.store_credentials(organization_id);
CREATE INDEX IF NOT EXISTS idx_credentials_platform ON public.store_credentials(platform);

-- =============================================================================
-- 4. AI CONVERSATIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.app_projects(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Conversation Info
  title text,
  summary text,              -- AI-generated summary

  -- Status
  status text DEFAULT 'active' CHECK (status IN ('active', 'archived', 'resolved')),

  -- Context
  context_type text,         -- 'general', 'setup', 'assets', 'compliance', 'beta', 'release', 'troubleshooting'

  -- Metadata
  message_count integer DEFAULT 0,
  last_message_at timestamptz,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_conversations_org_id ON public.ai_conversations(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_project_id ON public.ai_conversations(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_updated ON public.ai_conversations(updated_at DESC);

-- =============================================================================
-- 5. AI MESSAGES
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.ai_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,

  -- Message Content
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,

  -- Attachments & Actions
  attachments jsonb DEFAULT '[]',     -- [{type, url, name}]
  suggested_actions jsonb DEFAULT '[]', -- AI-suggested next steps

  -- Tool Usage (for AI function calls)
  tool_calls jsonb DEFAULT '[]',
  tool_results jsonb DEFAULT '[]',

  -- Metadata
  tokens_used integer,
  model_used text,

  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation ON public.ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_created ON public.ai_messages(created_at);

-- =============================================================================
-- 6. PROJECT ASSETS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.project_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.app_projects(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Asset Info
  asset_type text NOT NULL CHECK (asset_type IN (
    'screenshot', 'icon', 'feature_graphic', 'promo_video',
    'tv_banner', 'wear_screenshot', 'app_preview'
  )),
  name text NOT NULL,

  -- Platform & Device
  platform text NOT NULL CHECK (platform IN ('android', 'ios', 'both')),
  device_type text,          -- 'phone_6.7', 'phone_6.5', 'tablet_12.9', etc.

  -- File Info
  file_path text NOT NULL,   -- Storage path
  file_url text,             -- Public URL
  file_size integer,
  mime_type text,

  -- Dimensions
  width integer,
  height integer,

  -- Status
  is_approved boolean DEFAULT false,
  approval_notes text,

  -- Metadata
  metadata jsonb DEFAULT '{}',  -- locale, sort_order, etc.

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_assets_project_id ON public.project_assets(project_id);
CREATE INDEX IF NOT EXISTS idx_assets_org_id ON public.project_assets(organization_id);
CREATE INDEX IF NOT EXISTS idx_assets_type ON public.project_assets(asset_type);

-- =============================================================================
-- 7. BETA TESTERS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.app_beta_testers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.app_projects(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Tester Info
  email text NOT NULL,
  name text,

  -- Platform & Group
  platform text NOT NULL CHECK (platform IN ('android', 'ios', 'both')),
  group_name text DEFAULT 'default',

  -- Status
  status text DEFAULT 'invited' CHECK (status IN ('invited', 'active', 'inactive', 'removed')),

  -- Engagement
  installed_at timestamptz,
  last_active_at timestamptz,
  feedback_count integer DEFAULT 0,
  crash_count integer DEFAULT 0,

  -- Invitation
  invite_token text UNIQUE,
  invited_at timestamptz DEFAULT now(),
  invite_expires_at timestamptz,

  created_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE(project_id, email, platform)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_beta_testers_project ON public.app_beta_testers(project_id);
CREATE INDEX IF NOT EXISTS idx_beta_testers_org ON public.app_beta_testers(organization_id);
CREATE INDEX IF NOT EXISTS idx_beta_testers_email ON public.app_beta_testers(email);
CREATE INDEX IF NOT EXISTS idx_beta_testers_status ON public.app_beta_testers(status);

-- =============================================================================
-- 8. RELEASES
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.app_releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.app_projects(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Version Info
  platform text NOT NULL CHECK (platform IN ('android', 'ios')),
  version_name text NOT NULL,     -- "1.0.0"
  version_code integer,           -- Android: versionCode, iOS: build number

  -- Release Track
  track text NOT NULL DEFAULT 'internal'
    CHECK (track IN ('internal', 'alpha', 'closed_beta', 'open_beta', 'production')),
  rollout_percentage integer DEFAULT 100,

  -- Status
  status text DEFAULT 'draft'
    CHECK (status IN ('draft', 'uploading', 'processing', 'pending_review', 'in_review',
                      'approved', 'rejected', 'released', 'halted', 'superseded')),

  -- Review Info
  submitted_at timestamptz,
  review_started_at timestamptz,
  reviewed_at timestamptz,
  rejection_reason text,

  -- Release Info
  released_at timestamptz,

  -- Changelog (localized)
  changelog jsonb DEFAULT '{}',   -- {"en": "...", "de": "...", ...}

  -- Build Info
  build_file_path text,
  build_file_size integer,
  build_sha256 text,

  -- Store IDs
  store_release_id text,          -- ID from Play Console / App Store Connect

  -- Metadata
  metadata jsonb DEFAULT '{}',

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_releases_project ON public.app_releases(project_id);
CREATE INDEX IF NOT EXISTS idx_releases_org ON public.app_releases(organization_id);
CREATE INDEX IF NOT EXISTS idx_releases_platform ON public.app_releases(platform);
CREATE INDEX IF NOT EXISTS idx_releases_status ON public.app_releases(status);
CREATE INDEX IF NOT EXISTS idx_releases_created ON public.app_releases(created_at DESC);

-- =============================================================================
-- 9. COMPLIANCE DOCUMENTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.compliance_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.app_projects(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Document Info
  document_type text NOT NULL
    CHECK (document_type IN ('privacy_policy', 'terms_of_service', 'eula', 'data_deletion', 'support_url')),

  -- Content
  content text,                   -- Markdown/HTML content
  hosted_url text,                -- If hosted by us
  external_url text,              -- If hosted externally

  -- Localization
  locale text DEFAULT 'en',

  -- Status
  is_published boolean DEFAULT false,
  published_at timestamptz,

  -- Generation Info
  generated_by_ai boolean DEFAULT false,
  ai_prompt_used text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE(project_id, document_type, locale)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_compliance_project ON public.compliance_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_compliance_org ON public.compliance_documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_compliance_type ON public.compliance_documents(document_type);

-- =============================================================================
-- 10. RLS POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.app_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_beta_testers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_documents ENABLE ROW LEVEL SECURITY;

-- App Projects
CREATE POLICY "app_projects_select" ON public.app_projects
  FOR SELECT TO authenticated
  USING (public.belongs_to_organization(organization_id));

CREATE POLICY "app_projects_insert" ON public.app_projects
  FOR INSERT TO authenticated
  WITH CHECK (public.belongs_to_organization(organization_id));

CREATE POLICY "app_projects_update" ON public.app_projects
  FOR UPDATE TO authenticated
  USING (public.belongs_to_organization(organization_id));

CREATE POLICY "app_projects_delete" ON public.app_projects
  FOR DELETE TO authenticated
  USING (public.belongs_to_organization(organization_id)
         AND public.get_organization_role(organization_id) IN ('owner', 'admin'));

-- Checklist Items
CREATE POLICY "checklist_select" ON public.project_checklist_items
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.app_projects p
    WHERE p.id = project_id AND public.belongs_to_organization(p.organization_id)
  ));

CREATE POLICY "checklist_all" ON public.project_checklist_items
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.app_projects p
    WHERE p.id = project_id AND public.belongs_to_organization(p.organization_id)
  ));

-- Store Credentials (Admin only)
CREATE POLICY "credentials_select" ON public.store_credentials
  FOR SELECT TO authenticated
  USING (public.belongs_to_organization(organization_id)
         AND public.get_organization_role(organization_id) IN ('owner', 'admin'));

CREATE POLICY "credentials_all" ON public.store_credentials
  FOR ALL TO authenticated
  USING (public.belongs_to_organization(organization_id)
         AND public.get_organization_role(organization_id) IN ('owner', 'admin'));

-- AI Conversations
CREATE POLICY "conversations_select" ON public.ai_conversations
  FOR SELECT TO authenticated
  USING (public.belongs_to_organization(organization_id));

CREATE POLICY "conversations_insert" ON public.ai_conversations
  FOR INSERT TO authenticated
  WITH CHECK (public.belongs_to_organization(organization_id) AND user_id = auth.uid());

CREATE POLICY "conversations_update" ON public.ai_conversations
  FOR UPDATE TO authenticated
  USING (public.belongs_to_organization(organization_id));

-- AI Messages
CREATE POLICY "messages_select" ON public.ai_messages
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.ai_conversations c
    WHERE c.id = conversation_id AND public.belongs_to_organization(c.organization_id)
  ));

CREATE POLICY "messages_insert" ON public.ai_messages
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.ai_conversations c
    WHERE c.id = conversation_id AND public.belongs_to_organization(c.organization_id)
  ));

-- Project Assets
CREATE POLICY "assets_select" ON public.project_assets
  FOR SELECT TO authenticated
  USING (public.belongs_to_organization(organization_id));

CREATE POLICY "assets_all" ON public.project_assets
  FOR ALL TO authenticated
  USING (public.belongs_to_organization(organization_id));

-- Beta Testers
CREATE POLICY "beta_testers_select" ON public.app_beta_testers
  FOR SELECT TO authenticated
  USING (public.belongs_to_organization(organization_id));

CREATE POLICY "beta_testers_all" ON public.app_beta_testers
  FOR ALL TO authenticated
  USING (public.belongs_to_organization(organization_id));

-- Releases
CREATE POLICY "releases_select" ON public.app_releases
  FOR SELECT TO authenticated
  USING (public.belongs_to_organization(organization_id));

CREATE POLICY "releases_all" ON public.app_releases
  FOR ALL TO authenticated
  USING (public.belongs_to_organization(organization_id));

-- Compliance Documents
CREATE POLICY "compliance_select" ON public.compliance_documents
  FOR SELECT TO authenticated
  USING (public.belongs_to_organization(organization_id));

CREATE POLICY "compliance_all" ON public.compliance_documents
  FOR ALL TO authenticated
  USING (public.belongs_to_organization(organization_id));

-- =============================================================================
-- 11. HELPER FUNCTIONS
-- =============================================================================

-- Update project completion percentage
CREATE OR REPLACE FUNCTION public.update_project_completion()
RETURNS TRIGGER AS $$
DECLARE
  total_items integer;
  completed_items integer;
  new_percentage integer;
BEGIN
  SELECT COUNT(*), COUNT(*) FILTER (WHERE is_completed)
  INTO total_items, completed_items
  FROM public.project_checklist_items
  WHERE project_id = COALESCE(NEW.project_id, OLD.project_id);

  IF total_items > 0 THEN
    new_percentage := (completed_items * 100) / total_items;
  ELSE
    new_percentage := 0;
  END IF;

  UPDATE public.app_projects
  SET completion_percentage = new_percentage, updated_at = now()
  WHERE id = COALESCE(NEW.project_id, OLD.project_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for checklist completion
DROP TRIGGER IF EXISTS trigger_update_project_completion ON public.project_checklist_items;
CREATE TRIGGER trigger_update_project_completion
  AFTER INSERT OR UPDATE OR DELETE ON public.project_checklist_items
  FOR EACH ROW EXECUTE FUNCTION public.update_project_completion();

-- Update conversation message count
CREATE OR REPLACE FUNCTION public.update_conversation_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.ai_conversations
  SET
    message_count = (SELECT COUNT(*) FROM public.ai_messages WHERE conversation_id = NEW.conversation_id),
    last_message_at = NEW.created_at,
    updated_at = now()
  WHERE id = NEW.conversation_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for message count
DROP TRIGGER IF EXISTS trigger_update_conversation_stats ON public.ai_messages;
CREATE TRIGGER trigger_update_conversation_stats
  AFTER INSERT ON public.ai_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_conversation_stats();

-- =============================================================================
-- 12. DEFAULT CHECKLIST TEMPLATE
-- =============================================================================

-- Function to create default checklist for a project
CREATE OR REPLACE FUNCTION public.create_project_checklist(p_project_id uuid, p_platforms text[])
RETURNS void AS $$
BEGIN
  -- Setup Items
  INSERT INTO public.project_checklist_items (project_id, category, item_key, sort_order, title, description, platform) VALUES
    (p_project_id, 'setup', 'project_info', 1, 'Basic Project Info', 'App name, description, and category', NULL),
    (p_project_id, 'setup', 'google_developer_account', 2, 'Google Play Developer Account', 'Create or connect your Google Play Developer account ($25 one-time)', 'android'),
    (p_project_id, 'setup', 'apple_developer_account', 3, 'Apple Developer Account', 'Create or connect your Apple Developer account ($99/year)', 'ios'),
    (p_project_id, 'setup', 'google_api_credentials', 4, 'Google Play API Credentials', 'Set up service account for automated publishing', 'android'),
    (p_project_id, 'setup', 'apple_api_credentials', 5, 'App Store Connect API Key', 'Generate API key for automated publishing', 'ios');

  -- Store Listing Items
  INSERT INTO public.project_checklist_items (project_id, category, item_key, sort_order, title, description, platform) VALUES
    (p_project_id, 'store_listing', 'app_title', 1, 'App Title', 'Choose your app title (max 30 characters)', NULL),
    (p_project_id, 'store_listing', 'short_description', 2, 'Short Description', 'Write a compelling short description (max 80 characters)', NULL),
    (p_project_id, 'store_listing', 'full_description', 3, 'Full Description', 'Write a detailed description (max 4000 characters)', NULL),
    (p_project_id, 'store_listing', 'keywords', 4, 'Keywords', 'Select keywords for App Store search optimization', 'ios'),
    (p_project_id, 'store_listing', 'category', 5, 'App Category', 'Choose the primary category for your app', NULL),
    (p_project_id, 'store_listing', 'content_rating', 6, 'Content Rating', 'Complete the content rating questionnaire', NULL);

  -- Assets Items
  INSERT INTO public.project_checklist_items (project_id, category, item_key, sort_order, title, description, platform) VALUES
    (p_project_id, 'assets', 'app_icon', 1, 'App Icon', 'Create app icon (512x512 for Android, 1024x1024 for iOS)', NULL),
    (p_project_id, 'assets', 'screenshots_android', 2, 'Android Screenshots', 'Upload screenshots for phone and tablet', 'android'),
    (p_project_id, 'assets', 'screenshots_ios', 3, 'iOS Screenshots', 'Upload screenshots for all required device sizes', 'ios'),
    (p_project_id, 'assets', 'feature_graphic', 4, 'Feature Graphic', 'Create feature graphic (1024x500)', 'android'),
    (p_project_id, 'assets', 'preview_video', 5, 'App Preview Video', 'Optional: Create a preview video', NULL);

  -- Compliance Items
  INSERT INTO public.project_checklist_items (project_id, category, item_key, sort_order, title, description, platform) VALUES
    (p_project_id, 'compliance', 'privacy_policy', 1, 'Privacy Policy', 'Create and host a privacy policy', NULL),
    (p_project_id, 'compliance', 'data_safety', 2, 'Data Safety Form', 'Complete the Data Safety section', 'android'),
    (p_project_id, 'compliance', 'app_privacy', 3, 'App Privacy Labels', 'Complete App Privacy information', 'ios'),
    (p_project_id, 'compliance', 'terms_of_service', 4, 'Terms of Service', 'Optional: Create terms of service', NULL);

  -- Beta Items
  INSERT INTO public.project_checklist_items (project_id, category, item_key, sort_order, title, description, platform) VALUES
    (p_project_id, 'beta', 'internal_testing', 1, 'Internal Testing', 'Set up internal testing track', NULL),
    (p_project_id, 'beta', 'beta_testers', 2, 'Invite Beta Testers', 'Add testers to your beta program', NULL),
    (p_project_id, 'beta', 'collect_feedback', 3, 'Collect Feedback', 'Gather and address beta tester feedback', NULL);

  -- Release Items
  INSERT INTO public.project_checklist_items (project_id, category, item_key, sort_order, title, description, platform) VALUES
    (p_project_id, 'release', 'final_build', 1, 'Final Build', 'Create production-ready build', NULL),
    (p_project_id, 'release', 'release_notes', 2, 'Release Notes', 'Write release notes for this version', NULL),
    (p_project_id, 'release', 'submit_review', 3, 'Submit for Review', 'Submit your app for store review', NULL),
    (p_project_id, 'release', 'go_live', 4, 'Go Live', 'Release your app to the public', NULL);

  -- Remove platform-specific items if not applicable
  IF NOT ('android' = ANY(p_platforms)) THEN
    DELETE FROM public.project_checklist_items
    WHERE project_id = p_project_id AND platform = 'android';
  END IF;

  IF NOT ('ios' = ANY(p_platforms)) THEN
    DELETE FROM public.project_checklist_items
    WHERE project_id = p_project_id AND platform = 'ios';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
