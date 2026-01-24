import {
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  ArrowUpRight,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { usePartnerProfile, usePartnerStats } from "@/hooks/usePartnerPortal";
import { CURRENCY } from "@/api/types/partnerPortal";
import { EarningsChart } from "@/components/creator-portal/EarningsChart";
import { RecentReferrals } from "@/components/creator-portal/RecentReferrals";

export default function CreatorDashboard() {
  const { data: profile } = usePartnerProfile();
  const { data: stats, isLoading } = usePartnerStats();
  const [copied, setCopied] = useState(false);

  const referralUrl = profile
    ? `https://prometheus.app/ref/${profile.referral_code}`
    : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statCards = [
    {
      label: "Total Earnings",
      value: `${CURRENCY} ${stats?.total_earned?.toFixed(0) || 0}`,
      icon: DollarSign,
      color: "bg-green-500",
      change: stats?.earnings_this_month
        ? `+${CURRENCY} ${stats.earnings_this_month.toFixed(0)} this month`
        : undefined,
    },
    {
      label: "Total Referrals",
      value: stats?.total_referrals || 0,
      icon: Users,
      color: "bg-blue-500",
      change: stats?.referrals_this_month
        ? `+${stats.referrals_this_month} this month`
        : undefined,
    },
    {
      label: "Pending Payout",
      value: `${CURRENCY} ${stats?.pending_payout?.toFixed(0) || 0}`,
      icon: Clock,
      color: "bg-yellow-500",
    },
    {
      label: "Conversion Rate",
      value: `${stats?.conversion_rate?.toFixed(1) || 0}%`,
      icon: TrendingUp,
      color: "bg-purple-500",
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-card animate-pulse rounded-lg" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-card animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {profile?.name?.split(" ")[0] || "Creator"}
        </h1>
        <p className="text-muted-foreground">
          Here's how your referrals are performing
        </p>
      </div>

      {/* Quick Referral Link */}
      <div className="rounded-xl bg-gradient-to-r from-primary/20 to-primary/5 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="font-semibold">Your Referral Link</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Share this link to earn {profile?.commission_percent || 20}% commission
            </p>
          </div>
          <div className="flex items-center gap-2">
            <code className="rounded-lg bg-background/50 px-4 py-2 text-sm font-mono">
              {referralUrl}
            </code>
            <Button onClick={handleCopyLink} variant="secondary" size="sm">
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="rounded-xl bg-card p-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}
              >
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
            </div>
            {stat.change && (
              <div className="mt-2 flex items-center gap-1 text-xs text-green-500">
                <ArrowUpRight className="h-3 w-3" />
                <span>{stat.change}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <EarningsChart />
        <RecentReferrals />
      </div>
    </div>
  );
}
