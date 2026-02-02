import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appLaunchEndpoints } from "@/api/endpoints/appLaunch";
import type {
  CreateAppProjectInput,
  UpdateAppProjectInput,
  CreateConversationInput,
  InviteTesterInput,
  CreateReleaseInput,
  ChecklistCategory,
} from "@/api/types/appLaunch";

// =============================================================================
// Query Keys
// =============================================================================

export const appLaunchKeys = {
  all: ["appLaunch"] as const,
  projects: () => [...appLaunchKeys.all, "projects"] as const,
  project: (id: string) => [...appLaunchKeys.all, "project", id] as const,
  checklist: (projectId: string) => [...appLaunchKeys.all, "checklist", projectId] as const,
  conversations: (projectId?: string) => [...appLaunchKeys.all, "conversations", projectId] as const,
  conversation: (id: string) => [...appLaunchKeys.all, "conversation", id] as const,
  betaTesters: (projectId: string) => [...appLaunchKeys.all, "betaTesters", projectId] as const,
  releases: (projectId: string) => [...appLaunchKeys.all, "releases", projectId] as const,
  stats: () => [...appLaunchKeys.all, "stats"] as const,
};

// =============================================================================
// Project Hooks
// =============================================================================

/**
 * Get all app projects
 */
export function useAppProjects() {
  return useQuery({
    queryKey: appLaunchKeys.projects(),
    queryFn: appLaunchEndpoints.getAppProjects,
  });
}

/**
 * Get a single app project
 */
export function useAppProject(projectId: string) {
  return useQuery({
    queryKey: appLaunchKeys.project(projectId),
    queryFn: () => appLaunchEndpoints.getAppProject(projectId),
    enabled: !!projectId,
  });
}

/**
 * Create a new app project
 */
export function useCreateAppProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAppProjectInput) =>
      appLaunchEndpoints.createAppProject(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appLaunchKeys.projects() });
      queryClient.invalidateQueries({ queryKey: appLaunchKeys.stats() });
    },
  });
}

/**
 * Update an app project
 */
export function useUpdateAppProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAppProjectInput }) =>
      appLaunchEndpoints.updateAppProject(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: appLaunchKeys.project(id) });
      queryClient.invalidateQueries({ queryKey: appLaunchKeys.projects() });
    },
  });
}

/**
 * Delete an app project
 */
export function useDeleteAppProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) =>
      appLaunchEndpoints.deleteAppProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appLaunchKeys.projects() });
      queryClient.invalidateQueries({ queryKey: appLaunchKeys.stats() });
    },
  });
}

// =============================================================================
// Checklist Hooks
// =============================================================================

/**
 * Get project checklist
 */
export function useProjectChecklist(projectId: string) {
  return useQuery({
    queryKey: appLaunchKeys.checklist(projectId),
    queryFn: () => appLaunchEndpoints.getProjectChecklist(projectId),
    enabled: !!projectId,
  });
}

/**
 * Get checklist progress by category
 */
export function useChecklistProgress(projectId: string) {
  const { data: checklist } = useProjectChecklist(projectId);

  if (!checklist) {
    return { progress: [], totalProgress: 0 };
  }

  const categories: ChecklistCategory[] = [
    "setup",
    "store_listing",
    "assets",
    "compliance",
    "beta",
    "release",
  ];

  const progress = categories.map((category) => {
    const items = checklist.filter((item) => item.category === category);
    const completed = items.filter((item) => item.is_completed).length;
    return {
      category,
      total: items.length,
      completed,
      percentage: items.length > 0 ? Math.round((completed / items.length) * 100) : 0,
    };
  });

  const totalItems = checklist.length;
  const totalCompleted = checklist.filter((item) => item.is_completed).length;
  const totalProgress = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

  return { progress, totalProgress };
}

/**
 * Toggle checklist item
 */
export function useToggleChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, completed }: { itemId: string; completed: boolean }) =>
      appLaunchEndpoints.toggleChecklistItem(itemId, completed),
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({
          queryKey: appLaunchKeys.checklist(data.project_id),
        });
        queryClient.invalidateQueries({
          queryKey: appLaunchKeys.project(data.project_id),
        });
      }
    },
  });
}

