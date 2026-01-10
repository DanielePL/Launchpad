// Asana API Client
import type {
  AsanaTask,
  AsanaUser,
  AsanaWorkspace,
  AsanaResponse,
  AsanaConfig,
} from "./types/asana";

const ASANA_API_BASE = "https://app.asana.com/api/1.0";

class AsanaClient {
  private config: AsanaConfig | null = null;

  configure(config: AsanaConfig) {
    this.config = config;
  }

  isConfigured(): boolean {
    return !!this.config?.accessToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.config?.accessToken) {
      throw new Error("Asana not configured. Please add your access token.");
    }

    const response = await fetch(`${ASANA_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.errors?.[0]?.message || `Asana API error: ${response.status}`);
    }

    return response.json();
  }

  // Get current user
  async getMe(): Promise<AsanaUser> {
    const response = await this.request<AsanaResponse<AsanaUser>>("/users/me");
    return response.data;
  }

  // Get workspaces
  async getWorkspaces(): Promise<AsanaWorkspace[]> {
    const response = await this.request<AsanaResponse<AsanaWorkspace[]>>("/workspaces");
    return response.data;
  }

  // Get users in workspace
  async getWorkspaceUsers(workspaceGid: string): Promise<AsanaUser[]> {
    const response = await this.request<AsanaResponse<AsanaUser[]>>(
      `/workspaces/${workspaceGid}/users?opt_fields=name,email,photo`
    );
    return response.data;
  }

  // Search tasks in workspace using the Search API
  async searchTasks(
    workspaceGid: string,
    options: {
      assignee?: string;
      completedSince?: string;
      modifiedAfter?: string;
      isCompleted?: boolean;
    } = {}
  ): Promise<AsanaTask[]> {
    const params = new URLSearchParams({
      opt_fields: "name,completed,completed_at,completed_by,due_on,due_at,created_at,modified_at,projects.name,tags.name,assignee.name",
    });

    if (options.assignee) {
      params.set("assignee.any", options.assignee);
    }

    if (options.completedSince) {
      params.set("completed_on.after", options.completedSince.split("T")[0]);
    }

    if (options.modifiedAfter) {
      params.set("modified_on.after", options.modifiedAfter.split("T")[0]);
    }

    if (options.isCompleted !== undefined) {
      params.set("completed", options.isCompleted.toString());
    }

    const response = await this.request<AsanaResponse<AsanaTask[]>>(
      `/workspaces/${workspaceGid}/tasks/search?${params.toString()}`
    );
    return response.data;
  }

  // Get user's task list GID
  async getUserTaskList(userGid: string, workspaceGid: string): Promise<string> {
    const response = await this.request<AsanaResponse<{ gid: string }>>(
      `/users/${userGid}/user_task_list?workspace=${workspaceGid}`
    );
    return response.data.gid;
  }

  // Get tasks from a user's task list
  async getTasksFromTaskList(
    taskListGid: string,
    options: {
      completedSince?: string;
    } = {}
  ): Promise<AsanaTask[]> {
    const params = new URLSearchParams({
      opt_fields: "name,completed,completed_at,completed_by,due_on,due_at,created_at,modified_at,projects.name,tags.name,assignee.name",
    });

    if (options.completedSince) {
      params.set("completed_since", options.completedSince);
    }

    const response = await this.request<AsanaResponse<AsanaTask[]>>(
      `/user_task_lists/${taskListGid}/tasks?${params.toString()}`
    );
    return response.data;
  }

  // Get all tasks for a user (using user task list - more reliable)
  async getUserTasks(
    userGid: string,
    workspaceGid: string,
    options: {
      completedSince?: string;
      modifiedSince?: string;
    } = {}
  ): Promise<AsanaTask[]> {
    try {
      // Try user task list first (most reliable)
      const taskListGid = await this.getUserTaskList(userGid, workspaceGid);
      const tasks = await this.getTasksFromTaskList(taskListGid, {
        completedSince: options.completedSince || options.modifiedSince,
      });
      return tasks;
    } catch (error) {
      // Fallback to search API
      console.warn("User task list failed, falling back to search:", error);
      const [completedTasks, incompleteTasks] = await Promise.all([
        this.searchTasks(workspaceGid, {
          assignee: userGid,
          isCompleted: true,
          completedSince: options.completedSince,
          modifiedAfter: options.modifiedSince,
        }),
        this.searchTasks(workspaceGid, {
          assignee: userGid,
          isCompleted: false,
        }),
      ]);
      return [...completedTasks, ...incompleteTasks];
    }
  }

  // Get completed tasks for a user in date range
  async getCompletedTasks(
    userGid: string,
    workspaceGid: string,
    since: Date
  ): Promise<AsanaTask[]> {
    return this.searchTasks(workspaceGid, {
      assignee: userGid,
      isCompleted: true,
      completedSince: since.toISOString(),
    });
  }

  // Calculate task metrics for a user
  async calculateUserMetrics(
    userGid: string,
    workspaceGid: string,
    periodStart: Date,
    _periodEnd: Date
  ): Promise<{
    completed: number;
    pending: number;
    overdue: number;
    onTimeRate: number;
  }> {
    const tasks = await this.getUserTasks(userGid, workspaceGid, {
      modifiedSince: periodStart.toISOString(),
    });

    const now = new Date();
    let completed = 0;
    let pending = 0;
    let overdue = 0;
    let onTime = 0;
    let late = 0;

    tasks.forEach((task) => {
      if (task.completed) {
        completed++;

        // Check if completed on time
        if (task.due_on && task.completed_at) {
          const dueDate = new Date(task.due_on);
          const completedDate = new Date(task.completed_at);

          if (completedDate <= dueDate) {
            onTime++;
          } else {
            late++;
          }
        } else {
          // No due date = on time
          onTime++;
        }
      } else {
        pending++;

        // Check if overdue
        if (task.due_on) {
          const dueDate = new Date(task.due_on);
          if (dueDate < now) {
            overdue++;
          }
        }
      }
    });

    const totalWithDue = onTime + late;
    const onTimeRate = totalWithDue > 0 ? (onTime / totalWithDue) * 100 : 100;

    return {
      completed,
      pending,
      overdue,
      onTimeRate: Math.round(onTimeRate),
    };
  }
}

// Singleton instance
export const asanaClient = new AsanaClient();
