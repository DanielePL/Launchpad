import { MessageSquare, Camera, Video, HardDrive, BarChart3, TrendingUp, Users, DollarSign } from "lucide-react";
import { useServiceCosts, useDailyCosts, useComprehensiveSummary } from "@/hooks/useCosts";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
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

export function CostsOverviewPage() {
  const { data: serviceCosts, isLoading: servicesLoading } = useServiceCosts();
  const { data: dailyCosts, isLoading: dailyLoading } = useDailyCosts(30);
  const { data: comprehensive, isLoading: comprehensiveLoading } = useComprehensiveSummary();

  // Prepare chart data
  const chartData = dailyCosts?.map((day) => ({
    date: format(parseISO(day.date), "MMM d"),
    cost: day.total_estimated_cost,
    aiCoach: day.ai_coach_messages * 0.002, // Approximate cost per message
    photoAnalysis: day.openai_vision_calls * 0.01,
    vbt: day.vbt_analysis_calls * 0.02,
    storage: day.storage_uploads * 0.001,
  })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold mb-2">Cost Analytics</h1>
        <p className="text-muted-foreground text-lg">
          Track and analyze your operational costs
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="glass rounded-2xl p-5 transition-smooth cursor-pointer hover:shadow-[0_0_50px_rgba(var(--primary-rgb),0.3)] group">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary/20 text-primary">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">AI Coach</p>
              {servicesLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl lg:text-3xl font-bold text-foreground group-hover:text-primary transition-smooth">
                    {formatCurrency(serviceCosts?.ai_coach.cost || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatNumber(serviceCosts?.ai_coach.count || 0)} messages
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5 transition-smooth cursor-pointer hover:shadow-[0_0_50px_rgba(var(--primary-rgb),0.3)] group">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-500/20 text-blue-500">
              <Camera className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">Photo Analysis</p>
              {servicesLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl lg:text-3xl font-bold text-foreground group-hover:text-primary transition-smooth">
                    {formatCurrency(serviceCosts?.photo_analysis.cost || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatNumber(serviceCosts?.photo_analysis.count || 0)} scans
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5 transition-smooth cursor-pointer hover:shadow-[0_0_50px_rgba(var(--primary-rgb),0.3)] group">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-green-500/20 text-green-500">
              <Video className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">VBT Analysis</p>
              {servicesLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl lg:text-3xl font-bold text-foreground group-hover:text-primary transition-smooth">
                    {formatCurrency(serviceCosts?.vbt.cost || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatNumber(serviceCosts?.vbt.count || 0)} videos
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5 transition-smooth cursor-pointer hover:shadow-[0_0_50px_rgba(var(--primary-rgb),0.3)] group">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-yellow-500/20 text-yellow-500">
              <HardDrive className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">Storage</p>
              {servicesLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl lg:text-3xl font-bold text-foreground group-hover:text-primary transition-smooth">
                    {formatCurrency(serviceCosts?.storage.cost || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatNumber(serviceCosts?.storage.count || 0)} uploads
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-destructive/20 text-destructive">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Variable Cost</p>
              {comprehensiveLoading ? (
                <Skeleton className="h-7 w-24 mt-1" />
              ) : (
                <p className="text-xl font-bold">{formatCurrency(comprehensive?.total_variable_cost || 0)}</p>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/20 text-primary">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Users</p>
              {comprehensiveLoading ? (
                <Skeleton className="h-7 w-16 mt-1" />
              ) : (
                <p className="text-xl font-bold">{formatNumber(comprehensive?.active_users || 0)}</p>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-500/20 text-green-500">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cost per User</p>
              {comprehensiveLoading ? (
                <Skeleton className="h-7 w-20 mt-1" />
              ) : (
                <p className="text-xl font-bold">{formatCurrency(comprehensive?.cost_per_active_user || 0)}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Daily Costs Chart */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Daily Costs</h2>
            <p className="text-sm text-muted-foreground">Last 30 days</p>
          </div>
        </div>

        {dailyLoading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading chart data...</p>
            </div>
          </div>
        ) : chartData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(23, 87%, 55%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(23, 87%, 55%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    boxShadow: "var(--shadow-glass)",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  formatter={(value) => [`$${Number(value).toFixed(4)}`, "Cost"]}
                />
                <Area
                  type="monotone"
                  dataKey="cost"
                  stroke="hsl(23, 87%, 55%)"
                  strokeWidth={2}
                  fill="url(#colorCost)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No data available for the selected period</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
