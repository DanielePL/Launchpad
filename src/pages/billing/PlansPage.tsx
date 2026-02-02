import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBillingInfo, useCreateCheckout } from "@/hooks/useBilling";
import { PRICING_PLANS, formatCurrency } from "@/api/endpoints/billing";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Check,
  Sparkles,
  Building2,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

type BillingInterval = "monthly" | "annual";

// Stripe Price IDs - these should match your Stripe Dashboard
// In production, these would come from environment variables
const STRIPE_PRICES = {
  starter: {
    monthly: "price_starter_monthly",
    annual: "price_starter_annual",
  },
  professional: {
    monthly: "price_professional_monthly",
    annual: "price_professional_annual",
  },
  enterprise: {
    monthly: null,
    annual: null,
  },
};

export function PlansPage() {
  const { organization } = useAuth();
  const { currentPlan, isTrialing } = useBillingInfo();
  const [interval, setInterval] = useState<BillingInterval>("monthly");
  const checkoutMutation = useCreateCheckout();

  const handleSelectPlan = (planId: string) => {
    if (!organization) return;

    const priceId =
      STRIPE_PRICES[planId as keyof typeof STRIPE_PRICES]?.[interval];

    if (!priceId) {
      // Enterprise - contact sales
      window.location.href = "mailto:sales@launchpad.app?subject=Enterprise%20Plan%20Inquiry";
      return;
    }

    checkoutMutation.mutate({
      organizationId: organization.id,
      priceId,
    });
  };

  const getButtonText = (planId: string): string => {
    if (planId === "enterprise") return "Contact Sales";
    if (currentPlan?.id === planId && !isTrialing) return "Current Plan";
    if (isTrialing) return "Start Subscription";

    const planOrder = { starter: 0, professional: 1, enterprise: 2 };
    const currentOrder = planOrder[currentPlan?.id as keyof typeof planOrder] ?? 0;
    const targetOrder = planOrder[planId as keyof typeof planOrder] ?? 0;

    return targetOrder > currentOrder ? "Upgrade" : "Downgrade";
  };

  const isCurrentPlan = (planId: string): boolean => {
    return currentPlan?.id === planId && !isTrialing;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/settings/billing">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Choose Your Plan</h1>
          <p className="text-muted-foreground">
            Select the plan that best fits your team's needs
          </p>
        </div>
      </div>

      {/* Billing Interval Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center rounded-full bg-muted p-1">
          <button
            onClick={() => setInterval("monthly")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all",
              interval === "monthly"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setInterval("annual")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
              interval === "annual"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Annual
            <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {PRICING_PLANS.map((plan) => {
          const price =
            interval === "monthly" ? plan.monthlyPrice : plan.annualPrice / 12;
          const isCurrent = isCurrentPlan(plan.id);
          const isRecommended = plan.recommended;

          return (
            <div
              key={plan.id}
              className={cn(
                "glass rounded-2xl p-6 relative flex flex-col",
                isRecommended && "ring-2 ring-primary",
                isCurrent && "ring-2 ring-green-500"
              )}
            >
              {/* Recommended Badge */}
              {isRecommended && !isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Recommended
                  </span>
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Current Plan
                  </span>
                </div>
              )}

              {/* Plan Icon */}
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                  plan.id === "starter" && "bg-blue-500/20 text-blue-500",
                  plan.id === "professional" && "bg-primary/20 text-primary",
                  plan.id === "enterprise" && "bg-purple-500/20 text-purple-500"
                )}
              >
                {plan.id === "starter" && <Zap className="h-6 w-6" />}
                {plan.id === "professional" && <Sparkles className="h-6 w-6" />}
                {plan.id === "enterprise" && <Building2 className="h-6 w-6" />}
              </div>

              {/* Plan Name & Description */}
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {plan.description}
              </p>

              {/* Price */}
              <div className="mt-4 mb-6">
                {plan.monthlyPrice > 0 ? (
                  <>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">
                        {formatCurrency(price)}
                      </span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    {interval === "annual" && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Billed annually ({formatCurrency(plan.annualPrice)}/year)
                      </p>
                    )}
                  </>
                ) : (
                  <div className="text-3xl font-bold">Custom</div>
                )}
              </div>

              {/* Limits */}
              <div className="mb-4 p-3 rounded-lg bg-background/50">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Team Seats</span>
                  <span className="font-medium">
                    {plan.limits.seats === "Unlimited"
                      ? "Unlimited"
                      : `Up to ${plan.limits.seats}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Creators</span>
                  <span className="font-medium">
                    {plan.limits.creators === "Unlimited"
                      ? "Unlimited"
                      : `Up to ${plan.limits.creators}`}
                  </span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm"
                  >
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={isCurrent || checkoutMutation.isPending}
                variant={isRecommended && !isCurrent ? "default" : "outline"}
                className="w-full"
              >
                {checkoutMutation.isPending
                  ? "Processing..."
                  : getButtonText(plan.id)}
              </Button>
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="glass rounded-xl p-6 mt-8">
        <h2 className="font-semibold mb-4">Frequently Asked Questions</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="font-medium text-sm">Can I change plans anytime?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Yes! You can upgrade or downgrade your plan at any time. Changes
              take effect immediately.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-sm">What payment methods do you accept?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              We accept all major credit cards and debit cards through our
              secure payment processor, Stripe.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-sm">Is there a free trial?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Yes! All new accounts start with a 14-day free trial with full
              access to all features.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-sm">What happens when I exceed my limits?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              You'll be notified when approaching limits. You can upgrade to add
              more seats or creators anytime.
            </p>
          </div>
        </div>
      </div>

      {/* Enterprise CTA */}
      <div className="text-center p-6 rounded-xl bg-gradient-to-r from-purple-500/10 to-primary/10">
        <h2 className="text-xl font-bold">Need a custom solution?</h2>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          Our Enterprise plan offers custom limits, dedicated support, and
          tailored features for large organizations.
        </p>
        <a href="mailto:sales@launchpad.app?subject=Enterprise%20Plan%20Inquiry">
          <Button className="mt-4" variant="outline">
            Contact Sales
          </Button>
        </a>
      </div>
    </div>
  );
}
