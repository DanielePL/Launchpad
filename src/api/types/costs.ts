export interface CostSummary {
  total_cost: number;
  unique_users: number;
  total_events: number;
  avg_cost_per_user: number;
}

export interface DailyCost {
  date: string;
  openai_vision_calls: number;
  vbt_analysis_calls: number;
  ai_coach_messages: number;
  storage_uploads: number;
  total_estimated_cost: number;
}

export interface UserCost {
  user_id: string;
  first_activity: string;
  active_days: number;
  total_events: number;
  total_estimated_cost: number;
}

export interface EventCost {
  event_type: string;
  count: number;
  avg_tokens: number;
  total_cost: number;
}

export interface ServiceCosts {
  ai_coach: { cost: number; count: number };
  photo_analysis: { cost: number; count: number };
  vbt: { cost: number; count: number };
  storage: { cost: number; count: number };
}

export interface ComprehensiveSummary {
  total_variable_cost: number;
  monthly_fixed_cost: number;
  total_monthly_cost: number;
  active_users: number;
  total_events: number;
  cost_per_active_user: number;
  total_gross_revenue: number;
  app_store_commission: number;
  total_net_revenue: number;
  monthly_profit: number;
  revenue_per_active_user: number;
}

export interface FixedCost {
  id: string;
  name: string;
  category: string;
  amount: number;
  recurrence_type: "monthly" | "yearly" | "one_time";
  description?: string;
  is_active: boolean;
  monthly_equivalent: number;
  created_at: string;
}

export interface CreateFixedCostInput {
  name: string;
  category: string;
  amount: number;
  recurrence_type: "monthly" | "yearly" | "one_time";
  description?: string;
}