// =============================================================================
// AI Conversation Hooks
// =============================================================================

/**
 * Get conversations
 */
export function useConversations(projectId?: string) {
  return useQuery({
    queryKey: appLaunchKeys.conversations(projectId),
    queryFn: () => appLaunchEndpoints.getConversations(projectId),
  });
}

/**
 * Get a single conversation with messages
 */
export function useConversation(conversationId: string) {
  return useQuery({
    queryKey: appLaunchKeys.conversation(conversationId),
    queryFn: () => appLaunchEndpoints.getConversation(conversationId),
    enabled: !!conversationId,
  });
}

/**
 * Create a new conversation
 */
export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateConversationInput) =>
      appLaunchEndpoints.createConversation(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: appLaunchKeys.conversations(data?.project_id || undefined),
      });
    },
  });
}

/**
 * Send a message (local only - for manual message adding)
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      content,
    }: {
      conversationId: string;
      content: string;
    }) => appLaunchEndpoints.addMessage(conversationId, "user", content),
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({
        queryKey: appLaunchKeys.conversation(conversationId),
      });
    },
  });
}

/**
 * Send a message to Launch AI and get a response
 */
export function useSendAIMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      message,
      conversationId,
      projectId,
    }: {
      message: string;
      conversationId?: string;
      projectId?: string;
    }) => appLaunchEndpoints.sendAIMessage(message, conversationId, projectId),
    onSuccess: (data) => {
      if (data?.conversation_id) {
        queryClient.invalidateQueries({
          queryKey: appLaunchKeys.conversation(data.conversation_id),
        });
        queryClient.invalidateQueries({
          queryKey: appLaunchKeys.conversations(),
        });
      }
    },
  });
}

// =============================================================================
// Beta Tester Hooks
// =============================================================================

/**
 * Get beta testers for a project
 */
export function useBetaTesters(projectId: string) {
  return useQuery({
    queryKey: appLaunchKeys.betaTesters(projectId),
    queryFn: () => appLaunchEndpoints.getBetaTesters(projectId),
    enabled: !!projectId,
  });
}

/**
 * Invite beta testers
 */
export function useInviteBetaTesters() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (testers: InviteTesterInput[]) =>
      appLaunchEndpoints.inviteBetaTesters(testers),
    onSuccess: (_, testers) => {
      if (testers[0]?.project_id) {
        queryClient.invalidateQueries({
          queryKey: appLaunchKeys.betaTesters(testers[0].project_id),
        });
      }
    },
  });
}

// =============================================================================
// Release Hooks
// =============================================================================

/**
 * Get releases for a project
 */
export function useReleases(projectId: string) {
  return useQuery({
    queryKey: appLaunchKeys.releases(projectId),
    queryFn: () => appLaunchEndpoints.getReleases(projectId),
    enabled: !!projectId,
  });
}

/**
 * Create a release
 */
export function useCreateRelease() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateReleaseInput) =>
      appLaunchEndpoints.createRelease(input),
    onSuccess: (_, input) => {
      queryClient.invalidateQueries({
        queryKey: appLaunchKeys.releases(input.project_id),
      });
    },
  });
}

// =============================================================================
// Stats Hook
// =============================================================================

/**
 * Get app launch dashboard stats
 */
export function useAppLaunchStats() {
  return useQuery({
    queryKey: appLaunchKeys.stats(),
    queryFn: appLaunchEndpoints.getAppLaunchStats,
  });
}

// =============================================================================
// Helper: Category Labels
// =============================================================================

export const CATEGORY_LABELS: Record<ChecklistCategory, string> = {
  setup: "Setup",
  store_listing: "Store Listing",
  assets: "Assets",
  compliance: "Compliance",
  beta: "Beta Testing",
  release: "Release",
};

export const CATEGORY_ICONS: Record<ChecklistCategory, string> = {
  setup: "Settings",
  store_listing: "FileText",
  assets: "Image",
  compliance: "Shield",
  beta: "Users",
  release: "Rocket",
};
