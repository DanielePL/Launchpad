// Beta Tester Types

export type BetaPlatform = "ios" | "android";
export type BetaTesterStatus = "pending" | "invited" | "active" | "inactive";
export type BetaFeedbackType = "bug" | "feedback" | "idea";
export type BetaFeedbackStatus = "open" | "in_progress" | "fixed" | "wont_fix";

export interface BetaTester {
  id: string;
  email: string;
  name: string;
  platform: BetaPlatform;
  status: BetaTesterStatus;
  user_id?: string;
  device_model?: string;
  os_version?: string;
  invited_at?: string;
  activated_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BetaTesterCreate {
  email: string;
  name: string;
  platform: BetaPlatform;
  device_model?: string;
  os_version?: string;
  notes?: string;
}

export interface BetaTesterUpdate {
  name?: string;
  status?: BetaTesterStatus;
  device_model?: string;
  os_version?: string;
  notes?: string;
}

export interface BetaFeedback {
  id: string;
  user_id?: string;
  username?: string;
  screen_name: string;
  feedback_type: BetaFeedbackType;
  message: string;
  created_at: string;
  app_version?: string;
  device_info?: string;
  status: BetaFeedbackStatus;
  internal_comment?: string;
  resolved_by?: string;
  resolved_at?: string;
  updated_at: string;
}

export interface BetaFeedbackUpdate {
  status?: BetaFeedbackStatus;
  internal_comment?: string;
  resolved_by?: string;
}

export interface BetaTesterStats {
  platform: BetaPlatform;
  total: number;
  pending: number;
  invited: number;
  active: number;
  inactive: number;
}

export interface BetaFeedbackStats {
  platform: BetaPlatform;
  total: number;
  open: number;
  in_progress: number;
  fixed: number;
  wont_fix: number;
  by_type: {
    bug: number;
    feedback: number;
    idea: number;
  };
}

export interface BetaOverview {
  testers: {
    ios: BetaTesterStats;
    android: BetaTesterStats;
  };
  feedback: {
    ios: BetaFeedbackStats;
    android: BetaFeedbackStats;
  };
}

export interface BetaTesterFilters {
  platform?: BetaPlatform;
  status?: BetaTesterStatus;
  search?: string;
  sort_by?: "name" | "email" | "created_at" | "status";
  sort_order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface BetaFeedbackFilters {
  platform?: BetaPlatform;
  feedback_type?: BetaFeedbackType;
  status?: BetaFeedbackStatus;
  screen_name?: string;
  search?: string;
  sort_by?: "created_at" | "status" | "feedback_type";
  sort_order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}
