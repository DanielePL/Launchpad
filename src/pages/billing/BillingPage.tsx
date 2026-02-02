import { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  useBillingInfo,
  usePlanLimits,
  useCreatePortal,
} from "@/hooks/useBilling";
import { formatCurrency } from "@/api/endpoints/billing";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Check,
  AlertTriangle,
  Sparkles,
  Users,
  UserPlus,
  ArrowRight,
  ExternalLink,
  Receipt,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function BillingPage() {
  const { organization, isOwner } = useAuth();
  const [searchParams] = useSearchParams();
  const {
    currentPlan,
    trialDaysRemaining,
    isTrialing,
    isActive,
    isPastDue,
    isCanceled,
  } = useBillingInfo();
  const { seats, creators } = usePlanLimits();
  const portalMutation = useCreatePortal();

  // Handle success/canceled from Stripe
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("Subscription activated successfully!");
    } else if (searchParams.get("canceled") === "true") {
      toast.info("Checkout canceled");
    }
  }, [searchParams]);

  const handleManageBilling = () => {
    if (organization) {
      portalMutation.mutate(organization.id);
    }
  };

  if (!organization) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard className="h-6 w-6" />
          Billing & Subscription
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription, usage, and payment methods
        </p>
      </div>

      {/* Trial Banner */}
      {isTrialing && (
        <div
          className={cn(
            "p-4 rounded-xl border",
            trialDaysRemaining <= 3
              ? "bg-yellow-500/10 border-yellow-500/30"
              : "bg-primary/10 border-primary/30"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles
                className={cn(
                  "h-5 w-5",
                  trialDaysRemaining <= 3 ? "text-yellow-500" : "text-primary"
                )}
              />
              <div>
                <p className="font-medium">
                  {trialDaysRemaining > 0
                    ? `${trialDaysRemaining} days left in your trial`
                    : "Your trial has ended"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {trialDaysRemaining > 0
                    ? "You have full access to all features"
                    : "Upgrade now to continue using LaunchPad"}
                </p>
              </div>
            </div>
            <Link to="/billing/plans">
              <Button size="sm" className="gap-2">
                Upgrade Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Past Due Warning */}
      {isPastDue && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Payment Failed</p>
              <p className="text-sm text-muted-foreground">
                Please update your payment method to avoid service interruption.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleManageBilling}
              disabled={portalMutation.isPending}
            >
              Update Payment
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Plan */}
        <div className="glass rounded-xl p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Current Plan
          </h2>

          <div className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-primary/30 mb-4">
            <div>
              <p className="font-semibold text-lg">{currentPlan?.name || "Starter"}</p>
              <p className="text-sm text-muted-foreground">
                {isTrialing && "Trial - "}
                {isActive && "Active subscription"}
                {isCanceled && "Canceled"}
                {isPastDue && "Payment overdue"}
              </p>
            </div>
            {currentPlan && currentPlan.monthlyPrice > 0 && (
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {formatCurrency(currentPlan.monthlyPrice)}
                </p>
                <p className="text-xs text-muted-foreground">/month</p>
              </div>
            )}
          </div>

          <div className="space-y-2 mb-4">
            {currentPlan?.features.slice(0, 4).map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                {feature}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Link to="/billing/plans" className="flex-1">
              <Button variant="outline" className="w-full">
                {isTrialing ? "Choose Plan" : "Change Plan"}
              </Button>
            </Link>
            {organization.stripe_customer_id && (
              <Button
                variant="ghost"
                onClick={handleManageBilling}
                disabled={portalMutation.isPending}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Usage */}
        <div className="glass rounded-xl p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Usage
          </h2>

          <div className="space-y-4">
            {/* Seats */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Team Seats</span>
                <span className="text-sm text-muted-foreground">
                  {seats.used} / {seats.isUnlimited ? "Unlimited" : seats.limit}
                </span>
              </div>
              {!seats.isUnlimited && (
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all",
                      seats.percentage >= 90
                        ? "bg-destructive"
                        : seats.percentage >= 70
                          ? "bg-yellow-500"
                          : "bg-primary"
                    )}
                    style={{ width: `${seats.percentage}%` }}
                  />
                </div>
              )}
              {seats.atLimit && (
                <p className="text-xs text-destructive mt-1">
                  Seat limit reached.{" "}
                  <Link to="/billing/plans" className="underline">
                    Upgrade
                  </Link>{" "}
                  to add more team members.
                </p>
              )}
            </div>

            {/* Creators */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Creators</span>
                <span className="text-sm text-muted-foreground">
                  {creators.used} /{" "}
                  {creators.isUnlimited ? "Unlimited" : creators.limit}
                </span>
              </div>
              {!creators.isUnlimited && (
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all",
                      creators.percentage >= 90
                        ? "bg-destructive"
                        : creators.percentage >= 70
                          ? "bg-yellow-500"
                          : "bg-primary"
                    )}
                    style={{ width: `${creators.percentage}%` }}
                  />
                </div>
              )}
              {creators.atLimit && (
                <p className="text-xs text-destructive mt-1">
                  Creator limit reached.{" "}
                  <Link to="/billing/plans" className="underline">
                    Upgrade
                  </Link>{" "}
                  to add more creators.
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10">
            <Link to="/settings/team">
              <Button variant="ghost" size="sm" className="gap-2 w-full">
                <UserPlus className="h-4 w-4" />
                Manage Team Members
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Payment Method & Invoices */}
      {isOwner && organization.stripe_customer_id && (
        <div className="glass rounded-xl p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Payment & Invoices
          </h2>

          <p className="text-sm text-muted-foreground mb-4">
            Manage your payment methods and download invoices through the Stripe
            Customer Portal.
          </p>

          <Button
            variant="outline"
            onClick={handleManageBilling}
            disabled={portalMutation.isPending}
            className="gap-2"
          >
            {portalMutation.isPending ? (
              "Opening..."
            ) : (
              <>
                Open Billing Portal
                <ExternalLink className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}

      {/* Help */}
      <div className="rounded-xl bg-muted/50 p-4">
        <div className="flex items-start gap-3">
          <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Need help?</p>
            <p className="mt-1">
              Contact our support team at{" "}
              <a
                href="mailto:billing@launchpad.app"
                className="text-primary hover:underline"
              >
                billing@launchpad.app
              </a>{" "}
              for billing questions or to discuss custom enterprise plans.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
