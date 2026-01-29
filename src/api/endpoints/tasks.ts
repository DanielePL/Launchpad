import { supabase, isSupabaseConfigured } from "../supabaseClient";
import type {
  Task,
  TaskProject,
  TaskSubtask,
  TaskComment,
  TaskAttachment,
  TaskFilters,
  TaskStats,
  DeadlineAlert,
  CreateProjectInput,
  UpdateProjectInput,
  CreateTaskInput,
  UpdateTaskInput,
  CreateSubtaskInput,
  CreateCommentInput,
  AttachFileInput,
  TaskStatus,
  TaskPriority,
} from "../types/tasks";
import { getDeadlineUrgency } from "../types/tasks";

const PROJECTS_TABLE = "task_projects";
const TASKS_TABLE = "tasks";
const SUBTASKS_TABLE = "task_subtasks";
const COMMENTS_TABLE = "task_comments";
const ATTACHMENTS_TABLE = "task_attachments";

function requireSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase not configured");
  }
  return supabase;
}

export const tasksEndpoints = {
  // ==========================================================================
  // Projects
  // ==========================================================================

  getProjects: async (includeArchived = false): Promise<TaskProject[]> => {
    if (!isSupabaseConfigured) return [];
    const client = requireSupabase();

    let query = client
      .from(PROJECTS_TABLE)
      .select("*")
      .order("created_at", { ascending: false });

    if (!includeArchived) {
      query = query.eq("archived", false);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  getProject: async (id: string): Promise<TaskProject> => {
    const client = requireSupabase();
    const { data, error } = await client
      .from(PROJECTS_TABLE)
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  createProject: async (
    input: CreateProjectInput
  ): Promise<{ success: boolean; project: TaskProject }> => {
    const client = requireSupabase();
    const { data, error } = await client
      .from(PROJECTS_TABLE)
      .insert(input)
      .select()
      .single();
    if (error) throw error;
    return { success: true, project: data };
  },

  updateProject: async (
    id: string,
    input: UpdateProjectInput
  ): Promise<{ success: boolean; project: TaskProject }> => {
    const client = requireSupabase();
    const { data, error } = await client
      .from(PROJECTS_TABLE)
      .update(input)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return { success: true, project: data };
  },

  deleteProject: async (id: string): Promise<{ success: boolean }> => {
    const client = requireSupabase();
    const { error } = await client.from(PROJECTS_TABLE).delete().eq("id", id);
    if (error) throw error;
    return { success: true };
  },

  // ==========================================================================
  // Tasks
  // ==========================================================================

  getTasks: async (filters?: TaskFilters): Promise<Task[]> => {
    if (!isSupabaseConfigured) return [];
    const client = requireSupabase();

    let query = client
      .from(TASKS_TABLE)
      .select(
        `
        *,
        project:task_projects(*),
        subtasks:task_subtasks(*),
        comments:task_comments(*),
        attachments:task_attachments(
          *,
          file:team_files(id, file_name, original_name, mime_type, file_size, public_url)
        )
      `
      )
      .order("created_at", { ascending: false });

    // Apply filters
    if (filters?.project_id) {
      query = query.eq("project_id", filters.project_id);
    }
    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.priority) {
      query = query.eq("priority", filters.priority);
    }
    if (filters?.assignee) {
      query = query.eq("assignee", filters.assignee);
    }
    if (filters?.has_deadline) {
      query = query.not("deadline", "is", null);
    }

    const { data, error } = await query;
    if (error) throw error;

    let tasks = (data || []).map((task) => ({
      ...task,
      subtasks: task.subtasks || [],
      comments: task.comments || [],
      attachments: task.attachments || [],
    }));

    // Post-filter for overdue/due_soon (requires date comparison)
    if (filters?.overdue) {
      const now = new Date();
      tasks = tasks.filter((task) => {
        if (!task.deadline || task.status === "done") return false;
        return new Date(task.deadline) < now;
      });
    }

    if (filters?.due_soon) {
      const now = new Date();
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      tasks = tasks.filter((task) => {
        if (!task.deadline || task.status === "done") return false;
        const deadline = new Date(task.deadline);
        return deadline >= now && deadline <= weekFromNow;
      });
    }

    return tasks;
  },

  getTask: async (id: string): Promise<Task> => {
    const client = requireSupabase();
    const { data, error } = await client
      .from(TASKS_TABLE)
      .select(
        `
        *,
        project:task_projects(*),
        subtasks:task_subtasks(*)
      `
      )
      .eq("id", id)
      .single();
    if (error) throw error;

    // Fetch comments separately to order them
    const { data: comments } = await client
      .from(COMMENTS_TABLE)
      .select("*")
      .eq("task_id", id)
      .order("created_at", { ascending: true });

    // Fetch attachments with file details
    const { data: attachments } = await client
      .from(ATTACHMENTS_TABLE)
      .select(
        `
        *,
        file:team_files(id, file_name, original_name, mime_type, file_size, public_url)
      `
      )
      .eq("task_id", id);

    return {
      ...data,
      subtasks: data.subtasks || [],
      comments: comments || [],
      attachments: attachments || [],
    };
  },

  createTask: async (
    input: CreateTaskInput
  ): Promise<{ success: boolean; id: string; task: Task }> => {
    const client = requireSupabase();
    const { data, error } = await client
      .from(TASKS_TABLE)
      .insert({
        ...input,
        status: "todo",
      })
      .select()
      .single();
    if (error) throw error;

    const task = await tasksEndpoints.getTask(data.id);
    return { success: true, id: data.id, task };
  },

  updateTask: async (
    id: string,
    input: UpdateTaskInput
  ): Promise<{ success: boolean; task: Task }> => {
    const client = requireSupabase();
    const { error } = await client
      .from(TASKS_TABLE)
      .update(input)
      .eq("id", id);
    if (error) throw error;

    const task = await tasksEndpoints.getTask(id);
    return { success: true, task };
  },

  deleteTask: async (id: string): Promise<{ success: boolean }> => {
    const client = requireSupabase();
    const { error } = await client.from(TASKS_TABLE).delete().eq("id", id);
    if (error) throw error;
    return { success: true };
  },

  // ==========================================================================
  // Subtasks
  // ==========================================================================

  createSubtask: async (
    input: CreateSubtaskInput
  ): Promise<{ success: boolean; subtask: TaskSubtask }> => {
    const client = requireSupabase();

    // Get max sort_order for this task
    const { data: existing } = await client
      .from(SUBTASKS_TABLE)
      .select("sort_order")
      .eq("task_id", input.task_id)
      .order("sort_order", { ascending: false })
      .limit(1);

    const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

    const { data, error } = await client
      .from(SUBTASKS_TABLE)
      .insert({
        ...input,
        sort_order: input.sort_order ?? nextOrder,
      })
      .select()
      .single();
    if (error) throw error;
    return { success: true, subtask: data };
  },

  toggleSubtask: async (
    id: string,
    completed: boolean
  ): Promise<{ success: boolean; subtask: TaskSubtask }> => {
    const client = requireSupabase();
    const { data, error } = await client
      .from(SUBTASKS_TABLE)
      .update({ completed })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return { success: true, subtask: data };
  },

  updateSubtask: async (
    id: string,
    title: string
  ): Promise<{ success: boolean; subtask: TaskSubtask }> => {
    const client = requireSupabase();
    const { data, error } = await client
      .from(SUBTASKS_TABLE)
      .update({ title })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return { success: true, subtask: data };
  },

  deleteSubtask: async (id: string): Promise<{ success: boolean }> => {
    const client = requireSupabase();
    const { error } = await client.from(SUBTASKS_TABLE).delete().eq("id", id);
    if (error) throw error;
    return { success: true };
  },

  // ==========================================================================
  // Comments
  // ==========================================================================

  addComment: async (
    input: CreateCommentInput
  ): Promise<{ success: boolean; comment: TaskComment }> => {
    const client = requireSupabase();
    const { data, error } = await client
      .from(COMMENTS_TABLE)
      .insert(input)
      .select()
      .single();
    if (error) throw error;
    return { success: true, comment: data };
  },

  deleteComment: async (id: string): Promise<{ success: boolean }> => {
    const client = requireSupabase();
    const { error } = await client.from(COMMENTS_TABLE).delete().eq("id", id);
    if (error) throw error;
    return { success: true };
  },

  // ==========================================================================
  // Attachments
  // ==========================================================================

  attachFile: async (
    input: AttachFileInput
  ): Promise<{ success: boolean; attachment: TaskAttachment }> => {
    const client = requireSupabase();
    const { data, error } = await client
      .from(ATTACHMENTS_TABLE)
      .insert(input)
      .select(
        `
        *,
        file:team_files(id, file_name, original_name, mime_type, file_size, public_url)
      `
      )
      .single();
    if (error) throw error;
    return { success: true, attachment: data };
  },

  detachFile: async (
    taskId: string,
    fileId: string
  ): Promise<{ success: boolean }> => {
    const client = requireSupabase();
    const { error } = await client
      .from(ATTACHMENTS_TABLE)
      .delete()
      .eq("task_id", taskId)
      .eq("file_id", fileId);
    if (error) throw error;
    return { success: true };
  },

  // ==========================================================================
  // Stats & Alerts
  // ==========================================================================

  getTaskStats: async (): Promise<TaskStats> => {
    if (!isSupabaseConfigured) {
      return {
        total: 0,
        by_status: { todo: 0, in_progress: 0, review: 0, done: 0 },
        by_priority: { low: 0, medium: 0, high: 0, urgent: 0 },
        overdue: 0,
        due_soon: 0,
        completed_this_week: 0,
      };
    }

    const client = requireSupabase();
    const { data, error } = await client
      .from(TASKS_TABLE)
      .select("status, priority, deadline, completed_at");
    if (error) throw error;

    const tasks = data || [];
    const now = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    const byStatus: Record<TaskStatus, number> = {
      todo: 0,
      in_progress: 0,
      review: 0,
      done: 0,
    };
    const byPriority: Record<TaskPriority, number> = {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0,
    };
    let overdue = 0;
    let dueSoon = 0;
    let completedThisWeek = 0;

    for (const task of tasks) {
      byStatus[task.status as TaskStatus]++;
      byPriority[task.priority as TaskPriority]++;

      if (task.deadline && task.status !== "done") {
        const deadline = new Date(task.deadline);
        if (deadline < now) {
          overdue++;
        } else if (deadline <= weekFromNow) {
          dueSoon++;
        }
      }

      if (task.completed_at && new Date(task.completed_at) >= weekAgo) {
        completedThisWeek++;
      }
    }

    return {
      total: tasks.length,
      by_status: byStatus,
      by_priority: byPriority,
      overdue,
      due_soon: dueSoon,
      completed_this_week: completedThisWeek,
    };
  },

  getDeadlineAlerts: async (): Promise<DeadlineAlert[]> => {
    if (!isSupabaseConfigured) return [];

    const client = requireSupabase();
    const { data, error } = await client
      .from(TASKS_TABLE)
      .select(
        `
        *,
        project:task_projects(id, name, color)
      `
      )
      .not("deadline", "is", null)
      .neq("status", "done")
      .order("deadline", { ascending: true });
    if (error) throw error;

    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    const alerts: DeadlineAlert[] = [];

    for (const task of data || []) {
      const deadline = new Date(task.deadline);
      // Only include overdue or due within 7 days
      if (deadline <= weekFromNow) {
        const { urgency, daysRemaining } = getDeadlineUrgency(task.deadline);
        alerts.push({
          task,
          urgency,
          days_remaining: daysRemaining,
        });
      }
    }

    // Sort: overdue first, then by days remaining
    alerts.sort((a, b) => {
      if (a.urgency === "overdue" && b.urgency !== "overdue") return -1;
      if (a.urgency !== "overdue" && b.urgency === "overdue") return 1;
      return a.days_remaining - b.days_remaining;
    });

    return alerts;
  },
};
