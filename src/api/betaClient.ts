import { supabase } from "./supabaseClient";
import type {
  BetaTester,
  BetaTesterCreate,
  BetaTesterUpdate,
  BetaTesterFilters,
  BetaTesterStats,
  BetaFeedback,
  BetaFeedbackUpdate,
  BetaFeedbackFilters,
  BetaFeedbackStats,
  BetaPlatform,
  BetaOverview,
} from "./types";

// =====================================================
// Beta Testers API
// =====================================================

export async function getBetaTesters(filters?: BetaTesterFilters): Promise<BetaTester[]> {
  let query = supabase
    .from("beta_testers")
    .select("*");

  if (filters?.platform) {
    query = query.eq("platform", filters.platform);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
  }

  const sortBy = filters?.sort_by || "created_at";
  const sortOrder = filters?.sort_order === "asc";
  query = query.order(sortBy, { ascending: sortOrder });

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getBetaTesterById(id: string): Promise<BetaTester | null> {
  const { data, error } = await supabase
    .from("beta_testers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createBetaTester(tester: BetaTesterCreate): Promise<BetaTester> {
  const { data, error } = await supabase
    .from("beta_testers")
    .insert(tester)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createBetaTesters(testers: BetaTesterCreate[]): Promise<BetaTester[]> {
  const { data, error } = await supabase
    .from("beta_testers")
    .insert(testers)
    .select();

  if (error) throw error;
  return data || [];
}

export async function updateBetaTester(id: string, update: BetaTesterUpdate): Promise<BetaTester> {
  const { data, error } = await supabase
    .from("beta_testers")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteBetaTester(id: string): Promise<void> {
  const { error } = await supabase
    .from("beta_testers")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function inviteBetaTester(id: string): Promise<BetaTester> {
  return updateBetaTester(id, {
    status: "invited",
  });
}

export async function activateBetaTester(id: string): Promise<BetaTester> {
  const { data, error } = await supabase
    .from("beta_testers")
    .update({
      status: "active",
      activated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getBetaTesterStats(): Promise<BetaTesterStats[]> {
  const { data, error } = await supabase.rpc("get_beta_tester_stats");

  if (error) {
    // Fallback: Manuell berechnen wenn RPC nicht existiert
    const testers = await getBetaTesters();
    const stats: Record<BetaPlatform, BetaTesterStats> = {
      ios: { platform: "ios", total: 0, pending: 0, invited: 0, active: 0, inactive: 0 },
      android: { platform: "android", total: 0, pending: 0, invited: 0, active: 0, inactive: 0 },
    };

    for (const t of testers) {
      const s = stats[t.platform];
      s.total++;
      s[t.status]++;
    }

    return Object.values(stats);
  }

  return data || [];
}

// =====================================================
// Beta Feedback API (Android)
// =====================================================

export async function getBetaFeedback(filters?: BetaFeedbackFilters): Promise<BetaFeedback[]> {
  let query = supabase
    .from("beta_feedback")
    .select("*");

  if (filters?.feedback_type) {
    query = query.eq("feedback_type", filters.feedback_type);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.screen_name) {
    query = query.eq("screen_name", filters.screen_name);
  }
  if (filters?.search) {
    query = query.or(`message.ilike.%${filters.search}%,username.ilike.%${filters.search}%`);
  }

  const sortBy = filters?.sort_by || "created_at";
  const sortOrder = filters?.sort_order === "asc";
  query = query.order(sortBy, { ascending: sortOrder });

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function updateBetaFeedback(id: string, update: BetaFeedbackUpdate): Promise<BetaFeedback> {
  const updateData: Record<string, unknown> = { ...update };

  if (update.status === "fixed" || update.status === "wont_fix") {
    updateData.resolved_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("beta_feedback")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// =====================================================
// iOS Beta Feedback API
// =====================================================

export async function getIosBetaFeedback(filters?: BetaFeedbackFilters): Promise<BetaFeedback[]> {
  let query = supabase
    .from("ios_beta_feedback")
    .select("*");

  if (filters?.feedback_type) {
    query = query.eq("feedback_type", filters.feedback_type);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.screen_name) {
    query = query.eq("screen_name", filters.screen_name);
  }
  if (filters?.search) {
    query = query.or(`message.ilike.%${filters.search}%,username.ilike.%${filters.search}%`);
  }

  const sortBy = filters?.sort_by || "created_at";
  const sortOrder = filters?.sort_order === "asc";
  query = query.order(sortBy, { ascending: sortOrder });

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function updateIosBetaFeedback(id: string, update: BetaFeedbackUpdate): Promise<BetaFeedback> {
  const updateData: Record<string, unknown> = { ...update };

  if (update.status === "fixed" || update.status === "wont_fix") {
    updateData.resolved_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("ios_beta_feedback")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// =====================================================
// Combined Feedback API
// =====================================================

export async function getAllFeedback(filters?: BetaFeedbackFilters): Promise<{ android: BetaFeedback[]; ios: BetaFeedback[] }> {
  const [android, ios] = await Promise.all([
    filters?.platform === "ios" ? Promise.resolve([]) : getBetaFeedback(filters),
    filters?.platform === "android" ? Promise.resolve([]) : getIosBetaFeedback(filters),
  ]);

  return { android, ios };
}

export async function getFeedbackStats(): Promise<{ android: BetaFeedbackStats; ios: BetaFeedbackStats }> {
  const [androidFeedback, iosFeedback] = await Promise.all([
    getBetaFeedback(),
    getIosBetaFeedback(),
  ]);

  const calculateStats = (feedback: BetaFeedback[], platform: BetaPlatform): BetaFeedbackStats => {
    const stats: BetaFeedbackStats = {
      platform,
      total: feedback.length,
      open: 0,
      in_progress: 0,
      fixed: 0,
      wont_fix: 0,
      by_type: { bug: 0, feedback: 0, idea: 0 },
    };

    for (const f of feedback) {
      if (f.status === "open") stats.open++;
      else if (f.status === "in_progress") stats.in_progress++;
      else if (f.status === "fixed") stats.fixed++;
      else if (f.status === "wont_fix") stats.wont_fix++;

      if (f.feedback_type === "bug") stats.by_type.bug++;
      else if (f.feedback_type === "feedback") stats.by_type.feedback++;
      else if (f.feedback_type === "idea") stats.by_type.idea++;
    }

    return stats;
  };

  return {
    android: calculateStats(androidFeedback, "android"),
    ios: calculateStats(iosFeedback, "ios"),
  };
}

// =====================================================
// Beta Overview
// =====================================================

export async function getBetaOverview(): Promise<BetaOverview> {
  const [testerStats, feedbackStats] = await Promise.all([
    getBetaTesterStats(),
    getFeedbackStats(),
  ]);

  const iosTesters = testerStats.find(s => s.platform === "ios") || {
    platform: "ios" as const,
    total: 0,
    pending: 0,
    invited: 0,
    active: 0,
    inactive: 0,
  };

  const androidTesters = testerStats.find(s => s.platform === "android") || {
    platform: "android" as const,
    total: 0,
    pending: 0,
    invited: 0,
    active: 0,
    inactive: 0,
  };

  return {
    testers: {
      ios: iosTesters,
      android: androidTesters,
    },
    feedback: feedbackStats,
  };
}
