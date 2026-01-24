import { usePartnerReferrals } from "@/hooks/usePartnerPortal";
import { CURRENCY } from "@/api/types/partnerPortal";
import { Users, Clock, CheckCircle, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "text-yellow-500", icon: Clock },
  confirmed: { label: "Confirmed", color: "text-green-500", icon: CheckCircle },
  paid: { label: "Paid", color: "text-blue-500", icon: Wallet },
};

export function RecentReferrals() {
  const { data: referrals, isLoading } = usePartnerReferrals();

  // Get last 5 referrals
  const recentReferrals = referrals?.slice(0, 5) || [];

  if (isLoading) {
    return (
      <div className="rounded-xl bg-card p-6">
        <div className="h-6 w-32 bg-muted animate-pulse rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-card p-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Recent Referrals</h3>
      </div>

      {recentReferrals.length > 0 ? (
        <div className="space-y-3">
          {recentReferrals.map((referral) => {
            const status = STATUS_CONFIG[referral.status];
            const StatusIcon = status.icon;

            return (
              <div
                key={referral.id}
                className="flex items-center justify-between rounded-lg bg-background/50 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {referral.user_email.replace(/(.{2}).*(@.*)/, "$1***$2")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(referral.referral_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    {CURRENCY} {referral.commission.toFixed(0)}
                  </p>
                  <div className={cn("flex items-center gap-1 text-xs", status.color)}>
                    <StatusIcon className="h-3 w-3" />
                    <span>{status.label}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Users className="h-12 w-12 text-muted-foreground/50 mb-2" />
          <p className="text-muted-foreground">No referrals yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Share your link to start earning
          </p>
        </div>
      )}
    </div>
  );
}
