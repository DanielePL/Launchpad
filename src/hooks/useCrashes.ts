import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { crashesApi } from "@/api/endpoints/crashes";
import type { CrashFilters } from "@/api/types/crashes";

// Query keys
export const crashesKeys = {
  all: ["crashes"] as const,
  stats: (platform?: "android" | "ios") => [...crashesKeys.all, "stats", platform] as const,
  issues: (filters?: CrashFilters) => [...crashesKeys.all, "issues", filters] as const,
  issue: (id: string) => [...crashesKeys.all, "issue", id] as const,
  issueEvents: (id: string) => [...crashesKeys.all, "issue", id, "events"] as const,
  events: (filters?: CrashFilters) => [...crashesKeys.all, "events", filters] as const,
};

// Get crash statistics
export function useCrashStats(platform?: "android" | "ios") {
  return useQuery({
    queryKey: crashesKeys.stats(platform),
    queryFn: () => crashesApi.getStats(platform),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get crash issues list
export function useCrashIssues(filters?: CrashFilters) {
  return useQuery({
    queryKey: crashesKeys.issues(filters),
    queryFn: () => crashesApi.getIssues(filters),
    staleTime: 1000 * 60 * 5,
  });
}

// Get single issue
export function useCrashIssue(issueId: string) {
  return useQuery({
    queryKey: crashesKeys.issue(issueId),
    queryFn: () => crashesApi.getIssue(issueId),
    enabled: !!issueId,
  });
}

// Get events for an issue
export function useCrashIssueEvents(issueId: string, limit?: number) {
  return useQuery({
    queryKey: crashesKeys.issueEvents(issueId),
    queryFn: () => crashesApi.getIssueEvents(issueId, limit),
    enabled: !!issueId,
  });
}

// Get recent events
export function useCrashEvents(filters?: CrashFilters, limit?: number) {
  return useQuery({
    queryKey: crashesKeys.events(filters),
    queryFn: () => crashesApi.getRecentEvents(filters, limit),
    staleTime: 1000 * 60 * 5,
  });
}

// Update issue status
export function useUpdateCrashIssueStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      issueId,
      status,
    }: {
      issueId: string;
      status: "open" | "closed" | "muted";
    }) => crashesApi.updateIssueStatus(issueId, status),
    onSuccess: (_, { issueId }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: crashesKeys.issues() });
      queryClient.invalidateQueries({ queryKey: crashesKeys.issue(issueId) });
      queryClient.invalidateQueries({ queryKey: crashesKeys.stats() });
    },
  });
}
