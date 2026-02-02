import { supabase } from "@/api/supabaseClient";
import type {
  ActivityLog,
  ActivityLogFilters,
  CreateActivityLogInput,
} from "@/api/types/activityLog";

// =============================================================================
// Activity Log API Endpoints
// =============================================================================

/**
 * Get activity logs for the current organization
 */
export async function getActivityLogs(
  filters?: ActivityLogFilters
): Promise<ActivityLog[]> {
  if (!supabase) return [];

  let query = supabase
    .from("activity_logs")
    .select("*")
    .order("created_at", { ascending: false });

  // Apply filters
  if (filters?.action) {
    query = query.eq("action", filters.action);
  }

  if (filters?.entity_type) {
    query = query.eq("entity_type", filters.entity_type);
  }

  if (filters?.user_id) {
    query = query.eq("user_id", filters.user_id);
  }

  if (filters?.days) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - filters.days);
    query = query.gte("created_at", cutoffDate.toISOString());
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  } else {
    query = query.limit(100); // Default limit
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching activity logs:", error);
    return [];
  }

  return data || [];
}

/**
 * Log an activity using the database function
 */
export async function logActivity(
  input: CreateActivityLogInput
): Promise<string | null> {
  if (!supabase) return null;

  const { data, error } = await supabase.rpc("log_activity", {
    p_action: input.action,
    p_entity_type: input.entity_type,
    p_entity_id: input.entity_id || null,
    p_entity_name: input.entity_name || null,
    p_details: input.details || {},
    p_user_agent: navigator.userAgent,
  });

  if (error) {
    console.error("Error logging activity:", error);
    return null;
  }

  return data;
}

/**
 * Get activity statistics
 */
export async function getActivityStats(days = 30): Promise<{
  total: number;
  byAction: Record<string, number>;
  byEntityType: Record<string, number>;
  recentUsers: Array<{ user_email: string; count: number }>;
}> {
  if (!supabase) {
    return { total: 0, byAction: {}, byEntityType: {}, recentUsers: [] };
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const { data, error } = await supabase
    .from("activity_logs")
    .select("action, entity_type, user_email")
    .gte("created_at", cutoffDate.toISOString());

  if (error) {
    console.error("Error fetching activity stats:", error);
    return { total: 0, byAction: {}, byEntityType: {}, recentUsers: [] };
  }

  const logs = data || [];

  // Calculate stats
  const byAction: Record<string, number> = {};
  const byEntityType: Record<string, number> = {};
  const userCounts: Record<string, number> = {};

  logs.forEach((log) => {
    byAction[log.action] = (byAction[log.action] || 0) + 1;
    byEntityType[log.entity_type] = (byEntityType[log.entity_type] || 0) + 1;
    if (log.user_email) {
      userCounts[log.user_email] = (userCounts[log.user_email] || 0) + 1;
    }
  });

  // Top 5 active users
  const recentUsers = Object.entries(userCounts)
    .map(([user_email, count]) => ({ user_email, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    total: logs.length,
    byAction,
    byEntityType,
    recentUsers,
  };
}

export const activityLogEndpoints = {
  getActivityLogs,
  logActivity,
  getActivityStats,
};
