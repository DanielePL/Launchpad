// =============================================================================
// Prometheus Tasks - TypeScript Types
// =============================================================================

// Team members who can be assigned to tasks
export type TaskAssignee = "Daniele" | "Karin" | "Sjoerd" | "Valerie" | "Basil";

// Task workflow status
export type TaskStatus = "todo" | "in_progress" | "review" | "done";

// Task priority levels
export type TaskPriority = "low" | "medium" | "high" | "urgent";

// Deadline urgency classification
export type DeadlineUrgency = "overdue" | "urgent" | "warning" | "safe" | "none";

// =============================================================================
// Core Interfaces
// =============================================================================

export interface TaskProject {
  id: string;
  name: string;
  description?: string;
  color: string;
  archived: boolean;
  created_by: TaskAssignee;
  created_at: string;
  updated_at: string;
  // Computed fields from queries
  task_count?: number;
  completed_count?: number;
}

export interface TaskSubtask {
  id: string;
  task_id: string;
  title: string;
  completed: boolean;
  sort_order: number;
  created_at: string;
}

export interface TaskAttachment {
  id: string;
  task_id: string;
  file_id: string;
  attached_by: TaskAssignee;
  attached_at: string;
  // Joined from team_files
  file?: {
    id: string;
    file_name: string;
    original_name: string;
    mime_type: string;
    file_size: number;
    public_url?: string;
  };
}

export interface TaskComment {
  id: string;
  task_id: string;
  content: string;
  created_by: TaskAssignee;
  created_at: string;
}

export interface Task {
  id: string;
  project_id?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: TaskAssignee;
  deadline?: string;
  completed_at?: string;
  created_by: TaskAssignee;
  created_at: string;
  updated_at: string;
  // Nested data from queries
  project?: TaskProject;
  subtasks?: TaskSubtask[];
  attachments?: TaskAttachment[];
  comments?: TaskComment[];
}

// =============================================================================
// Input Types
// =============================================================================

export interface CreateProjectInput {
  name: string;
  description?: string;
  color?: string;
  created_by: TaskAssignee;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  color?: string;
  archived?: boolean;
}

export interface CreateTaskInput {
  project_id?: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  assignee?: TaskAssignee;
  deadline?: string;
  created_by: TaskAssignee;
}

export interface UpdateTaskInput {
  project_id?: string | null;
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee?: TaskAssignee | null;
  deadline?: string | null;
}

export interface CreateSubtaskInput {
  task_id: string;
  title: string;
  sort_order?: number;
}

export interface CreateCommentInput {
  task_id: string;
  content: string;
  created_by: TaskAssignee;
}

export interface AttachFileInput {
  task_id: string;
  file_id: string;
  attached_by: TaskAssignee;
}

// =============================================================================
// Filter & Query Types
// =============================================================================

export interface TaskFilters {
  project_id?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee?: TaskAssignee;
  has_deadline?: boolean;
  overdue?: boolean;
  due_soon?: boolean; // Next 7 days
}

export interface TaskStats {
  total: number;
  by_status: Record<TaskStatus, number>;
  by_priority: Record<TaskPriority, number>;
  overdue: number;
  due_soon: number;
  completed_this_week: number;
}

export interface DeadlineAlert {
  task: Task;
  urgency: DeadlineUrgency;
  days_remaining: number;
}

// =============================================================================
// Constants
// =============================================================================

export const TASK_ASSIGNEES: TaskAssignee[] = [
  "Daniele",
  "Karin",
  "Sjoerd",
  "Valerie",
  "Basil",
];

export const TASK_STATUSES: { value: TaskStatus; label: string; color: string }[] = [
  { value: "todo", label: "To Do", color: "bg-slate-500" },
  { value: "in_progress", label: "In Progress", color: "bg-blue-500" },
  { value: "review", label: "Review", color: "bg-purple-500" },
  { value: "done", label: "Done", color: "bg-green-500" },
];

export const TASK_PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "bg-slate-500" },
  { value: "medium", label: "Medium", color: "bg-blue-500" },
  { value: "high", label: "High", color: "bg-orange-500" },
  { value: "urgent", label: "Urgent", color: "bg-red-500" },
];

