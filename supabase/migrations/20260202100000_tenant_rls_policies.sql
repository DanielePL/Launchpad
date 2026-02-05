-- =============================================================================
-- LaunchPad - Tenant-Isolated RLS Policies
-- Phase 3: Replace all old open-access policies with secure tenant-scoped ones
-- =============================================================================

-- =============================================================================
-- 1. DROP OLD OPEN-ACCESS POLICIES
-- These allowed anon access which is a security risk
-- =============================================================================

-- Tasks policies
DROP POLICY IF EXISTS "tasks_select" ON public.tasks;
DROP POLICY IF EXISTS "tasks_insert" ON public.tasks;
DROP POLICY IF EXISTS "tasks_update" ON public.tasks;
DROP POLICY IF EXISTS "tasks_delete" ON public.tasks;

-- Task Projects policies
DROP POLICY IF EXISTS "task_projects_select" ON public.task_projects;
DROP POLICY IF EXISTS "task_projects_insert" ON public.task_projects;
DROP POLICY IF EXISTS "task_projects_update" ON public.task_projects;
DROP POLICY IF EXISTS "task_projects_delete" ON public.task_projects;

-- Task Subtasks policies
DROP POLICY IF EXISTS "task_subtasks_select" ON public.task_subtasks;
DROP POLICY IF EXISTS "task_subtasks_insert" ON public.task_subtasks;
DROP POLICY IF EXISTS "task_subtasks_update" ON public.task_subtasks;
DROP POLICY IF EXISTS "task_subtasks_delete" ON public.task_subtasks;

-- Task Attachments policies
DROP POLICY IF EXISTS "task_attachments_select" ON public.task_attachments;
DROP POLICY IF EXISTS "task_attachments_insert" ON public.task_attachments;
DROP POLICY IF EXISTS "task_attachments_delete" ON public.task_attachments;

-- Task Comments policies
DROP POLICY IF EXISTS "task_comments_select" ON public.task_comments;
DROP POLICY IF EXISTS "task_comments_insert" ON public.task_comments;
DROP POLICY IF EXISTS "task_comments_delete" ON public.task_comments;

-- Sales Leads policies
DROP POLICY IF EXISTS "sales_leads_select" ON public.sales_leads;
DROP POLICY IF EXISTS "sales_leads_insert" ON public.sales_leads;
DROP POLICY IF EXISTS "sales_leads_update" ON public.sales_leads;
DROP POLICY IF EXISTS "sales_leads_delete" ON public.sales_leads;

-- Sales Notes policies
DROP POLICY IF EXISTS "sales_notes_select" ON public.sales_notes;
DROP POLICY IF EXISTS "sales_notes_insert" ON public.sales_notes;
DROP POLICY IF EXISTS "sales_notes_delete" ON public.sales_notes;

-- Creator Contracts policies
DROP POLICY IF EXISTS "creator_contracts_select" ON public.creator_contracts;
DROP POLICY IF EXISTS "creator_contracts_insert" ON public.creator_contracts;
DROP POLICY IF EXISTS "creator_contracts_update" ON public.creator_contracts;
DROP POLICY IF EXISTS "creator_contracts_delete" ON public.creator_contracts;

-- Team Files policies
DROP POLICY IF EXISTS "team_files_select" ON public.team_files;
DROP POLICY IF EXISTS "team_files_insert" ON public.team_files;
DROP POLICY IF EXISTS "team_files_update" ON public.team_files;
DROP POLICY IF EXISTS "team_files_delete" ON public.team_files;

-- =============================================================================
-- 2. NEW TENANT-ISOLATED POLICIES
-- All access requires authentication and membership in the org
-- =============================================================================

-- -----------------------------------------------------------------------------
-- TASKS
-- -----------------------------------------------------------------------------

CREATE POLICY "tasks_tenant_select" ON public.tasks
  FOR SELECT TO authenticated
  USING (public.belongs_to_organization(organization_id));

CREATE POLICY "tasks_tenant_insert" ON public.tasks
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id = public.get_current_organization_id() AND
    public.belongs_to_organization(organization_id)
  );

CREATE POLICY "tasks_tenant_update" ON public.tasks
  FOR UPDATE TO authenticated
  USING (public.belongs_to_organization(organization_id))
  WITH CHECK (public.belongs_to_organization(organization_id));

CREATE POLICY "tasks_tenant_delete" ON public.tasks
  FOR DELETE TO authenticated
  USING (public.belongs_to_organization(organization_id));

-- -----------------------------------------------------------------------------
-- TASK PROJECTS
-- -----------------------------------------------------------------------------

