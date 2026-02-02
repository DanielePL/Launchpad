import { supabase } from "@/api/supabaseClient";
import type { SubscriptionPlan, SubscriptionStatus } from "@/api/types/permissions";

// =============================================================================
// Billing Types
// =============================================================================

export interface PricingPlan {
  id: SubscriptionPlan;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  limits: {
    seats: number | "Unlimited";
    creators: number | "Unlimited";
  };
  recommended?: boolean;
}

export interface BillingInfo {
  organization_id: string;
  subscription_status: SubscriptionStatus;
  subscription_plan: SubscriptionPlan;
  trial_ends_at: string | null;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
}

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  invoice_pdf?: string;
}

export interface UsageStats {
  seats_used: number;
  seats_limit: number;
  creators_used: number;
  creators_limit: number;
}

// =============================================================================
// Pricing Plans Configuration
// =============================================================================

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for small teams getting started",
    monthlyPrice: 49,
    annualPrice: 470, // ~20% discount
    features: [
      "Core CRM functionality",
      "Task management",
      "Basic analytics",
      "Email support",
    ],
    limits: {
      seats: 3,
      creators: 50,
    },
  },
  {
    id: "professional",
    name: "Professional",
    description: "For growing teams that need more power",
    monthlyPrice: 149,
    annualPrice: 1428, // ~20% discount
    features: [
      "Everything in Starter",
      "Enterprise deals & contracts",
      "Advanced analytics",
      "API access",
      "Priority support",
      "Custom integrations",
    ],
    limits: {
      seats: 10,
      creators: 200,
    },
    recommended: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large organizations with custom needs",
    monthlyPrice: 0, // Custom pricing
    annualPrice: 0,
    features: [
      "Everything in Professional",
      "Unlimited seats",
      "Unlimited creators",
      "SSO/SAML",
      "Dedicated support",
      "Custom contracts",
      "SLA guarantee",
    ],
    limits: {
      seats: "Unlimited",
      creators: "Unlimited",
    },
  },
];

// =============================================================================
// Billing API Endpoints
// =============================================================================

/**
 * Create a Stripe Checkout Session for subscription
 */
export async function createCheckoutSession(
  organizationId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<{ url: string | null; error: Error | null }> {
  if (!supabase) {
    return { url: null, error: new Error("Supabase not configured") };
  }

  try {
    const response = await supabase.functions.invoke("create-checkout", {
      body: {
        organization_id: organizationId,
        price_id: priceId,
        success_url: successUrl,
        cancel_url: cancelUrl,
      },
    });

    if (response.error) {
      throw new Error(response.error.message || "Failed to create checkout session");
    }

    return { url: response.data?.url || null, error: null };
  } catch (err) {
    return {
      url: null,
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
}

/**
 * Create a Stripe Customer Portal session for managing subscription
 */
export async function createPortalSession(
  organizationId: string,
  returnUrl: string
): Promise<{ url: string | null; error: Error | null }> {
  if (!supabase) {
    return { url: null, error: new Error("Supabase not configured") };
  }

  try {
    const response = await supabase.functions.invoke("create-portal", {
      body: {
        organization_id: organizationId,
        return_url: returnUrl,
      },
    });

    if (response.error) {
      throw new Error(response.error.message || "Failed to create portal session");
    }

    return { url: response.data?.url || null, error: null };
  } catch (err) {
    return {
      url: null,
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
}

/**
 * Get usage statistics for the organization
 */
export async function getUsageStats(
  organizationId: string
): Promise<UsageStats | null> {
  if (!supabase) return null;

  try {
    // Get organization limits
    const { data: org } = await supabase
      .from("organizations")
      .select("max_seats, max_creators")
      .eq("id", organizationId)
      .single();

    if (!org) return null;

    // Count members
    const { count: membersCount } = await supabase
      .from("organization_members")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId);

    // Count creators (partners/influencers)
    // This assumes you have a creators table with organization_id
    // Adjust based on your actual data model
    const { count: creatorsCount } = await supabase
      .from("creator_contracts")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId);

    return {
      seats_used: membersCount || 0,
      seats_limit: org.max_seats,
      creators_used: creatorsCount || 0,
      creators_limit: org.max_creators,
    };
  } catch (err) {
    console.error("Error fetching usage stats:", err);
    return null;
  }
}

/**
 * Check if organization has reached a limit
 */
export function isAtLimit(
  used: number,
  limit: number
): { atLimit: boolean; percentage: number } {
  if (limit === -1) {
    // Unlimited
    return { atLimit: false, percentage: 0 };
  }

  const percentage = Math.round((used / limit) * 100);
  return {
    atLimit: used >= limit,
    percentage: Math.min(percentage, 100),
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(
  amount: number,
  currency: string = "EUR"
): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Get days remaining in trial
 */
export function getTrialDaysRemaining(trialEndsAt: string | null): number {
  if (!trialEndsAt) return 0;

  const endDate = new Date(trialEndsAt);
  const now = new Date();
  const diffMs = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}
