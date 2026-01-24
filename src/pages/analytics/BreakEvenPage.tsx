import { Target, Users, TrendingUp, Calculator, Flame, DollarSign, Crown, Sparkles } from "lucide-react";
import { useBreakEven } from "@/hooks/useRevenue";
import { useComprehensiveSummary } from "@/hooks/useCosts";
import { Skeleton } from "@/components/ui/skeleton";
import { SUBSCRIPTION_PRICING } from "@/api/types/revenue";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

interface GaugeChartProps {
  value: number; // 0 to 1 (or more for over 100%)
  label: string;
  sublabel: string;
}

function GaugeChart({ value, label, sublabel }: GaugeChartProps) {
  const clampedValue = Math.min(value, 1.5); // Cap at 150% for display
  const percentage = Math.min(value * 100, 100);
  const rotation = -90 + (clampedValue * 180);

  // Color based on progress
  const getColor = () => {
    if (value >= 1) return "hsl(142, 76%, 36%)"; // Green - profitable
    if (value >= 0.7) return "hsl(45, 100%, 51%)"; // Yellow - close
    return "hsl(0, 84%, 60%)"; // Red - far
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-64 h-32 overflow-hidden">
        {/* Background arc */}
        <div className="absolute inset-0">
          <svg viewBox="0 0 200 100" className="w-full h-full">
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="16"
              strokeLinecap="round"
            />
            {/* Progress arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke={getColor()}
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={`${percentage * 2.51} 251`}
              className="transition-all duration-1000"
            />
          </svg>
        </div>

        {/* Needle */}
        <div
          className="absolute bottom-0 left-1/2 w-1 h-20 bg-foreground origin-bottom transition-transform duration-1000"
          style={{
            transform: `translateX(-50%) rotate(${rotation}deg)`,
          }}
        >
          <div className="w-3 h-3 bg-foreground rounded-full absolute -top-1 left-1/2 -translate-x-1/2" />
        </div>

        {/* Center point */}
        <div className="absolute bottom-0 left-1/2 w-4 h-4 bg-background border-2 border-foreground rounded-full -translate-x-1/2 translate-y-1/2" />
      </div>

      {/* Labels */}
      <div className="text-center mt-4">
        <p className={`text-4xl font-bold ${value >= 1 ? 'text-green-500' : value >= 0.7 ? 'text-yellow-500' : 'text-destructive'}`}>
          {(value * 100).toFixed(1)}%
        </p>
        <p className="text-lg font-medium mt-1">{label}</p>
        <p className="text-sm text-muted-foreground">{sublabel}</p>
      </div>
    </div>
  );
}

