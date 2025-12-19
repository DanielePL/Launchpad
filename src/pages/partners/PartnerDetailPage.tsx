import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Mail,
  Instagram,
  Send,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Wallet,
} from "lucide-react";
import {
  usePartners,
  usePartnerReferrals,
  useSendRevolutPayout,
  useCreateRevolutCounterparty,
} from "@/hooks/usePartners";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

const statusConfig = {
  pending: { icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/20" },
  confirmed: { icon: CheckCircle, color: "text-blue-500", bg: "bg-blue-500/20" },
  paid: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/20" },
};

export function PartnerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: partners, isLoading: partnersLoading } = usePartners();
  const { data: referrals, isLoading: referralsLoading } = usePartnerReferrals(id);
  const sendPayoutMutation = useSendRevolutPayout();
  const createCounterpartyMutation = useCreateRevolutCounterparty();

  const partner = useMemo(() => partners?.find((p) => p.id === id), [partners, id]);

  const isLoading = partnersLoading || referralsLoading;

  // Group referrals by status
  const referralStats = useMemo(() => {
    if (!referrals) return { pending: 0, confirmed: 0, paid: 0, pendingAmount: 0, confirmedAmount: 0 };
    return referrals.reduce(
      (acc, r) => {
        acc[r.commission_status]++;
        if (r.commission_status === "pending") acc.pendingAmount += r.commission_amount;
        if (r.commission_status === "confirmed") acc.confirmedAmount += r.commission_amount;
        return acc;
      },
      { pending: 0, confirmed: 0, paid: 0, pendingAmount: 0, confirmedAmount: 0 }
    );
  }, [referrals]);

  const handleSendPayout = async () => {
    if (!partner) return;
    if (confirm(`Send payout of ${formatCurrency(referralStats.confirmedAmount)} to ${partner.name}?`)) {
      try {
        const result = await sendPayoutMutation.mutateAsync(partner.id);
        alert(`Payout of ${formatCurrency(result.amount)} sent successfully! Transfer ID: ${result.transfer_id}`);
      } catch (error) {
        alert(`Failed to send payout: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }
  };

  const handleCreateCounterparty = async () => {
    if (!partner) return;
    try {
      const result = await createCounterpartyMutation.mutateAsync(partner.id);
      alert(`Revolut counterparty created for ${result.partner_name}!`);
    } catch (error) {
      alert(`Failed to create counterparty: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
        <h3 className="text-xl font-bold mb-2">Partner not found</h3>
        <Link to="/partners">
          <Button variant="link" className="text-primary">
            Back to Partners
          </Button>
        </Link>
      </div>
    );
  }

  const balance = partner.total_earned - partner.total_paid;
  const hasRevolutSetup = !!partner.counterparty_id || !!partner.payout_details?.revolut_email;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/partners">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold">{partner.name}</h1>
          <p className="text-muted-foreground">Partner Details</p>
        </div>
      </div>

      {/* Partner Info Card */}
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
              <Users className="w-8 h-8" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    partner.status === "active"
                      ? "bg-green-500/20 text-green-500"
                      : partner.status === "inactive"
                      ? "bg-yellow-500/20 text-yellow-500"
                      : "bg-destructive/20 text-destructive"
                  }`}
                >
                  {partner.status}
                </span>
                <span className="text-sm text-muted-foreground capitalize">{partner.partner_type}</span>
              </div>

              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <a href={`mailto:${partner.email}`} className="hover:text-primary transition-colors">
                    {partner.email}
                  </a>
                </p>

                {partner.instagram_handle && (
                  <p className="flex items-center gap-2">
                    <Instagram className="w-4 h-4 text-muted-foreground" />
                    <a
                      href={`https://instagram.com/${partner.instagram_handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors flex items-center gap-1"
                    >
                      @{partner.instagram_handle}
                      {partner.follower_count && (
                        <span className="text-muted-foreground">({formatNumber(partner.follower_count)} followers)</span>
                      )}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                )}

                <p className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  Joined {format(parseISO(partner.created_at), "MMM d, yyyy")}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <code className="px-3 py-1.5 bg-background/50 rounded-lg font-mono text-lg">
                  {partner.referral_code}
                </code>
                <span className="text-sm text-muted-foreground">{partner.commission_percent}% commission</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-background/50 text-center">
              <p className="text-sm text-muted-foreground mb-1">Referrals</p>
              <p className="text-2xl font-bold">{partner.total_referrals}</p>
            </div>
            <div className="p-4 rounded-xl bg-background/50 text-center">
              <p className="text-sm text-muted-foreground mb-1">Earned</p>
              <p className="text-2xl font-bold text-green-500">{formatCurrency(partner.total_earned)}</p>
            </div>
            <div className="p-4 rounded-xl bg-background/50 text-center">
              <p className="text-sm text-muted-foreground mb-1">Paid Out</p>
              <p className="text-2xl font-bold">{formatCurrency(partner.total_paid)}</p>
            </div>
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
              <p className="text-sm text-muted-foreground mb-1">Balance</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(balance)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payout Actions */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <Wallet className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Payout Management</h2>
            <p className="text-sm text-muted-foreground">Send payouts via Revolut</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-sm text-muted-foreground mb-1">Pending Confirmation</p>
            <p className="text-xl font-bold text-yellow-500">{formatCurrency(referralStats.pendingAmount)}</p>
            <p className="text-xs text-muted-foreground mt-1">{referralStats.pending} referrals</p>
          </div>
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <p className="text-sm text-muted-foreground mb-1">Ready to Pay</p>
            <p className="text-xl font-bold text-blue-500">{formatCurrency(referralStats.confirmedAmount)}</p>
            <p className="text-xs text-muted-foreground mt-1">{referralStats.confirmed} referrals</p>
          </div>
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <p className="text-sm text-muted-foreground mb-1">Already Paid</p>
            <p className="text-xl font-bold text-green-500">{formatCurrency(partner.total_paid)}</p>
            <p className="text-xs text-muted-foreground mt-1">{referralStats.paid} referrals</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {!hasRevolutSetup ? (
            <Button
              onClick={handleCreateCounterparty}
              disabled={createCounterpartyMutation.isPending}
              className="rounded-xl"
            >
              <Wallet className="w-4 h-4 mr-2" />
              {createCounterpartyMutation.isPending ? "Creating..." : "Setup Revolut"}
            </Button>
          ) : (
            <Button
              onClick={handleSendPayout}
              disabled={sendPayoutMutation.isPending || referralStats.confirmedAmount <= 0}
              className="rounded-xl glow-orange"
            >
              <Send className="w-4 h-4 mr-2" />
              {sendPayoutMutation.isPending
                ? "Sending..."
                : `Send ${formatCurrency(referralStats.confirmedAmount)}`}
            </Button>
          )}

          {partner.counterparty_id && (
            <span className="flex items-center gap-1 text-sm text-green-500">
              <CheckCircle className="w-4 h-4" />
              Revolut Connected
            </span>
          )}
        </div>
      </div>

      {/* Referrals Table */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <Users className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Referrals</h2>
            <p className="text-sm text-muted-foreground">{referrals?.length || 0} total referrals</p>
          </div>
        </div>

        {referrals && referrals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Revenue</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Commission</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((referral) => {
                  const config = statusConfig[referral.commission_status];
                  const StatusIcon = config.icon;
                  return (
                    <tr key={referral.id} className="border-b border-border/50 hover:bg-background/30 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-medium">{referral.user_email || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{referral.user_id.slice(0, 8)}...</p>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {format(parseISO(referral.referral_date), "MMM d, yyyy")}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {formatCurrency(referral.subscription_revenue)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-primary">
                        {formatCurrency(referral.commission_amount)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center">
                          <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {referral.commission_status}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No referrals yet</p>
          </div>
        )}
      </div>

      {/* Notes */}
      {partner.notes && (
        <div className="glass rounded-2xl p-6">
          <h3 className="font-bold mb-2">Notes</h3>
          <p className="text-muted-foreground">{partner.notes}</p>
        </div>
      )}
    </div>
  );
}
