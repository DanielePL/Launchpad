import { Link } from "react-router-dom";
import {
  Wallet,
  Send,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Users,
  ExternalLink,
} from "lucide-react";
import {
  usePendingPayouts,
  useSendRevolutPayout,
  useSendBatchPayouts,
  useConfirmPendingCommissions,
} from "@/hooks/usePartners";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function PayoutsPage() {
  const { data: pendingData, isLoading } = usePendingPayouts();
  const sendPayoutMutation = useSendRevolutPayout();
  const sendBatchMutation = useSendBatchPayouts();
  const confirmMutation = useConfirmPendingCommissions();

  const eligiblePayouts = pendingData?.pending_payouts.filter((p) => p.eligible) || [];
  const ineligiblePayouts = pendingData?.pending_payouts.filter((p) => !p.eligible) || [];
  const totalEligible = eligiblePayouts.reduce((sum, p) => sum + p.total_amount, 0);

  const handleSendPayout = async (partnerId: string, name: string, amount: number) => {
    if (confirm(`Send payout of ${formatCurrency(amount)} to ${name}?`)) {
      try {
        const result = await sendPayoutMutation.mutateAsync(partnerId);
        alert(`Payout of ${formatCurrency(result.amount)} sent to ${result.partner_name}!\nTransfer ID: ${result.transfer_id}`);
      } catch (error) {
        alert(`Failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }
  };

  const handleBatchPayout = async () => {
    if (confirm(`Send batch payouts totaling ${formatCurrency(totalEligible)} to ${eligiblePayouts.length} partners?`)) {
      try {
        const result = await sendBatchMutation.mutateAsync();
        alert(`Batch payout complete!\n\nSent: ${result.successful}\nFailed: ${result.failed}\nTotal: ${formatCurrency(result.total_amount)}`);
      } catch (error) {
        alert(`Failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }
  };

  const handleConfirmCommissions = async () => {
    if (confirm("Confirm all pending commissions? This will make them ready for payout.")) {
      try {
        const result = await confirmMutation.mutateAsync();
        alert(`${result.confirmed} commissions confirmed!`);
      } catch (error) {
        alert(`Failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold mb-2">Payouts</h1>
        <p className="text-muted-foreground text-lg">Manage partner payouts via Revolut</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/20 text-primary">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Pending</p>
              {isLoading ? (
                <Skeleton className="h-7 w-24 mt-1" />
              ) : (
                <p className="text-xl font-bold">{formatCurrency(pendingData?.total_pending || 0)}</p>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-500/20 text-green-500">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Eligible</p>
              {isLoading ? (
                <Skeleton className="h-7 w-20 mt-1" />
              ) : (
                <p className="text-xl font-bold">{formatCurrency(totalEligible)}</p>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/20 text-blue-500">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Partners Ready</p>
              {isLoading ? (
                <Skeleton className="h-7 w-12 mt-1" />
              ) : (
                <p className="text-xl font-bold">{eligiblePayouts.length}</p>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-yellow-500/20 text-yellow-500">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Min Payout</p>
              {isLoading ? (
                <Skeleton className="h-7 w-16 mt-1" />
              ) : (
                <p className="text-xl font-bold">{formatCurrency(pendingData?.min_payout || 0)}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={handleConfirmCommissions}
            disabled={confirmMutation.isPending}
            variant="outline"
            className="rounded-xl"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {confirmMutation.isPending ? "Confirming..." : "Confirm Pending Commissions"}
          </Button>

          <Button
            onClick={handleBatchPayout}
            disabled={sendBatchMutation.isPending || eligiblePayouts.length === 0}
            className="rounded-xl glow-orange"
          >
            <Send className="w-4 h-4 mr-2" />
            {sendBatchMutation.isPending
              ? "Sending..."
              : `Send All Payouts (${formatCurrency(totalEligible)})`}
          </Button>
        </div>
      </div>

      {/* Eligible Payouts */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Ready for Payout</h2>
            <p className="text-sm text-muted-foreground">{eligiblePayouts.length} partners eligible</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </div>
        ) : eligiblePayouts.length > 0 ? (
          <div className="space-y-3">
            {eligiblePayouts.map((payout) => (
              <div
                key={payout.partner_id}
                className="flex items-center justify-between p-4 rounded-xl bg-background/50 hover:bg-background/70 transition-smooth group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500/20 text-green-500 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{payout.partner_name}</p>
                      <Link to={`/partners/${payout.partner_id}`}>
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
                      </Link>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <code className="px-1.5 py-0.5 bg-background rounded text-xs">{payout.referral_code}</code>
                      <span>{payout.referral_count} referrals</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <p className="text-xl font-bold text-green-500">{formatCurrency(payout.total_amount)}</p>
                  <Button
                    onClick={() => handleSendPayout(payout.partner_id, payout.partner_name, payout.total_amount)}
                    disabled={sendPayoutMutation.isPending}
                    size="sm"
                    className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Send className="w-4 h-4 mr-1" />
                    Send
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No payouts ready</p>
            <p className="text-sm">Partners need confirmed commissions above the minimum threshold</p>
          </div>
        )}
      </div>

      {/* Ineligible Payouts */}
      {ineligiblePayouts.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Not Eligible</h2>
              <p className="text-sm text-muted-foreground">
                Below minimum or missing payout info
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {ineligiblePayouts.map((payout) => (
              <div
                key={payout.partner_id}
                className="flex items-center justify-between p-4 rounded-xl bg-background/50 opacity-60"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/20 text-yellow-500 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{payout.partner_name}</p>
                      <Link to={`/partners/${payout.partner_id}`}>
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
                      </Link>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{payout.referral_count} referrals</span>
                      {payout.missing_payout_info && (
                        <span className="text-yellow-500">• Missing payout info</span>
                      )}
                      {!payout.missing_payout_info && (
                        <span className="text-yellow-500">• Below minimum</span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-lg font-medium text-muted-foreground">
                  {formatCurrency(payout.total_amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
