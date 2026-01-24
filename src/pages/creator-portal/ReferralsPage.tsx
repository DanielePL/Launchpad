import { useState } from "react";
import { Link, Copy, Check, ExternalLink, Users, Clock, CheckCircle, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePartnerReferrals, usePartnerProfile } from "@/hooks/usePartnerPortal";
import { CURRENCY } from "@/api/types/partnerPortal";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "bg-yellow-500/10 text-yellow-500", icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-green-500/10 text-green-500", icon: CheckCircle },
  paid: { label: "Paid", color: "bg-blue-500/10 text-blue-500", icon: Wallet },
};

type FilterStatus = "all" | "pending" | "confirmed" | "paid";

export default function ReferralsPage() {
  const { data: profile } = usePartnerProfile();
  const { data: referrals, isLoading: referralsLoading } = usePartnerReferrals();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");

  const baseUrl = "https://prometheus.app/ref/";

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(`${baseUrl}${code}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredReferrals = referrals?.filter((r) =>
    statusFilter === "all" ? true : r.status === statusFilter
  );

  const statusCounts = {
    all: referrals?.length || 0,
    pending: referrals?.filter((r) => r.status === "pending").length || 0,
    confirmed: referrals?.filter((r) => r.status === "confirmed").length || 0,
    paid: referrals?.filter((r) => r.status === "paid").length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Referrals</h1>
        <p className="text-muted-foreground">
          Track your referral links and earnings
        </p>
      </div>

      {/* Referral Link Card */}
      <div className="rounded-xl bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Link className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Your Referral Link</h3>
        </div>

        {profile && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 w-full">
              <div className="flex items-center gap-2 rounded-lg bg-background/50 p-3">
                <code className="flex-1 text-sm font-mono truncate">
                  {baseUrl}{profile.referral_code}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(profile.referral_code, "main")}
                >
                  {copiedId === "main" ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a
                    href={`${baseUrl}${profile.referral_code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold text-primary">
                {profile.commission_percent}%
              </span>{" "}
              commission per referral
            </div>
          </div>
        )}
      </div>

      {/* Referrals List */}
      <div className="rounded-xl bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">All Referrals</h3>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(["all", "pending", "confirmed", "paid"] as FilterStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
                statusFilter === status
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
              <span className="ml-2 opacity-70">({statusCounts[status]})</span>
            </button>
          ))}
        </div>

        {referralsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredReferrals && filteredReferrals.length > 0 ? (
          <div className="space-y-3">
            {filteredReferrals.map((referral) => {
              const status = STATUS_CONFIG[referral.status];
              const StatusIcon = status.icon;

              return (
                <div
                  key={referral.id}
                  className="flex items-center justify-between rounded-lg bg-background/50 p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <Users className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {referral.user_email.replace(/(.{2}).*(@.*)/, "$1***$2")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {referral.subscription_type} •{" "}
                        {new Date(referral.referral_date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">
                        {CURRENCY} {referral.commission.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        from {CURRENCY} {referral.revenue.toFixed(2)}
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
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="font-medium">No referrals yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Share your referral link to start earning commissions
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
