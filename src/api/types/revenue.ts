export interface Revenue {
  id: string;
  date: string;
  platform: "ios" | "android" | "web";
  revenue_type: "subscription" | "one_time" | "ad";
  gross_revenue: number;
  app_store_commission: number;
  net_revenue: number;
  period_start?: string;
  period_end?: string;
  notes?: string;
  created_at: string;
}

export interface CreateRevenueInput {
  platform: "ios" | "android" | "web";
  revenue_type: "subscription" | "one_time" | "ad";
  gross_revenue: number;
  period_start: string;
  period_end?: string;
  notes?: string;
}

export interface RevenueSummary {
  gross_revenue: number;
  app_store_fee: number;
  net_revenue: number;
  transaction_count: number;
}

export interface BreakEvenAnalysis {
  monthly_gross_price: number;
  yearly_gross_price: number;
  monthly_net_price: number;
  yearly_net_price: number;
  commission_rate: number;
  monthly_ltv: number;
  yearly_ltv: number;
  blended_ltv: number;
  monthly_churn_rate: number;
  yearly_renewal_rate: number;
  avg_monthly_lifetime: number;
  avg_yearly_renewals: number;
  monthly_to_yearly_ratio: number;
  monthly_fixed_cost: number;
  variable_cost_per_user: number;
  total_monthly_cost: number;
  monthly_subs_needed: number;
  yearly_subs_needed: number;
  mixed_subs_needed: number;
}
