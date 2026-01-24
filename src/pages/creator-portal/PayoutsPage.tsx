import { useState } from "react";
import {
  Wallet,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  Building,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  usePayoutHistory,
  usePayoutEligibility,
  useRequestPayout,
  usePartnerProfile,
  useUpdatePayoutDetails,
} from "@/hooks/usePartnerPortal";
import { CURRENCY, MINIMUM_PAYOUT } from "@/api/types/partnerPortal";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "bg-yellow-500/10 text-yellow-500", icon: Clock },
  processing: { label: "Processing", color: "bg-blue-500/10 text-blue-500", icon: Clock },
  completed: { label: "Completed", color: "bg-green-500/10 text-green-500", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-red-500/10 text-red-500", icon: XCircle },
};

export default function PayoutsPage() {
  const { data: profile } = usePartnerProfile();
  const { data: eligibility, isLoading: eligibilityLoading } = usePayoutEligibility();
  const { data: payouts, isLoading: payoutsLoading } = usePayoutHistory();
  const requestPayout = useRequestPayout();
  const updatePayoutDetails = useUpdatePayoutDetails();

  const [showPayoutSetup, setShowPayoutSetup] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState<"revolut" | "bank_transfer">(
    profile?.payout_method || "revolut"
  );
  const [revolutEmail, setRevolutEmail] = useState(profile?.payout_details?.revolut_email || "");
  const [iban, setIban] = useState(profile?.payout_details?.iban || "");
  const [bic, setBic] = useState(profile?.payout_details?.bic || "");

  const handleSavePayoutDetails = () => {
    updatePayoutDetails.mutate(
      {
        payout_method: payoutMethod,
        revolut_email: payoutMethod === "revolut" ? revolutEmail : undefined,
        iban: payoutMethod === "bank_transfer" ? iban : undefined,
        bic: payoutMethod === "bank_transfer" ? bic : undefined,
      },
      {
        onSuccess: () => setShowPayoutSetup(false),
      }
    );
  };

  const handleRequestPayout = () => {
    if (!eligibility?.eligible || !eligibility.available_amount) return;

    requestPayout.mutate({
      amount: eligibility.available_amount,
      payout_method: profile?.payout_method || "revolut",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Payouts</h1>
        <p className="text-muted-foreground">
          Request payouts and manage your payment settings
        </p>
      </div>

      {/* Payout Request Card */}
      <div className="rounded-xl bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Request Payout</h3>
        </div>

        {eligibilityLoading ? (
          <div className="h-32 bg-muted animate-pulse rounded-lg" />
        ) : (
          <div className="space-y-4">
            {/* Available Amount */}
            <div className="rounded-lg bg-background/50 p-4">
              <p className="text-sm text-muted-foreground">Available for Payout</p>
              <p className="text-3xl font-bold mt-1">
                {CURRENCY} {eligibility?.available_amount?.toFixed(2) || "0.00"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Minimum payout: {CURRENCY} {MINIMUM_PAYOUT}
              </p>
            </div>

            {/* Eligibility Status */}
            {!eligibility?.eligible && (
              <div className="flex items-start gap-3 rounded-lg bg-yellow-500/10 p-4 text-yellow-500">
                <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                <div className="text-sm">
                  {eligibility?.missing_payout_info ? (
                    <>
                      <p className="font-medium">Payment details required</p>
                      <p className="text-yellow-500/80">
                        Please set up your payout method to request withdrawals.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium">Minimum not reached</p>
                      <p className="text-yellow-500/80">
                        You need at least {CURRENCY} {MINIMUM_PAYOUT} to request a payout.
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleRequestPayout}
                disabled={
                  !eligibility?.eligible ||
                  requestPayout.isPending ||
                  eligibility?.missing_payout_info
                }
                className="flex-1"
              >
                {requestPayout.isPending ? "Requesting..." : "Request Payout"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowPayoutSetup(!showPayoutSetup)}
              >
                {showPayoutSetup ? "Cancel" : "Payment Settings"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Payout Setup */}
      {showPayoutSetup && (
        <div className="rounded-xl bg-card p-6">
          <h3 className="font-semibold mb-4">Payment Method</h3>

          {/* Method Selection */}
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <button
              onClick={() => setPayoutMethod("revolut")}
              className={cn(
                "flex items-center gap-3 rounded-xl border-2 p-4 transition-colors",
                payoutMethod === "revolut"
                  ? "border-primary bg-primary/5"
                  : "border-muted hover:border-primary/50"
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  payoutMethod === "revolut" ? "bg-primary" : "bg-muted"
                )}
              >
                <CreditCard
                  className={cn(
                    "h-5 w-5",
                    payoutMethod === "revolut" ? "text-white" : "text-muted-foreground"
                  )}
                />
              </div>
              <div className="text-left">
                <p className="font-medium">Revolut</p>
                <p className="text-xs text-muted-foreground">Instant transfer</p>
              </div>
            </button>

            <button
              onClick={() => setPayoutMethod("bank_transfer")}
              className={cn(
                "flex items-center gap-3 rounded-xl border-2 p-4 transition-colors",
                payoutMethod === "bank_transfer"
                  ? "border-primary bg-primary/5"
                  : "border-muted hover:border-primary/50"
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  payoutMethod === "bank_transfer" ? "bg-primary" : "bg-muted"
                )}
              >
                <Building
                  className={cn(
                    "h-5 w-5",
                    payoutMethod === "bank_transfer" ? "text-white" : "text-muted-foreground"
                  )}
                />
              </div>
              <div className="text-left">
                <p className="font-medium">Bank Transfer</p>
                <p className="text-xs text-muted-foreground">1-3 business days</p>
              </div>
            </button>
          </div>

          {/* Method Details */}
          {payoutMethod === "revolut" ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Revolut Email / Tag</label>
                <Input
                  placeholder="@yourtag or email@example.com"
                  value={revolutEmail}
                  onChange={(e) => setRevolutEmail(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">IBAN</label>
                <Input
                  placeholder="CH93 0076 2011 6238 5295 7"
                  value={iban}
                  onChange={(e) => setIban(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">BIC/SWIFT</label>
                <Input
                  placeholder="UBSWCHZH80A"
                  value={bic}
                  onChange={(e) => setBic(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <Button
            onClick={handleSavePayoutDetails}
            disabled={updatePayoutDetails.isPending}
            className="mt-6"
          >
            {updatePayoutDetails.isPending ? "Saving..." : "Save Payment Details"}
          </Button>
        </div>
      )}

      {/* Payout History */}
      <div className="rounded-xl bg-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Payout History</h3>
        </div>

        {payoutsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : payouts && payouts.length > 0 ? (
          <div className="space-y-3">
            {payouts.map((payout) => {
              const status = STATUS_CONFIG[payout.status];
              const StatusIcon = status.icon;

              return (
                <div
                  key={payout.id}
                  className="flex items-center justify-between rounded-lg bg-background/50 p-4"
                >
                  <div>
                    <p className="font-semibold">
                      {CURRENCY} {payout.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {payout.referral_count} referrals •{" "}
                      {new Date(payout.requested_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                      status.color
                    )}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {status.label}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Wallet className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="font-medium">No payouts yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your payout history will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
