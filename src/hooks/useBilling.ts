import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUsageStats,
  createCheckoutSession,
  createPortalSession,
  PRICING_PLANS,
  isAtLimit,
  getTrialDaysRemaining,
} from "@/api/endpoints/billing";

// =============================================================================
// Billing Hooks
// =============================================================================

/**
 * Hook to get current organization's usage statistics
 */
export function useUsageStats() {
  const { organization } = useAuth();

  return useQuery({
    queryKey: ["usage-stats", organization?.id],
    queryFn: () => getUsageStats(organization!.id),
    enabled: !!organization,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get billing information
 */
export function useBillingInfo() {
  const { organization } = useAuth();

  const trialDaysRemaining = organization?.trial_ends_at
    ? getTrialDaysRemaining(organization.trial_ends_at)
    : 0;

  const isTrialing = organization?.subscription_status === "trialing";
  const isActive = organization?.subscription_status === "active";
  const isPastDue = organization?.subscription_status === "past_due";
  const isCanceled = organization?.subscription_status === "canceled";

  const currentPlan = PRICING_PLANS.find(
    (p) => p.id === organization?.subscription_plan
  );

  return {
    organization,
    currentPlan,
    trialDaysRemaining,
    isTrialing,
    isActive,
    isPastDue,
    isCanceled,
    needsUpgrade: isTrialing && trialDaysRemaining <= 3,
  };
}

/**
 * Hook to check plan limits
 */
export function usePlanLimits() {
  const { organization } = useAuth();
  const { data: usage } = useUsageStats();

  const seatsLimit = organization?.max_seats ?? 3;
  const creatorsLimit = organization?.max_creators ?? 50;

  const seatsUsed = usage?.seats_used ?? 0;
  const creatorsUsed = usage?.creators_used ?? 0;

  const seatsStatus = isAtLimit(seatsUsed, seatsLimit);
  const creatorsStatus = isAtLimit(creatorsUsed, creatorsLimit);

  return {
    seats: {
      used: seatsUsed,
      limit: seatsLimit,
      isUnlimited: seatsLimit === -1,
      ...seatsStatus,
    },
    creators: {
      used: creatorsUsed,
      limit: creatorsLimit,
      isUnlimited: creatorsLimit === -1,
      ...creatorsStatus,
    },
    canAddSeat: !seatsStatus.atLimit,
    canAddCreator: !creatorsStatus.atLimit,
  };
}

/**
 * Hook for creating checkout session
 */
export function useCreateCheckout() {
  return useMutation({
    mutationFn: async ({
      organizationId,
      priceId,
    }: {
      organizationId: string;
      priceId: string;
    }) => {
      const successUrl = `${window.location.origin}/settings/billing?success=true`;
      const cancelUrl = `${window.location.origin}/settings/billing?canceled=true`;

      const result = await createCheckoutSession(
        organizationId,
        priceId,
        successUrl,
        cancelUrl
      );

      if (result.error) {
        throw result.error;
      }

      return result.url;
    },
    onSuccess: (url) => {
      if (url) {
        window.location.href = url;
      }
    },
  });
}

/**
 * Hook for creating portal session
 */
export function useCreatePortal() {
  return useMutation({
    mutationFn: async (organizationId: string) => {
      const returnUrl = `${window.location.origin}/settings/billing`;

      const result = await createPortalSession(organizationId, returnUrl);

      if (result.error) {
        throw result.error;
      }

      return result.url;
    },
    onSuccess: (url) => {
      if (url) {
        window.location.href = url;
      }
    },
  });
}

/**
 * Hook to check if a feature is available on current plan
 */
export function useFeatureAccess() {
  const { organization } = useAuth();
  const plan = organization?.subscription_plan ?? "starter";

  const hasFeature = (feature: string): boolean => {
    const featuresByPlan: Record<string, string[]> = {
      starter: ["core_crm", "tasks", "basic_analytics"],
      professional: [
        "core_crm",
        "tasks",
        "basic_analytics",
        "deals",
        "contracts",
        "advanced_analytics",
        "api_access",
      ],
      enterprise: [
        "core_crm",
        "tasks",
        "basic_analytics",
        "deals",
        "contracts",
        "advanced_analytics",
        "api_access",
        "sso",
        "custom_integrations",
      ],
    };

    return featuresByPlan[plan]?.includes(feature) ?? false;
  };

  const requiresPlan = (requiredPlan: "starter" | "professional" | "enterprise"): boolean => {
    const planOrder = { starter: 0, professional: 1, enterprise: 2 };
    return planOrder[plan] >= planOrder[requiredPlan];
  };

  return {
    plan,
    hasFeature,
    requiresPlan,
    isStarter: plan === "starter",
    isProfessional: plan === "professional",
    isEnterprise: plan === "enterprise",
  };
}