export const STATUS_COLORS: Record<TaskStatus, { bg: string; text: string }> = {
  todo: { bg: "bg-slate-500/20", text: "text-slate-400" },
  in_progress: { bg: "bg-blue-500/20", text: "text-blue-400" },
  review: { bg: "bg-purple-500/20", text: "text-purple-400" },
  done: { bg: "bg-green-500/20", text: "text-green-400" },
};

export const PRIORITY_COLORS: Record<TaskPriority, { bg: string; text: string }> = {
  low: { bg: "bg-slate-500/20", text: "text-slate-400" },
  medium: { bg: "bg-blue-500/20", text: "text-blue-400" },
  high: { bg: "bg-orange-500/20", text: "text-orange-400" },
  urgent: { bg: "bg-red-500/20", text: "text-red-400" },
};

export const DEADLINE_COLORS: Record<DeadlineUrgency, { bg: string; text: string }> = {
  overdue: { bg: "bg-red-500/20", text: "text-red-400" },
  urgent: { bg: "bg-orange-500/20", text: "text-orange-400" },
  warning: { bg: "bg-yellow-500/20", text: "text-yellow-400" },
  safe: { bg: "bg-green-500/20", text: "text-green-400" },
  none: { bg: "bg-slate-500/20", text: "text-slate-400" },
};

export const PROJECT_COLORS = [
  "#f97316", // Orange (default)
  "#ef4444", // Red
  "#f59e0b", // Amber
  "#84cc16", // Lime
  "#22c55e", // Green
  "#14b8a6", // Teal
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
  "#8b5cf6", // Violet
  "#ec4899", // Pink
];

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Calculate deadline urgency based on days remaining
 */
export function getDeadlineUrgency(deadline?: string): {
  urgency: DeadlineUrgency;
  daysRemaining: number;
} {
  if (!deadline) {
    return { urgency: "none", daysRemaining: Infinity };
  }

  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffMs = deadlineDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) {
    return { urgency: "overdue", daysRemaining };
  }
  if (daysRemaining <= 1) {
    return { urgency: "urgent", daysRemaining };
  }
  if (daysRemaining <= 3) {
    return { urgency: "warning", daysRemaining };
  }
  return { urgency: "safe", daysRemaining };
}

/**
 * Format deadline for display
 */
export function formatDeadline(deadline?: string): string {
  if (!deadline) return "";

  const date = new Date(deadline);
  const { daysRemaining } = getDeadlineUrgency(deadline);

  if (daysRemaining < 0) {
    return `${Math.abs(daysRemaining)} days overdue`;
  }
  if (daysRemaining === 0) {
    return "Due today";
  }
  if (daysRemaining === 1) {
    return "Due tomorrow";
  }
  if (daysRemaining <= 7) {
    return `Due in ${daysRemaining} days`;
  }

  return date.toLocaleDateString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Calculate subtask progress
 */
export function getSubtaskProgress(subtasks?: TaskSubtask[]): {
  completed: number;
  total: number;
  percent: number;
} {
  if (!subtasks || subtasks.length === 0) {
    return { completed: 0, total: 0, percent: 0 };
  }

  const completed = subtasks.filter((s) => s.completed).length;
  const total = subtasks.length;
  const percent = Math.round((completed / total) * 100);

  return { completed, total, percent };
}

/**
 * Get initials from assignee name
 */
export function getAssigneeInitials(assignee?: TaskAssignee): string {
  if (!assignee) return "?";
  return assignee.charAt(0).toUpperCase();
}

/**
 * Get assignee color for avatar
 */
export function getAssigneeColor(assignee?: TaskAssignee): string {
  const colors: Record<TaskAssignee, string> = {
    Daniele: "bg-blue-500",
    Karin: "bg-purple-500",
    Sjoerd: "bg-green-500",
    Valerie: "bg-pink-500",
    Basil: "bg-amber-500",
  };
  return assignee ? colors[assignee] : "bg-slate-500";
}
