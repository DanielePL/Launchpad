import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { activityLogEndpoints } from "@/api/endpoints/activityLog";
import type {
  ActivityLogFilters,
  CreateActivityLogInput,
} from "@/api/types/activityLog";

// =============================================================================
// Query Keys
// =============================================================================

export const activityLogKeys = {
  all: ["activityLog"] as const,
  logs: (filters?: ActivityLogFilters) =>
    [...activityLogKeys.all, "logs", filters] as const,
  stats: (days?: number) => [...activityLogKeys.all, "stats", days] as const,
};

// =============================================================================
// Hooks
// =============================================================================

/**
 * Query hook for fetching activity logs
 */
export function useActivityLogs(filters?: ActivityLogFilters) {
  return useQuery({
    queryKey: activityLogKeys.logs(filters),
    queryFn: () => activityLogEndpoints.getActivityLogs(filters),
  });
}

/**
 * Query hook for fetching activity statistics
 */
export function useActivityStats(days = 30) {
  return useQuery({
    queryKey: activityLogKeys.stats(days),
    queryFn: () => activityLogEndpoints.getActivityStats(days),
  });
}

/**
 * Mutation hook for logging an activity
 * Note: Most activities are logged automatically via database triggers.
 * This hook is for manual logging of custom activities.
 */
export function useLogActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateActivityLogInput) =>
      activityLogEndpoints.logActivity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityLogKeys.all });
    },
  });
}

// =============================================================================
// Helper: Human-readable action labels
// =============================================================================

export const ACTION_LABELS: Record<string, string> = {
  // Member actions
  "member.added": "Team member added",
  "member.removed": "Team member removed",
  "member.role_changed": "Member role changed",
  // Invitation actions
  "invitation.sent": "Invitation sent",
  "invitation.revoked": "Invitation revoked",
  "invitation.accepted": "Invitation accepted",
  // Organization actions
  "organization.created": "Organization created",
  "organization.updated": "Organization settings updated",
  "organization.deleted": "Organization deleted",
  // Creator actions
  "creator.created": "Creator added",
  "creator.updated": "Creator updated",
  "creator.deleted": "Creator deleted",
  // Task actions
  "task.created": "Task created",
  "task.updated": "Task updated",
  "task.deleted": "Task deleted",
  "task.completed": "Task completed",
  // Contract actions
  "contract.created": "Contract created",
  "contract.updated": "Contract updated",
  "contract.deleted": "Contract deleted",
  // Deal actions
  "deal.created": "Deal created",
  "deal.updated": "Deal updated",
  "deal.deleted": "Deal deleted",
  // Settings actions
  "settings.updated": "Settings updated",
  "billing.updated": "Billing updated",
};

export const ENTITY_TYPE_LABELS: Record<string, string> = {
  member: "Team Member",
  invitation: "Invitation",
  organization: "Organization",
  creator: "Creator",
  task: "Task",
  contract: "Contract",
  deal: "Deal",
  settings: "Settings",
};

/**
 * Get human-readable label for an action
 */
export function getActionLabel(action: string): string {
  return ACTION_LABELS[action] || action;
}

/**
 * Get human-readable label for an entity type
 */
export function getEntityTypeLabel(entityType: string): string {
  return ENTITY_TYPE_LABELS[entityType] || entityType;
}