CREATE POLICY "task_projects_tenant_select" ON public.task_projects
  FOR SELECT TO authenticated
  USING (public.belongs_to_organization(organization_id));

CREATE POLICY "task_projects_tenant_insert" ON public.task_projects
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id = public.get_current_organization_id() AND
    public.belongs_to_organization(organization_id)
  );

CREATE POLICY "task_projects_tenant_update" ON public.task_projects
  FOR UPDATE TO authenticated
  USING (public.belongs_to_organization(organization_id))
  WITH CHECK (public.belongs_to_organization(organization_id));

CREATE POLICY "task_projects_tenant_delete" ON public.task_projects
  FOR DELETE TO authenticated
  USING (public.belongs_to_organization(organization_id));

-- -----------------------------------------------------------------------------
-- TASK SUBTASKS
-- -----------------------------------------------------------------------------

CREATE POLICY "task_subtasks_tenant_select" ON public.task_subtasks
  FOR SELECT TO authenticated
  USING (public.belongs_to_organization(organization_id));

CREATE POLICY "task_subtasks_tenant_insert" ON public.task_subtasks
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id = public.get_current_organization_id() AND
    public.belongs_to_organization(organization_id)
  );

CREATE POLICY "task_subtasks_tenant_update" ON public.task_subtasks
  FOR UPDATE TO authenticated
  USING (public.belongs_to_organization(organization_id))
  WITH CHECK (public.belongs_to_organization(organization_id));

CREATE POLICY "task_subtasks_tenant_delete" ON public.task_subtasks
  FOR DELETE TO authenticated
  USING (public.belongs_to_organization(organization_id));

-- -----------------------------------------------------------------------------
-- TASK ATTACHMENTS
-- -----------------------------------------------------------------------------

CREATE POLICY "task_attachments_tenant_select" ON public.task_attachments
  FOR SELECT TO authenticated
  USING (public.belongs_to_organization(organization_id));

CREATE POLICY "task_attachments_tenant_insert" ON public.task_attachments
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id = public.get_current_organization_id() AND
    public.belongs_to_organization(organization_id)
  );

CREATE POLICY "task_attachments_tenant_delete" ON public.task_attachments
  FOR DELETE TO authenticated
  USING (public.belongs_to_organization(organization_id));

-- -----------------------------------------------------------------------------
-- TASK COMMENTS
-- -----------------------------------------------------------------------------

CREATE POLICY "task_comments_tenant_select" ON public.task_comments
  FOR SELECT TO authenticated
  USING (public.belongs_to_organization(organization_id));

CREATE POLICY "task_comments_tenant_insert" ON public.task_comments
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id = public.get_current_organization_id() AND
    public.belongs_to_organization(organization_id)
  );

CREATE POLICY "task_comments_tenant_delete" ON public.task_comments
  FOR DELETE TO authenticated
  USING (public.belongs_to_organization(organization_id));

-- -----------------------------------------------------------------------------
-- SALES LEADS
-- -----------------------------------------------------------------------------

CREATE POLICY "sales_leads_tenant_select" ON public.sales_leads
  FOR SELECT TO authenticated
  USING (public.belongs_to_organization(organization_id));

CREATE POLICY "sales_leads_tenant_insert" ON public.sales_leads
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id = public.get_current_organization_id() AND
    public.belongs_to_organization(organization_id)
  );

CREATE POLICY "sales_leads_tenant_update" ON public.sales_leads
  FOR UPDATE TO authenticated
  USING (public.belongs_to_organization(organization_id))
  WITH CHECK (public.belongs_to_organization(organization_id));

CREATE POLICY "sales_leads_tenant_delete" ON public.sales_leads
  FOR DELETE TO authenticated
  USING (public.belongs_to_organization(organization_id));

-- -----------------------------------------------------------------------------
-- SALES NOTES
-- -----------------------------------------------------------------------------

CREATE POLICY "sales_notes_tenant_select" ON public.sales_notes
  FOR SELECT TO authenticated
  USING (public.belongs_to_organization(organization_id));

CREATE POLICY "sales_notes_tenant_insert" ON public.sales_notes
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id = public.get_current_organization_id() AND
    public.belongs_to_organization(organization_id)
  );

CREATE POLICY "sales_notes_tenant_delete" ON public.sales_notes
  FOR DELETE TO authenticated
  USING (public.belongs_to_organization(organization_id));

-- -----------------------------------------------------------------------------
-- CREATOR CONTRACTS
-- -----------------------------------------------------------------------------

CREATE POLICY "creator_contracts_tenant_select" ON public.creator_contracts
  FOR SELECT TO authenticated
  USING (public.belongs_to_organization(organization_id));

