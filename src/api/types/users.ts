export interface UserSubscription {
  subscription_id?: string;
  platform: "ios" | "android" | "web" | null;
  product_id?: string;
  status: "active" | "expired" | "cancelled" | "trial" | "none";
  plan_type: "monthly" | "yearly" | "lifetime" | null;
  started_at?: string;
  expires_at?: string;
  auto_renew: boolean;
}

export interface UserCostBreakdown {
  ai_coach_messages: number;
  ai_coach_cost: number;
  photo_analysis_count: number;
  photo_analysis_cost: number;
  vbt_analysis_count: number;
  vbt_analysis_cost: number;
  storage_uploads: number;
  storage_cost: number;
  total_cost: number;
}

export interface AppUser {
  user_id: string;
  email: string;
  display_name?: string;
  created_at: string;
  last_active?: string;
  subscription: UserSubscription;
  costs: UserCostBreakdown;
  is_profitable: boolean;
  lifetime_value: number;
}

export interface UserListResponse {
  users: AppUser[];
  total_count: number;
  total_cost: number;
  total_revenue: number;
  profitable_users: number;
  unprofitable_users: number;
}

export interface UserFilters {
  status?: "active" | "expired" | "cancelled" | "trial" | "none";
  platform?: "ios" | "android" | "web";
  plan_type?: "monthly" | "yearly" | "lifetime";
  sort_by?: "cost" | "created_at" | "last_active" | "email";
  sort_order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}
