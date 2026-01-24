import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  AlertTriangle,
  DollarSign,
  Users,
  RefreshCw,
  Star,
  Settings,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useTeamPerformance,
  useRecentActivities,
  useSyncAsana,
  useAsanaStatus,
} from "@/hooks/usePerformance";
import type { PerformanceFilters, PerformancePeriod, EmployeePerformance } from "@/api/types/performance";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { AsanaSettings } from "@/components/performance/AsanaSettings";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "CHF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function PerformanceStars({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "w-4 h-4",
            star <= score
              ? "fill-primary text-primary"
              : "fill-muted text-muted"
          )}
        />
      ))}
    </div>
  );
}

function TrendBadge({ trend, percent }: { trend: "up" | "down" | "stable"; percent: number }) {
  if (trend === "stable") {
    return (
      <span className="text-xs text-muted-foreground">
        stable
      </span>
    );
  }

  return (
    <span
      className={cn(
        "flex items-center gap-1 text-xs font-medium",
        trend === "up" ? "text-green-500" : "text-red-500"
      )}
    >
      {trend === "up" ? (
        <TrendingUp className="w-3 h-3" />
      ) : (
        <TrendingDown className="w-3 h-3" />
      )}
      {Math.abs(percent)}%
    </span>
  );
}

function EmployeeRow({
  employee,
  onSelect,
}: {
  employee: EmployeePerformance;
  onSelect: (id: string) => void;
}) {
  const metrics = employee.currentPeriod;

  return (
    <div
      onClick={() => onSelect(employee.employeeId)}
      className={cn(
        "glass rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg",
        employee.needsAttention && "border border-red-500/30 bg-red-500/5",
        employee.isTopPerformer && "border border-green-500/30 bg-green-500/5"
      )}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Employee Info */}
        <div className="flex items-center gap-3 min-w-[180px]">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold",
              employee.needsAttention
                ? "bg-red-500"
                : employee.isTopPerformer
                ? "bg-green-500"
                : "bg-primary"
            )}
          >
            {employee.employeeName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold">{employee.employeeName}</p>
              {employee.needsAttention && (
                <AlertTriangle className="w-4 h-4 text-red-500" />
              )}
              {employee.isTopPerformer && (
                <Star className="w-4 h-4 text-green-500 fill-green-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">{employee.employeeRole}</p>
          </div>
        </div>

        {/* Tasks */}
        <div className="text-center min-w-[80px]">
          <p className="text-lg font-bold">{metrics.tasksCompleted}</p>
          <p className="text-xs text-muted-foreground">Tasks</p>
        </div>

        {/* On-Time Rate */}
        <div className="text-center min-w-[80px]">
          <p
            className={cn(
              "text-lg font-bold",
              metrics.onTimeRate >= 90
                ? "text-green-500"
                : metrics.onTimeRate >= 70
                ? "text-yellow-500"
                : "text-red-500"
            )}
          >
            {metrics.onTimeRate}%
          </p>
          <p className="text-xs text-muted-foreground">On-Time</p>
        </div>

        {/* Revenue */}
        <div className="text-center min-w-[100px]">
          <p className="text-lg font-bold">
            {metrics.revenueGenerated > 0
              ? formatCurrency(metrics.revenueGenerated)
              : "-"}
          </p>
          <p className="text-xs text-muted-foreground">Revenue</p>
        </div>

        {/* Score */}
        <div className="flex flex-col items-center gap-1 min-w-[100px]">
          <PerformanceStars score={metrics.performanceScore} />
          <TrendBadge trend={metrics.trend} percent={metrics.trendPercent} />
        </div>

        {/* Action */}
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>
    </div>
  );
}

const PERIOD_OPTIONS: { value: PerformancePeriod; label: string }[] = [
  { value: "this_week", label: "This Week" },
  { value: "last_week", label: "Last Week" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "this_quarter", label: "This Quarter" },
];

export function PerformanceDashboard() {
  const [filters, setFilters] = useState<PerformanceFilters>({
    period: "this_week",
    sortBy: "score",
    sortOrder: "desc",
  });

  const [_selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [showAsanaSettings, setShowAsanaSettings] = useState(false);

  const { data: teamData, isLoading, refetch } = useTeamPerformance(filters);
  const { data: activities } = useRecentActivities(5);
  const { data: asanaStatus, refetch: refetchAsanaStatus } = useAsanaStatus();
  const syncMutation = useSyncAsana();

  const handleAsanaConfigured = () => {
    refetchAsanaStatus();
    refetch();
  };

  const handleSync = () => {
    syncMutation.mutate();
  };

  // Sort employees
  const sortedEmployees = [...(teamData?.employees || [])].sort((a, b) => {
    const multiplier = filters.sortOrder === "desc" ? -1 : 1;
    switch (filters.sortBy) {
      case "score":
        return (a.currentPeriod.performanceScore - b.currentPeriod.performanceScore) * multiplier;
      case "tasks":
        return (a.currentPeriod.tasksCompleted - b.currentPeriod.tasksCompleted) * multiplier;
      case "revenue":
        return (a.currentPeriod.revenueGenerated - b.currentPeriod.revenueGenerated) * multiplier;
      case "on_time":
        return (a.currentPeriod.onTimeRate - b.currentPeriod.onTimeRate) * multiplier;
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Performance Tracker</h1>
          <p className="text-muted-foreground text-lg">
            Employee performance based on Asana tasks & revenue
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={handleSync}
            disabled={syncMutation.isPending}
          >
            <RefreshCw
              className={cn(
                "w-4 h-4 mr-2",
                syncMutation.isPending && "animate-spin"
              )}
            />
            {syncMutation.isPending ? "Syncing..." : "Sync Asana"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl"
            onClick={() => setShowAsanaSettings(true)}
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Asana Status Banner */}
      {!asanaStatus?.isConfigured && (
        <div className="glass rounded-xl p-4 border border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <div>
                <p className="font-medium text-amber-500">Asana not connected</p>
                <p className="text-sm text-muted-foreground">
                  Connect Asana to see real task data. Currently showing demo data.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => setShowAsanaSettings(true)}
            >
              Connect
            </Button>
          </div>
        </div>
      )}

      {/* Period Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {PERIOD_OPTIONS.map((option) => (
          <Button
            key={option.value}
            variant={filters.period === option.value ? "default" : "ghost"}
            size="sm"
            className="rounded-xl"
            onClick={() => setFilters({ ...filters, period: option.value })}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/20 text-primary">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tasks Completed</p>
              {isLoading ? (
                <Skeleton className="h-8 w-20 mt-1" />
              ) : (
                <p className="text-2xl font-bold">{teamData?.totalTasksCompleted || 0}</p>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-500/20 text-green-500">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              {isLoading ? (
                <Skeleton className="h-8 w-24 mt-1" />
              ) : (
                <p className="text-2xl font-bold">
                  {formatCurrency(teamData?.totalRevenue || 0)}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-500/20 text-blue-500">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg. On-Time Rate</p>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <p className="text-2xl font-bold">{teamData?.avgOnTimeRate || 0}%</p>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-yellow-500/20 text-yellow-500">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg. Score</p>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{teamData?.avgPerformanceScore || 0}</p>
                  <span className="text-sm text-muted-foreground">/ 5</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {teamData && (teamData.needsAttention.length > 0 || teamData.topPerformers.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Needs Attention */}
          {teamData.needsAttention.length > 0 && (
            <div className="glass rounded-2xl p-5 border border-red-500/20">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-red-500">Needs Attention</h3>
              </div>
              <div className="space-y-3">
                {teamData.needsAttention.map((emp) => (
                  <div
                    key={emp.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-red-500/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-bold">
                        {emp.employeeName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{emp.employeeName}</p>
                        <p className="text-xs text-muted-foreground">
                          {emp.currentPeriod.tasksOverdue} tasks overdue
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-500">
                        {emp.currentPeriod.onTimeRate}% On-Time
                      </p>
                      <TrendBadge
                        trend={emp.currentPeriod.trend}
                        percent={emp.currentPeriod.trendPercent}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Performers */}
          {teamData.topPerformers.length > 0 && (
            <div className="glass rounded-2xl p-5 border border-green-500/20">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-green-500 fill-green-500" />
                <h3 className="font-bold text-green-500">Top Performer</h3>
              </div>
              <div className="space-y-3">
                {teamData.topPerformers.map((emp) => (
                  <div
                    key={emp.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-green-500/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">
                        {emp.employeeName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{emp.employeeName}</p>
                        <p className="text-xs text-muted-foreground">
                          {emp.currentPeriod.tasksCompleted} tasks completed
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <PerformanceStars score={emp.currentPeriod.performanceScore} />
                      <TrendBadge
                        trend={emp.currentPeriod.trend}
                        percent={emp.currentPeriod.trendPercent}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sort Controls */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Sort by:</span>
        {[
          { value: "score", label: "Score" },
          { value: "tasks", label: "Tasks" },
          { value: "revenue", label: "Revenue" },
          { value: "on_time", label: "On-Time" },
        ].map((option) => (
          <Button
            key={option.value}
            variant={filters.sortBy === option.value ? "secondary" : "ghost"}
            size="sm"
            className="rounded-xl"
            onClick={() =>
              setFilters({
                ...filters,
                sortBy: option.value as typeof filters.sortBy,
                sortOrder:
                  filters.sortBy === option.value
                    ? filters.sortOrder === "desc"
                      ? "asc"
                      : "desc"
                    : "desc",
              })
            }
          >
            {option.label}
            {filters.sortBy === option.value && (
              <span className="ml-1">{filters.sortOrder === "desc" ? "↓" : "↑"}</span>
            )}
          </Button>
        ))}
      </div>

      {/* Employee List */}
      <div className="space-y-3">
        {isLoading ? (
          <>
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </>
        ) : sortedEmployees.length > 0 ? (
          sortedEmployees.map((employee) => (
            <EmployeeRow
              key={employee.id}
              employee={employee}
              onSelect={setSelectedEmployee}
            />
          ))
        ) : (
          <div className="glass rounded-2xl p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-bold mb-2">No data</h3>
            <p className="text-muted-foreground">
              Connect Asana to see employee data
            </p>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      {activities && activities.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Recent Activities
          </h3>
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      activity.wasOnTime ? "bg-green-500" : "bg-red-500"
                    )}
                  />
                  <div>
                    <p className="font-medium">{activity.taskName}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.employeeName} • {activity.projectName}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.completedAt), {
                      addSuffix: true,
                    })}
                  </p>
                  {!activity.wasOnTime && activity.daysLate && (
                    <p className="text-xs text-red-500">{activity.daysLate} days late</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Asana Settings Modal */}
      <AsanaSettings
        isOpen={showAsanaSettings}
        onClose={() => setShowAsanaSettings(false)}
        onConfigured={handleAsanaConfigured}
      />
    </div>
  );
}