CREATE POLICY "creator_contracts_tenant_insert" ON public.creator_contracts
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id = public.get_current_organization_id() AND
    public.belongs_to_organization(organization_id)
  );

CREATE POLICY "creator_contracts_tenant_update" ON public.creator_contracts
  FOR UPDATE TO authenticated
  USING (public.belongs_to_organization(organization_id))
  WITH CHECK (public.belongs_to_organization(organization_id));

CREATE POLICY "creator_contracts_tenant_delete" ON public.creator_contracts
  FOR DELETE TO authenticated
  USING (public.belongs_to_organization(organization_id));

-- -----------------------------------------------------------------------------
-- TEAM FILES
-- -----------------------------------------------------------------------------

CREATE POLICY "team_files_tenant_select" ON public.team_files
  FOR SELECT TO authenticated
  USING (public.belongs_to_organization(organization_id));

CREATE POLICY "team_files_tenant_insert" ON public.team_files
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id = public.get_current_organization_id() AND
    public.belongs_to_organization(organization_id)
  );

CREATE POLICY "team_files_tenant_update" ON public.team_files
  FOR UPDATE TO authenticated
  USING (public.belongs_to_organization(organization_id))
  WITH CHECK (public.belongs_to_organization(organization_id));

CREATE POLICY "team_files_tenant_delete" ON public.team_files
  FOR DELETE TO authenticated
  USING (public.belongs_to_organization(organization_id));

-- =============================================================================
-- 3. STORAGE BUCKET POLICIES (Tenant-Scoped)
-- =============================================================================

-- Drop old storage policies
DROP POLICY IF EXISTS "contracts_storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "contracts_storage_select" ON storage.objects;
DROP POLICY IF EXISTS "contracts_storage_update" ON storage.objects;
DROP POLICY IF EXISTS "contracts_storage_delete" ON storage.objects;
DROP POLICY IF EXISTS "team_storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "team_storage_select" ON storage.objects;
DROP POLICY IF EXISTS "team_storage_update" ON storage.objects;
DROP POLICY IF EXISTS "team_storage_delete" ON storage.objects;

-- New tenant-scoped storage policies
-- Files are stored with org_id prefix: {org_id}/{filename}

CREATE POLICY "storage_contracts_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'contracts' AND
    public.belongs_to_organization((storage.foldername(name))[1]::uuid)
  );

CREATE POLICY "storage_contracts_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'contracts' AND
    (storage.foldername(name))[1]::uuid = public.get_current_organization_id()
  );

CREATE POLICY "storage_contracts_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'contracts' AND
    public.belongs_to_organization((storage.foldername(name))[1]::uuid)
  );

CREATE POLICY "storage_contracts_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'contracts' AND
    public.is_organization_admin((storage.foldername(name))[1]::uuid)
  );

CREATE POLICY "storage_team_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'team-storage' AND
    public.belongs_to_organization((storage.foldername(name))[1]::uuid)
  );

CREATE POLICY "storage_team_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'team-storage' AND
    (storage.foldername(name))[1]::uuid = public.get_current_organization_id()
  );

CREATE POLICY "storage_team_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'team-storage' AND
    public.belongs_to_organization((storage.foldername(name))[1]::uuid)
  );

CREATE POLICY "storage_team_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'team-storage' AND
    public.is_organization_admin((storage.foldername(name))[1]::uuid)
  );

-- =============================================================================
-- 4. ENSURE NO ANONYMOUS ACCESS
-- By only granting policies to 'authenticated' role, anon is blocked
-- =============================================================================

-- Revoke any direct table access from anon (defense in depth)
REVOKE ALL ON public.tasks FROM anon;
REVOKE ALL ON public.task_projects FROM anon;
REVOKE ALL ON public.task_subtasks FROM anon;
REVOKE ALL ON public.task_attachments FROM anon;
REVOKE ALL ON public.task_comments FROM anon;
REVOKE ALL ON public.sales_leads FROM anon;
REVOKE ALL ON public.sales_notes FROM anon;
REVOKE ALL ON public.creator_contracts FROM anon;
REVOKE ALL ON public.team_files FROM anon;
REVOKE ALL ON public.organizations FROM anon;
REVOKE ALL ON public.organization_members FROM anon;
REVOKE ALL ON public.organization_invitations FROM anon;
REVOKE ALL ON public.user_profiles FROM anon;

-- Grant access only to authenticated users (RLS will filter)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_subtasks TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.task_attachments TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.task_comments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales_leads TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.sales_notes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.creator_contracts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_files TO authenticated;
GRANT SELECT, UPDATE ON public.organizations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organization_members TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.organization_invitations TO authenticated;
GRANT SELECT, UPDATE ON public.user_profiles TO authenticated;
