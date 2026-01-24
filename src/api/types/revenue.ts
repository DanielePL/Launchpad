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
  // Pricing - Gross (before App Store fee)
  weekly_gross_price: number;
  monthly_gross_price: number;
  yearly_gross_price: number;
  // Pricing - Net (after App Store fee)
  weekly_net_price: number;
  monthly_net_price: number;
  yearly_net_price: number;
  commission_rate: number;
  // LTV (Lifetime Value)
  weekly_ltv: number;
  monthly_ltv: number;
  yearly_ltv: number;
  blended_ltv: number;
  // Churn & Retention
  weekly_churn_rate: number;
  monthly_churn_rate: number;
  yearly_renewal_rate: number;
  avg_weekly_lifetime: number;
  avg_monthly_lifetime: number;
  avg_yearly_renewals: number;
  // Subscription mix ratios
  weekly_to_monthly_ratio: number;
  monthly_to_yearly_ratio: number;
  // Costs
  monthly_fixed_cost: number;
  variable_cost_per_user: number;
  total_monthly_cost: number;
  // Break-even targets
  weekly_subs_needed: number;
  monthly_subs_needed: number;
  yearly_subs_needed: number;
  mixed_subs_needed: number;
}

// Subscription tier pricing configuration (matches Prometheus V1 app)
export interface SubscriptionTierPricing {
  tier: "premium" | "elite";
  weekly: number;
  monthly: number;
  yearly: number;
  titanLifetime?: number;
}

export const SUBSCRIPTION_PRICING: Record<string, SubscriptionTierPricing> = {
  premium: {
    tier: "premium",
    weekly: 1.99,
    monthly: 5.90,
    yearly: 59.00,
  },
  elite: {
    tier: "elite",
    weekly: 2.99,
    monthly: 9.90,
    yearly: 99.00,
    titanLifetime: 199.00,
  },
};
