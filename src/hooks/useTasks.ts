import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksEndpoints } from "@/api/endpoints/tasks";
import type {
  CreateProjectInput,
  UpdateProjectInput,
  CreateTaskInput,
  UpdateTaskInput,
  CreateSubtaskInput,
  CreateCommentInput,
  AttachFileInput,
  TaskFilters,
  TaskStatus,
} from "@/api/types/tasks";

// =============================================================================
// Query Keys
// =============================================================================

export const tasksKeys = {
  all: ["tasks"] as const,
  // Projects
  projects: () => [...tasksKeys.all, "projects"] as const,
  project: (id: string) => [...tasksKeys.projects(), id] as const,
  // Tasks
  tasks: () => [...tasksKeys.all, "tasks"] as const,
  tasksList: (filters?: TaskFilters) => [...tasksKeys.tasks(), filters] as const,
  task: (id: string) => [...tasksKeys.tasks(), id] as const,
  // Stats & Alerts
  stats: () => [...tasksKeys.all, "stats"] as const,
  deadlineAlerts: () => [...tasksKeys.all, "deadline-alerts"] as const,
};

// =============================================================================
// Project Hooks
// =============================================================================

export function useProjects(includeArchived = false) {
  return useQuery({
    queryKey: [...tasksKeys.projects(), { includeArchived }],
    queryFn: () => tasksEndpoints.getProjects(includeArchived),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: tasksKeys.project(id),
    queryFn: () => tasksEndpoints.getProject(id),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectInput) => tasksEndpoints.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.projects() });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectInput }) =>
      tasksEndpoints.updateProject(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.projects() });
      queryClient.invalidateQueries({ queryKey: tasksKeys.project(id) });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tasksEndpoints.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.projects() });
      queryClient.invalidateQueries({ queryKey: tasksKeys.tasks() });
    },
  });
}

// =============================================================================
// Task Hooks
// =============================================================================

export function useTasks(filters?: TaskFilters) {
  return useQuery({
    queryKey: tasksKeys.tasksList(filters),
    queryFn: () => tasksEndpoints.getTasks(filters),
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: tasksKeys.task(id),
    queryFn: () => tasksEndpoints.getTask(id),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskInput) => tasksEndpoints.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.tasks() });
      queryClient.invalidateQueries({ queryKey: tasksKeys.stats() });
      queryClient.invalidateQueries({ queryKey: tasksKeys.deadlineAlerts() });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskInput }) =>
      tasksEndpoints.updateTask(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.tasks() });
      queryClient.invalidateQueries({ queryKey: tasksKeys.task(id) });
      queryClient.invalidateQueries({ queryKey: tasksKeys.stats() });
      queryClient.invalidateQueries({ queryKey: tasksKeys.deadlineAlerts() });
    },
  });
}

export function useUpdateTaskStatus() {
  const updateTask = useUpdateTask();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      updateTask.mutateAsync({ id, data: { status } }),
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tasksEndpoints.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.tasks() });
      queryClient.invalidateQueries({ queryKey: tasksKeys.stats() });
      queryClient.invalidateQueries({ queryKey: tasksKeys.deadlineAlerts() });
    },
  });
}

// =============================================================================
// Subtask Hooks
// =============================================================================

export function useCreateSubtask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSubtaskInput) => tasksEndpoints.createSubtask(data),
    onSuccess: (_, { task_id }) => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.task(task_id) });
      queryClient.invalidateQueries({ queryKey: tasksKeys.tasks() });
    },
  });
}

export function useToggleSubtask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      completed,
    }: {
      id: string;
      completed: boolean;
      taskId: string;
    }) => tasksEndpoints.toggleSubtask(id, completed),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.task(taskId) });
      queryClient.invalidateQueries({ queryKey: tasksKeys.tasks() });
    },
  });
}

export function useUpdateSubtask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      title,
    }: {
      id: string;
      title: string;
      taskId: string;
    }) => tasksEndpoints.updateSubtask(id, title),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.task(taskId) });
      queryClient.invalidateQueries({ queryKey: tasksKeys.tasks() });
    },
  });
}

export function useDeleteSubtask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; taskId: string }) =>
      tasksEndpoints.deleteSubtask(id),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.task(taskId) });
      queryClient.invalidateQueries({ queryKey: tasksKeys.tasks() });
    },
  });
}

// =============================================================================
// Comment Hooks
// =============================================================================

export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommentInput) => tasksEndpoints.addComment(data),
    onSuccess: (_, { task_id }) => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.task(task_id) });
      queryClient.invalidateQueries({ queryKey: tasksKeys.tasks() });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; taskId: string }) =>
      tasksEndpoints.deleteComment(id),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.task(taskId) });
      queryClient.invalidateQueries({ queryKey: tasksKeys.tasks() });
    },
  });
}

// =============================================================================
// Attachment Hooks
// =============================================================================

export function useAttachFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AttachFileInput) => tasksEndpoints.attachFile(data),
    onSuccess: (_, { task_id }) => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.task(task_id) });
      queryClient.invalidateQueries({ queryKey: tasksKeys.tasks() });
    },
  });
}

export function useDetachFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, fileId }: { taskId: string; fileId: string }) =>
      tasksEndpoints.detachFile(taskId, fileId),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.task(taskId) });
      queryClient.invalidateQueries({ queryKey: tasksKeys.tasks() });
    },
  });
}

// =============================================================================
// Stats & Alerts Hooks
// =============================================================================

export function useTaskStats() {
  return useQuery({
    queryKey: tasksKeys.stats(),
    queryFn: tasksEndpoints.getTaskStats,
  });
}

export function useDeadlineAlerts() {
  return useQuery({
    queryKey: tasksKeys.deadlineAlerts(),
    queryFn: tasksEndpoints.getDeadlineAlerts,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
}
