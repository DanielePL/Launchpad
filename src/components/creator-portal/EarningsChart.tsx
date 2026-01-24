import { useEarningsChart } from "@/hooks/usePartnerPortal";
import { CURRENCY } from "@/api/types/partnerPortal";
import { TrendingUp } from "lucide-react";

export function EarningsChart() {
  const { data: chartData, isLoading } = useEarningsChart(6);

  if (isLoading) {
    return (
      <div className="rounded-xl bg-card p-6">
        <div className="h-6 w-32 bg-muted animate-pulse rounded mb-4" />
        <div className="h-48 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  const maxEarnings = Math.max(...(chartData?.map((d) => d.earnings) || [1]));

  return (
    <div className="rounded-xl bg-card p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Earnings Overview</h3>
      </div>

      {chartData && chartData.length > 0 ? (
        <div className="space-y-4">
          {/* Simple bar chart */}
          <div className="flex items-end gap-2 h-48">
            {chartData.map((point) => {
              const height = maxEarnings > 0 ? (point.earnings / maxEarnings) * 100 : 0;
              const monthName = new Date(point.month + "-01").toLocaleDateString("en-US", {
                month: "short",
              });

              return (
                <div key={point.month} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center justify-end h-40">
                    <span className="text-xs text-muted-foreground mb-1">
                      {CURRENCY} {point.earnings.toFixed(0)}
                    </span>
                    <div
                      className="w-full bg-primary rounded-t-lg transition-all"
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{monthName}</span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-primary" />
              <span>Earnings</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-48 text-muted-foreground">
          No earnings data yet
        </div>
      )}
    </div>
  );
}
