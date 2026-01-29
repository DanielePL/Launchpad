import { Link } from "react-router-dom";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Flame,
  Target,
  ArrowRight,
  MessageSquare,
  Camera,
  Video,
  HardDrive,
  UserPlus,
  Wallet,
  CreditCard,
  Trophy,
  AlertTriangle,
  Clock,
  Activity,
  UserCheck,
  Check,
  X,
  Instagram,
  ExternalLink,
  CheckSquare,
} from "lucide-react";
import { TaskDeadlineWidget } from "@/components/tasks/dashboard/TaskDeadlineWidget";
import { useComprehensiveSummary, useServiceCosts } from "@/hooks/useCosts";
import { useBreakEven } from "@/hooks/useRevenue";
import { usePartners, usePendingPayouts, usePartnerReferrals, useApprovePartner } from "@/hooks/usePartners";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useDailyCosts } from "@/hooks/useCosts";
import { format, parseISO } from "date-fns";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function DashboardPage() {
  const { isSuperAdmin } = useAuth();
  const { data: comprehensive, isLoading: comprehensiveLoading } = useComprehensiveSummary();
  const { data: serviceCosts, isLoading: serviceLoading } = useServiceCosts();
  const { data: breakEven, isLoading: breakEvenLoading } = useBreakEven();
  const { data: partners, isLoading: partnersLoading } = usePartners();
  const { data: pendingPayouts, isLoading: payoutsLoading } = usePendingPayouts();
  const { data: dailyCosts, isLoading: dailyLoading } = useDailyCosts(14);
  const { data: referrals, isLoading: referralsLoading } = usePartnerReferrals();
  const approvePartnerMutation = useApprovePartner();

  const isLoading = comprehensiveLoading || serviceLoading || breakEvenLoading;

  // Pending creator approvals (only for super admin)
  const pendingApprovals = partners?.filter(p => p.status === "pending_approval") || [];

  const handleApprovePartner = async (partnerId: string, approved: boolean) => {
    await approvePartnerMutation.mutateAsync({
      partner_id: partnerId,
      approved,
    });
  };

  // Calculate break-even progress
  const breakEvenProgress = comprehensive
    ? comprehensive.total_net_revenue / comprehensive.total_monthly_cost
    : 0;

  // Prepare chart data
  const chartData = dailyCosts?.map((day) => ({
    date: format(parseISO(day.date), "MMM d"),
    cost: day.total_estimated_cost,
  })) || [];

  // Service cost pie chart data
  const pieData = serviceCosts ? [
    { name: "AI Coach", value: serviceCosts.ai_coach.cost, color: "hsl(23, 87%, 55%)" },
    { name: "Photo", value: serviceCosts.photo_analysis.cost, color: "hsl(217, 91%, 60%)" },
    { name: "VBT", value: serviceCosts.vbt.cost, color: "hsl(142, 76%, 36%)" },
    { name: "Storage", value: serviceCosts.storage.cost, color: "hsl(45, 93%, 47%)" },
  ].filter(d => d.value > 0) : [];

  const totalServiceCost = pieData.reduce((sum, d) => sum + d.value, 0);

  // Active creators
  const activePartners = partners?.filter(p => p.status === "active").length || 0;
  const totalPendingPayout = pendingPayouts?.total_pending || 0;

  // Creator monitoring
  const getDaysSinceLastReferral = (lastReferralAt?: string) => {
    if (!lastReferralAt) return Infinity;
    const lastDate = new Date(lastReferralAt);
    const now = new Date();
    return Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Needs Attention: Active creators with 0 referrals this month OR no referral in 14+ days
  const needsAttention = partners?.filter((p) => {
    if (p.status !== "active") return false;
    const daysSince = getDaysSinceLastReferral(p.last_referral_at);
    return (p.referrals_this_month === 0) || daysSince >= 14;
  }).slice(0, 3) || [];

  // Creator Wins: Creators with referrals this month
  const partnerWins = partners?.filter((p) => {
    return (p.referrals_this_month || 0) > 0;
  }).sort((a, b) => (b.referrals_this_month || 0) - (a.referrals_this_month || 0)).slice(0, 3) || [];

  // Recent referrals for activity feed
  const recentReferrals = referrals?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground text-lg">
          Overview of your business metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link to="/costs" className="glass rounded-2xl p-5 transition-smooth hover:shadow-[0_0_50px_rgba(var(--primary-rgb),0.3)] group">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-destructive/20 text-destructive">
              <DollarSign className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Costs</p>
              {isLoading ? (
                <Skeleton className="h-8 w-28" />
              ) : (
                <div className="text-2xl lg:text-3xl font-bold text-foreground group-hover:text-primary transition-smooth">
                  {formatCurrency(comprehensive?.total_monthly_cost || 0)}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </div>
          </div>
        </Link>

        <Link to="/revenue" className="glass rounded-2xl p-5 transition-smooth hover:shadow-[0_0_50px_rgba(var(--primary-rgb),0.3)] group">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-green-500/20 text-green-500">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">Net Revenue</p>
              {isLoading ? (
                <Skeleton className="h-8 w-28" />
              ) : (
                <div className="text-2xl lg:text-3xl font-bold text-foreground group-hover:text-primary transition-smooth">
                  {formatCurrency(comprehensive?.total_net_revenue || 0)}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">After commissions</p>
            </div>
          </div>
        </Link>

        <Link to="/users" className="glass rounded-2xl p-5 transition-smooth hover:shadow-[0_0_50px_rgba(var(--primary-rgb),0.3)] group">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-500/20 text-blue-500">
              <Users className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">Active Users</p>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl lg:text-3xl font-bold text-foreground group-hover:text-primary transition-smooth">
                  {formatNumber(comprehensive?.active_users || 0)}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(comprehensive?.cost_per_active_user || 0)} avg cost
              </p>
            </div>
          </div>
        </Link>

        <Link to="/analytics/break-even" className="glass rounded-2xl p-5 transition-smooth hover:shadow-[0_0_50px_rgba(var(--primary-rgb),0.3)] group">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary glow-orange text-primary-foreground">
              <Flame className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">Break-Even</p>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className={`text-2xl lg:text-3xl font-bold transition-smooth ${
                  breakEvenProgress >= 1 ? 'text-green-500' : 'group-hover:text-primary'
                }`}>
                  {formatPercent(breakEvenProgress)}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {breakEvenProgress >= 1 ? "Profitable!" : "To break-even"}
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Pending Creator Approvals - Super Admin Only */}
      {isSuperAdmin && pendingApprovals.length > 0 && (
        <div className="glass rounded-2xl p-6 border-2 border-orange-500/30 bg-orange-500/5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-500 flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Creator Approvals Required</h2>
              <p className="text-sm text-muted-foreground">
                {pendingApprovals.length} creator{pendingApprovals.length !== 1 ? "s" : ""} waiting for your approval
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {pendingApprovals.map((partner) => (
              <div
                key={partner.id}
                className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-white/10"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{partner.name}</p>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/20 text-orange-500">
                        Pending
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span>{partner.email}</span>
                      {partner.instagram_handle && (
                        <a
                          href={`https://instagram.com/${partner.instagram_handle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-primary transition-colors"
                        >
                          <Instagram className="w-3.5 h-3.5" />
                          @{partner.instagram_handle}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <span className="text-xs">
                        Code: <code className="px-1 py-0.5 bg-background rounded">{partner.referral_code}</code>
                      </span>
                      <span className="text-xs">{partner.commission_percent}% commission</span>
                    </div>
                    {partner.created_by && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Created by: {partner.created_by}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Link to={`/partners/${partner.id}`}>
                    <Button variant="outline" size="sm" className="rounded-xl">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleApprovePartner(partner.id, false)}
                    disabled={approvePartnerMutation.isPending}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    className="rounded-xl glow-orange"
                    onClick={() => handleApprovePartner(partner.id, true)}
                    disabled={approvePartnerMutation.isPending}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profit/Loss Banner */}
      {!isLoading && comprehensive && (
        <div className={`glass rounded-2xl p-6 border-2 ${
          comprehensive.monthly_profit >= 0
            ? 'border-green-500/30 bg-green-500/5'
            : 'border-destructive/30 bg-destructive/5'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                comprehensive.monthly_profit >= 0
                  ? 'bg-green-500/20 text-green-500'
                  : 'bg-destructive/20 text-destructive'
              }`}>
                {comprehensive.monthly_profit >= 0 ? (
                  <TrendingUp className="w-7 h-7" />
                ) : (
                  <TrendingDown className="w-7 h-7" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Profit/Loss</p>
                <p className={`text-3xl font-bold ${
                  comprehensive.monthly_profit >= 0 ? 'text-green-500' : 'text-destructive'
                }`}>
                  {formatCurrency(comprehensive.monthly_profit)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Revenue per User</p>
              <p className="text-xl font-bold">{formatCurrency(comprehensive.revenue_per_active_user)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Costs Chart */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Daily Costs</h2>
                <p className="text-sm text-muted-foreground">Last 14 days</p>
              </div>
            </div>
            <Link to="/costs">
              <Button variant="ghost" size="sm" className="rounded-xl">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {dailyLoading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : chartData.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCostDash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(23, 87%, 55%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(23, 87%, 55%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v.toFixed(2)}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                    }}
                    formatter={(value) => [`$${Number(value).toFixed(4)}`, "Cost"]}
                  />
                  <Area type="monotone" dataKey="cost" stroke="hsl(23, 87%, 55%)" strokeWidth={2} fill="url(#colorCostDash)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              <p>No data available</p>
            </div>
          )}
        </div>

        {/* Service Cost Breakdown */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <Target className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Cost Breakdown</h2>
                <p className="text-sm text-muted-foreground">By service</p>
              </div>
            </div>
          </div>

          {serviceLoading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : pieData.length > 0 ? (
            <div className="flex items-center gap-6">
              <div className="w-40 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-3">
                {serviceCosts && (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        <span className="text-sm">AI Coach</span>
                      </div>
                      <span className="font-medium">{formatCurrency(serviceCosts.ai_coach.cost)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">Photo Analysis</span>
                      </div>
                      <span className="font-medium">{formatCurrency(serviceCosts.photo_analysis.cost)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-green-500" />
                        <span className="text-sm">VBT</span>
                      </div>
                      <span className="font-medium">{formatCurrency(serviceCosts.vbt.cost)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm">Storage</span>
                      </div>
                      <span className="font-medium">{formatCurrency(serviceCosts.storage.cost)}</span>
                    </div>
                    <div className="pt-2 border-t border-border flex items-center justify-between">
                      <span className="font-medium">Total</span>
                      <span className="font-bold text-primary">{formatCurrency(totalServiceCost)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              <p>No service costs yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Break-Even Target */}
        <Link to="/analytics/break-even" className="glass rounded-2xl p-5 transition-smooth hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Subs Needed</p>
              {breakEvenLoading ? (
                <Skeleton className="h-6 w-16 mt-1" />
              ) : (
                <p className="text-lg font-bold">{Math.ceil(breakEven?.mixed_subs_needed || 0)}</p>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Mixed monthly/yearly to break even
          </p>
        </Link>

        {/* Creators */}
        <Link to="/partners" className="glass rounded-2xl p-5 transition-smooth hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Creators</p>
              {partnersLoading ? (
                <Skeleton className="h-6 w-12 mt-1" />
              ) : (
                <p className="text-lg font-bold">{activePartners}</p>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {partners?.reduce((sum, p) => sum + p.total_referrals, 0) || 0} total referrals
          </p>
        </Link>

        {/* Pending Payouts */}
        <Link to="/payouts" className="glass rounded-2xl p-5 transition-smooth hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 text-yellow-500 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Payouts</p>
              {payoutsLoading ? (
                <Skeleton className="h-6 w-20 mt-1" />
              ) : (
                <p className="text-lg font-bold">{formatCurrency(totalPendingPayout)}</p>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {pendingPayouts?.pending_payouts?.filter(p => p.eligible).length || 0} creators ready
          </p>
        </Link>
      </div>

      {/* Creator Monitoring & Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Needs Attention */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <h3 className="font-bold">Needs Attention</h3>
                <p className="text-xs text-muted-foreground">Inactive creators</p>
              </div>
            </div>
            <Link to="/partners">
              <Button variant="ghost" size="sm" className="rounded-xl h-8 w-8 p-0">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {partnersLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 rounded-xl" />
              <Skeleton className="h-12 rounded-xl" />
            </div>
          ) : needsAttention.length > 0 ? (
            <div className="space-y-2">
              {needsAttention.map((partner) => {
                const daysSince = getDaysSinceLastReferral(partner.last_referral_at);
                return (
                  <Link
                    key={partner.id}
                    to={`/partners/${partner.id}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-background/50 hover:bg-background/70 transition-smooth"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium text-sm truncate">{partner.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {daysSince === Infinity ? "Never" : `${daysSince}d`}
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <TrendingUp className="w-6 h-6 mx-auto mb-1 opacity-50" />
              <p className="text-xs">All creators active!</p>
            </div>
          )}
        </div>

        {/* Creator Wins */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-bold">Creator Wins</h3>
                <p className="text-xs text-muted-foreground">Top performers</p>
              </div>
            </div>
            <Link to="/partners">
              <Button variant="ghost" size="sm" className="rounded-xl h-8 w-8 p-0">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {partnersLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 rounded-xl" />
              <Skeleton className="h-12 rounded-xl" />
            </div>
          ) : partnerWins.length > 0 ? (
            <div className="space-y-2">
              {partnerWins.map((partner, index) => (
                <Link
                  key={partner.id}
                  to={`/partners/${partner.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-background/50 hover:bg-background/70 transition-smooth"
                >
                  <div className="flex items-center gap-2">
                    <Trophy className={`w-4 h-4 ${
                      index === 0 ? "text-yellow-500" : index === 1 ? "text-gray-400" : "text-amber-600"
                    }`} />
                    <span className="font-medium text-sm truncate">{partner.name}</span>
                  </div>
                  <span className="text-xs font-bold text-green-500">
                    +{partner.referrals_this_month || 0}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <Trophy className="w-6 h-6 mx-auto mb-1 opacity-50" />
              <p className="text-xs">No referrals this month</p>
            </div>
          )}
        </div>

        {/* Recent Activity Feed */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold">Activity Feed</h3>
                <p className="text-xs text-muted-foreground">Recent referrals</p>
              </div>
            </div>
            <Link to="/partners">
              <Button variant="ghost" size="sm" className="rounded-xl h-8 w-8 p-0">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {referralsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 rounded-xl" />
              <Skeleton className="h-12 rounded-xl" />
              <Skeleton className="h-12 rounded-xl" />
            </div>
          ) : recentReferrals.length > 0 ? (
            <div className="space-y-2">
              {recentReferrals.map((referral) => (
                <Link
                  key={referral.id}
                  to={`/partners/${referral.partner_id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-background/50 hover:bg-background/70 transition-smooth"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{referral.partner_name || "Creator"}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {referral.user_email || "New signup"}
                    </p>
                  </div>
                  <div className="text-right ml-2">
                    <p className="text-xs font-bold text-green-500">
                      {formatCurrency(referral.commission_amount || 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {referral.referral_date ? format(parseISO(referral.referral_date), "MMM d") : "-"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <Activity className="w-6 h-6 mx-auto mb-1 opacity-50" />
              <p className="text-xs">No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* Task Deadline Alerts */}
      <TaskDeadlineWidget />

      {/* Quick Actions */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/costs/fixed">
            <Button variant="outline" className="rounded-xl">
              <CreditCard className="w-4 h-4 mr-2" />
              Manage Fixed Costs
            </Button>
          </Link>
          <Link to="/revenue">
            <Button variant="outline" className="rounded-xl">
              <TrendingUp className="w-4 h-4 mr-2" />
              Add Revenue
            </Button>
          </Link>
          <Link to="/partners">
            <Button variant="outline" className="rounded-xl">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Creator
            </Button>
          </Link>
          <Link to="/tasks">
            <Button variant="outline" className="rounded-xl">
              <CheckSquare className="w-4 h-4 mr-2" />
              Manage Tasks
            </Button>
          </Link>
          <Link to="/payouts">
            <Button variant="outline" className="rounded-xl">
              <Wallet className="w-4 h-4 mr-2" />
              Process Payouts
            </Button>
          </Link>
          <Link to="/employees">
            <Button variant="outline" className="rounded-xl">
              <Users className="w-4 h-4 mr-2" />
              Calculate Salaries
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