export function BreakEvenPage() {
  const { data: breakEven, isLoading: breakEvenLoading } = useBreakEven();
  const { data: comprehensive, isLoading: comprehensiveLoading } = useComprehensiveSummary();

  const isLoading = breakEvenLoading || comprehensiveLoading;

  // Calculate break-even progress
  const breakEvenProgress = comprehensive
    ? comprehensive.total_net_revenue / comprehensive.total_monthly_cost
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold mb-2">Break-Even Analysis</h1>
        <p className="text-muted-foreground text-lg">
          Track your path to profitability
        </p>
      </div>

      {/* Main Gauge */}
      <div className="glass rounded-2xl p-8">
        <div className="flex flex-col items-center">
          {isLoading ? (
            <div className="w-64 h-48 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <GaugeChart
              value={breakEvenProgress}
              label={breakEvenProgress >= 1 ? "Profitable!" : "Break-Even Progress"}
              sublabel={breakEvenProgress >= 1
                ? `${formatCurrency(comprehensive?.monthly_profit || 0)} monthly profit`
                : `${formatCurrency((comprehensive?.total_monthly_cost || 0) - (comprehensive?.total_net_revenue || 0))} to go`
              }
            />
          )}
        </div>

        {/* Revenue vs Costs Bar */}
        {!isLoading && comprehensive && (
          <div className="mt-8 max-w-xl mx-auto">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Revenue vs Costs</span>
              <span className="font-medium">
                {formatCurrency(comprehensive.total_net_revenue)} / {formatCurrency(comprehensive.total_monthly_cost)}
              </span>
            </div>
            <div className="h-4 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-green-500 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(breakEvenProgress * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Subscription Tier Pricing */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Premium Tier */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Premium</h3>
              <p className="text-sm text-muted-foreground">VBT or Nutrition</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-background/50 text-center">
              <p className="text-xs text-muted-foreground mb-1">Weekly</p>
              <p className="text-lg font-bold">{formatCurrency(SUBSCRIPTION_PRICING.premium.weekly)}</p>
            </div>
            <div className="p-3 rounded-xl bg-background/50 text-center">
              <p className="text-xs text-muted-foreground mb-1">Monthly</p>
              <p className="text-lg font-bold">{formatCurrency(SUBSCRIPTION_PRICING.premium.monthly)}</p>
            </div>
            <div className="p-3 rounded-xl bg-background/50 text-center">
              <p className="text-xs text-muted-foreground mb-1">Yearly</p>
              <p className="text-lg font-bold">{formatCurrency(SUBSCRIPTION_PRICING.premium.yearly)}</p>
            </div>
          </div>
        </div>

        {/* Elite Tier */}
        <div className="glass rounded-2xl p-6 border border-primary/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary glow-orange text-primary-foreground flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Elite</h3>
              <p className="text-sm text-muted-foreground">AI Coach + Everything</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-background/50 text-center">
              <p className="text-xs text-muted-foreground mb-1">Weekly</p>
              <p className="text-lg font-bold">{formatCurrency(SUBSCRIPTION_PRICING.elite.weekly)}</p>
            </div>
            <div className="p-3 rounded-xl bg-background/50 text-center">
              <p className="text-xs text-muted-foreground mb-1">Monthly</p>
              <p className="text-lg font-bold">{formatCurrency(SUBSCRIPTION_PRICING.elite.monthly)}</p>
            </div>
            <div className="p-3 rounded-xl bg-background/50 text-center">
              <p className="text-xs text-muted-foreground mb-1">Yearly</p>
              <p className="text-lg font-bold">{formatCurrency(SUBSCRIPTION_PRICING.elite.yearly)}</p>
            </div>
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-center">
              <p className="text-xs text-muted-foreground mb-1">Titan</p>
              <p className="text-lg font-bold text-primary">{formatCurrency(SUBSCRIPTION_PRICING.elite.titanLifetime || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Targets */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-500/20 text-purple-500">
              <Users className="w-5 h-5" />
            </div>
            <p className="font-medium">Weekly Subs Needed</p>
          </div>
          {isLoading ? (
            <Skeleton className="h-10 w-20" />
          ) : (
            <p className="text-3xl font-bold">{Math.ceil(breakEven?.weekly_subs_needed || 0)}</p>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            at {formatCurrency(breakEven?.weekly_net_price || 0)}/wk net
          </p>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/20 text-blue-500">
              <Users className="w-5 h-5" />
            </div>
            <p className="font-medium">Monthly Subs Needed</p>
          </div>
          {isLoading ? (
            <Skeleton className="h-10 w-20" />
          ) : (
            <p className="text-3xl font-bold">{Math.ceil(breakEven?.monthly_subs_needed || 0)}</p>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            at {formatCurrency(breakEven?.monthly_net_price || 0)}/mo net
          </p>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-500/20 text-green-500">
              <Users className="w-5 h-5" />
            </div>
            <p className="font-medium">Yearly Subs Needed</p>
          </div>
          {isLoading ? (
            <Skeleton className="h-10 w-20" />
          ) : (
            <p className="text-3xl font-bold">{Math.ceil(breakEven?.yearly_subs_needed || 0)}</p>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            at {formatCurrency(breakEven?.yearly_net_price || 0)}/yr net
          </p>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary glow-orange text-primary-foreground">
              <Target className="w-5 h-5" />
            </div>
            <p className="font-medium">Mixed Subs Needed</p>
          </div>
          {isLoading ? (
            <Skeleton className="h-10 w-20" />
          ) : (
            <p className="text-3xl font-bold">{Math.ceil(breakEven?.mixed_subs_needed || 0)}</p>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            blended pricing model
          </p>
        </div>
      </div>

      {/* LTV & Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Lifetime Value (LTV)</h2>
              <p className="text-sm text-muted-foreground">Expected revenue per user</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-xl bg-background/50">
              <span className="text-muted-foreground">Weekly LTV</span>
              {isLoading ? (
                <Skeleton className="h-6 w-20" />
              ) : (
                <span className="font-bold">{formatCurrency(breakEven?.weekly_ltv || 0)}</span>
              )}
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-background/50">
              <span className="text-muted-foreground">Monthly LTV</span>
              {isLoading ? (
                <Skeleton className="h-6 w-20" />
              ) : (
                <span className="font-bold">{formatCurrency(breakEven?.monthly_ltv || 0)}</span>
              )}
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-background/50">
              <span className="text-muted-foreground">Yearly LTV</span>
              {isLoading ? (
                <Skeleton className="h-6 w-20" />
              ) : (
                <span className="font-bold">{formatCurrency(breakEven?.yearly_ltv || 0)}</span>
              )}
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-primary/10 border border-primary/20">
              <span className="font-medium">Blended LTV</span>
              {isLoading ? (
                <Skeleton className="h-6 w-20" />
              ) : (
                <span className="font-bold text-primary">{formatCurrency(breakEven?.blended_ltv || 0)}</span>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Calculator className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Cost Breakdown</h2>
              <p className="text-sm text-muted-foreground">Monthly expenses</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-xl bg-background/50">
              <span className="text-muted-foreground">Fixed Costs</span>
              {isLoading ? (
                <Skeleton className="h-6 w-20" />
              ) : (
                <span className="font-bold">{formatCurrency(breakEven?.monthly_fixed_cost || 0)}</span>
              )}
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-background/50">
              <span className="text-muted-foreground">Variable Cost/User</span>
              {isLoading ? (
                <Skeleton className="h-6 w-20" />
              ) : (
                <span className="font-bold">{formatCurrency(breakEven?.variable_cost_per_user || 0)}</span>
              )}
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-destructive/10 border border-destructive/20">
              <span className="font-medium">Total Monthly Cost</span>
              {isLoading ? (
                <Skeleton className="h-6 w-20" />
              ) : (
                <span className="font-bold text-destructive">{formatCurrency(breakEven?.total_monthly_cost || 0)}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Churn & Retention */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <Flame className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Retention Metrics</h2>
            <p className="text-sm text-muted-foreground">User lifecycle data</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          <div className="p-4 rounded-xl bg-background/50 text-center">
            <p className="text-sm text-muted-foreground mb-1">Weekly Churn</p>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mx-auto" />
            ) : (
              <p className="text-2xl font-bold text-destructive">
                {formatPercent(breakEven?.weekly_churn_rate || 0)}
              </p>
            )}
          </div>
          <div className="p-4 rounded-xl bg-background/50 text-center">
            <p className="text-sm text-muted-foreground mb-1">Monthly Churn</p>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mx-auto" />
            ) : (
              <p className="text-2xl font-bold text-destructive">
                {formatPercent(breakEven?.monthly_churn_rate || 0)}
              </p>
            )}
          </div>
          <div className="p-4 rounded-xl bg-background/50 text-center">
            <p className="text-sm text-muted-foreground mb-1">Yearly Renewal</p>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mx-auto" />
            ) : (
              <p className="text-2xl font-bold text-green-500">
                {formatPercent(breakEven?.yearly_renewal_rate || 0)}
              </p>
            )}
          </div>
          <div className="p-4 rounded-xl bg-background/50 text-center">
            <p className="text-sm text-muted-foreground mb-1">Avg Weekly Lifetime</p>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mx-auto" />
            ) : (
              <p className="text-2xl font-bold">
                {(breakEven?.avg_weekly_lifetime || 0).toFixed(1)} wk
              </p>
            )}
          </div>
          <div className="p-4 rounded-xl bg-background/50 text-center">
            <p className="text-sm text-muted-foreground mb-1">Avg Monthly Lifetime</p>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mx-auto" />
            ) : (
              <p className="text-2xl font-bold">
                {(breakEven?.avg_monthly_lifetime || 0).toFixed(1)} mo
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
