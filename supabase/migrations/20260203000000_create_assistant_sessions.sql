-- =============================================================================
-- AI Launch Assistant Sessions Table
-- =============================================================================
-- Stores the state of process-oriented AI assistant sessions that guide users
-- through the complete app launch process step by step.

-- Assistant Sessions Table
CREATE TABLE IF NOT EXISTS public.assistant_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.app_projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Session State
  current_phase text NOT NULL DEFAULT 'discovery'
    CHECK (current_phase IN ('discovery', 'code_source', 'tech_analysis',
                             'store_presence', 'store_listings', 'assets',
                             'compliance', 'beta', 'release')),
  current_step integer DEFAULT 0,

  -- Collected Data (JSONB)
  collected_data jsonb DEFAULT '{}',
  -- Generated Content (AI-generated)
  generated_content jsonb DEFAULT '{}',

  -- Status
  status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'abandoned')),

  -- Progress Tracking
  phases_completed text[] DEFAULT '{}',

  -- AI Conversation Link
  conversation_id uuid REFERENCES public.ai_conversations(id),

  -- Timestamps
  started_at timestamptz DEFAULT now(),
  paused_at timestamptz,
  completed_at timestamptz,
  last_interaction_at timestamptz DEFAULT now(),

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX idx_assistant_sessions_user ON public.assistant_sessions(user_id);
CREATE INDEX idx_assistant_sessions_org ON public.assistant_sessions(organization_id);
CREATE INDEX idx_assistant_sessions_status ON public.assistant_sessions(status);
CREATE INDEX idx_assistant_sessions_user_status ON public.assistant_sessions(user_id, status);

-- =============================================================================
-- RLS Policies
-- =============================================================================
ALTER TABLE public.assistant_sessions ENABLE ROW LEVEL SECURITY;

-- Select: Users can see sessions from their organization
CREATE POLICY "sessions_select" ON public.assistant_sessions
  FOR SELECT TO authenticated
  USING (public.belongs_to_organization(organization_id));

-- Insert: Users can create sessions for themselves in their organization
CREATE POLICY "sessions_insert" ON public.assistant_sessions
  FOR INSERT TO authenticated
  WITH CHECK (public.belongs_to_organization(organization_id) AND user_id = auth.uid());

-- Update: Users can update sessions in their organization
CREATE POLICY "sessions_update" ON public.assistant_sessions
  FOR UPDATE TO authenticated
  USING (public.belongs_to_organization(organization_id));

-- Delete: Users can only delete their own sessions
CREATE POLICY "sessions_delete" ON public.assistant_sessions
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- =============================================================================
-- Trigger for updated_at
-- =============================================================================
CREATE TRIGGER update_assistant_sessions_updated_at
  BEFORE UPDATE ON public.assistant_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
