import { adminApi } from "../client";
import type { CrashStats, CrashIssue, CrashEvent, CrashFilters } from "../types/crashes";

export const crashesApi = {
  // Get crash statistics overview
  getStats: async (platform?: "android" | "ios"): Promise<CrashStats> => {
    const response = await adminApi.get<CrashStats>("/crashes/stats", {
      params: { platform },
    });
    return response.data;
  },

  // Get list of crash issues
  getIssues: async (filters?: CrashFilters): Promise<CrashIssue[]> => {
    const response = await adminApi.get<CrashIssue[]>("/crashes/issues", {
      params: filters,
    });
    return response.data;
  },

  // Get single issue details
  getIssue: async (issueId: string): Promise<CrashIssue> => {
    const response = await adminApi.get<CrashIssue>(`/crashes/issues/${issueId}`);
    return response.data;
  },

  // Get events for a specific issue
  getIssueEvents: async (issueId: string, limit?: number): Promise<CrashEvent[]> => {
    const response = await adminApi.get<CrashEvent[]>(`/crashes/issues/${issueId}/events`, {
      params: { limit },
    });
    return response.data;
  },

  // Update issue status
  updateIssueStatus: async (
    issueId: string,
    status: "open" | "closed" | "muted"
  ): Promise<CrashIssue> => {
    const response = await adminApi.patch<CrashIssue>(`/crashes/issues/${issueId}`, {
      status,
    });
    return response.data;
  },

  // Get recent crash events
  getRecentEvents: async (filters?: CrashFilters, limit?: number): Promise<CrashEvent[]> => {
    const response = await adminApi.get<CrashEvent[]>("/crashes/events", {
      params: { ...filters, limit },
    });
    return response.data;
  },
};
