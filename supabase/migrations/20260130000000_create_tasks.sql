-- =============================================================================
-- Prometheus Tasks - Asana Replacement for 5-Person Team
-- =============================================================================

-- Projects: Group related tasks together
CREATE TABLE IF NOT EXISTS public.task_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  color text NOT NULL DEFAULT '#f97316',
  archived boolean NOT NULL DEFAULT false,
  created_by text NOT NULL
    CHECK (created_by IN ('Daniele', 'Karin', 'Sjoerd', 'Valerie', 'Basil')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Tasks: Main task entity
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.task_projects(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'todo'
    CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  priority text NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assignee text
    CHECK (assignee IS NULL OR assignee IN ('Daniele', 'Karin', 'Sjoerd', 'Valerie', 'Basil')),
  deadline timestamptz,
  completed_at timestamptz,
  created_by text NOT NULL
    CHECK (created_by IN ('Daniele', 'Karin', 'Sjoerd', 'Valerie', 'Basil')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Subtasks: Checklist items within a task
CREATE TABLE IF NOT EXISTS public.task_subtasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  title text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- File Attachments: Link to team_files (no duplicate uploads)
CREATE TABLE IF NOT EXISTS public.task_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  file_id uuid NOT NULL REFERENCES public.team_files(id) ON DELETE CASCADE,
  attached_by text NOT NULL
    CHECK (attached_by IN ('Daniele', 'Karin', 'Sjoerd', 'Valerie', 'Basil')),
  attached_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(task_id, file_id)
);

-- Comments: Discussion on tasks
CREATE TABLE IF NOT EXISTS public.task_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_by text NOT NULL
    CHECK (created_by IN ('Daniele', 'Karin', 'Sjoerd', 'Valerie', 'Basil')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- Indexes
-- =============================================================================

-- Projects
CREATE INDEX IF NOT EXISTS idx_task_projects_archived ON public.task_projects(archived);
CREATE INDEX IF NOT EXISTS idx_task_projects_created_at ON public.task_projects(created_at DESC);

-- Tasks
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON public.tasks(assignee);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON public.tasks(deadline);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks(created_at DESC);

-- Subtasks
CREATE INDEX IF NOT EXISTS idx_task_subtasks_task_id ON public.task_subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_task_subtasks_sort_order ON public.task_subtasks(task_id, sort_order);

-- Attachments
CREATE INDEX IF NOT EXISTS idx_task_attachments_task_id ON public.task_attachments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_attachments_file_id ON public.task_attachments(file_id);

-- Comments
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON public.task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_created_at ON public.task_comments(created_at DESC);

-- =============================================================================
-- Triggers
-- =============================================================================

-- Auto-update updated_at for task_projects
CREATE OR REPLACE FUNCTION update_task_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_task_projects_updated_at
  BEFORE UPDATE ON public.task_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_task_projects_updated_at();

-- Auto-update updated_at for tasks
CREATE OR REPLACE FUNCTION update_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  -- Auto-set completed_at when status changes to done
  IF NEW.status = 'done' AND OLD.status != 'done' THEN
    NEW.completed_at = now();
  END IF;
  -- Clear completed_at if task is reopened
  IF NEW.status != 'done' AND OLD.status = 'done' THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_tasks_updated_at();

-- =============================================================================
-- RLS Policies (matching existing pattern - open access for internal admin)
-- =============================================================================

-- task_projects
ALTER TABLE public.task_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "task_projects_select" ON public.task_projects
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "task_projects_insert" ON public.task_projects
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "task_projects_update" ON public.task_projects
  FOR UPDATE TO anon, authenticated USING (true);

CREATE POLICY "task_projects_delete" ON public.task_projects
  FOR DELETE TO anon, authenticated USING (true);

-- tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks_select" ON public.tasks
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "tasks_insert" ON public.tasks
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "tasks_update" ON public.tasks
  FOR UPDATE TO anon, authenticated USING (true);

CREATE POLICY "tasks_delete" ON public.tasks
  FOR DELETE TO anon, authenticated USING (true);

-- task_subtasks
ALTER TABLE public.task_subtasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "task_subtasks_select" ON public.task_subtasks
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "task_subtasks_insert" ON public.task_subtasks
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "task_subtasks_update" ON public.task_subtasks
  FOR UPDATE TO anon, authenticated USING (true);

CREATE POLICY "task_subtasks_delete" ON public.task_subtasks
  FOR DELETE TO anon, authenticated USING (true);

-- task_attachments
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "task_attachments_select" ON public.task_attachments
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "task_attachments_insert" ON public.task_attachments
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "task_attachments_delete" ON public.task_attachments
  FOR DELETE TO anon, authenticated USING (true);

-- task_comments
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "task_comments_select" ON public.task_comments
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "task_comments_insert" ON public.task_comments
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "task_comments_delete" ON public.task_comments
  FOR DELETE TO anon, authenticated USING (true);
