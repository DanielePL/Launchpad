import { useState, useMemo } from "react";
import {
  TrendingUp,
  DollarSign,
  Smartphone,
  Monitor,
  Apple,
  Plus,
  Pencil,
  Trash2,
  Calendar,
} from "lucide-react";
import { useRevenue, useCreateRevenue, useUpdateRevenue, useDeleteRevenue } from "@/hooks/useRevenue";
import { useComprehensiveSummary } from "@/hooks/useCosts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format, parseISO, startOfMonth, subMonths } from "date-fns";
import type { Revenue, CreateRevenueInput } from "@/api/types/revenue";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

const platformIcons = {
  ios: Apple,
  android: Smartphone,
  web: Monitor,
};

const platformColors = {
  ios: "#007AFF",
  android: "#3DDC84",
  web: "#F97316",
};

interface RevenueFormProps {
  revenue?: Revenue;
  onSubmit: (data: CreateRevenueInput) => void;
  onCancel: () => void;
  isLoading: boolean;
}

function RevenueForm({ revenue, onSubmit, onCancel, isLoading }: RevenueFormProps) {
  const [formData, setFormData] = useState<CreateRevenueInput>({
    platform: revenue?.platform || "ios",
    revenue_type: revenue?.revenue_type || "subscription",
    gross_revenue: revenue?.gross_revenue || 0,
    period_start: revenue?.period_start || format(new Date(), "yyyy-MM-dd"),
    period_end: revenue?.period_end || "",
    notes: revenue?.notes || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4">
      <h3 className="text-lg font-bold">{revenue ? "Edit Revenue Entry" : "Add Revenue Entry"}</h3>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Platform</label>
          <select
            value={formData.platform}
            onChange={(e) => setFormData({ ...formData, platform: e.target.value as "ios" | "android" | "web" })}
            className="w-full h-10 px-3 rounded-xl bg-background border border-input"
          >
            <option value="ios">iOS (App Store)</option>
            <option value="android">Android (Play Store)</option>
            <option value="web">Web</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Type</label>
          <select
            value={formData.revenue_type}
            onChange={(e) => setFormData({ ...formData, revenue_type: e.target.value as "subscription" | "one_time" | "ad" })}
            className="w-full h-10 px-3 rounded-xl bg-background border border-input"
          >
            <option value="subscription">Subscription</option>
            <option value="one_time">One-time</option>
            <option value="ad">Ad Revenue</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Gross Revenue ($)</label>
          <Input
            type="number"
            step="0.01"
            value={formData.gross_revenue}
            onChange={(e) => setFormData({ ...formData, gross_revenue: parseFloat(e.target.value) || 0 })}
            placeholder="0.00"
            className="rounded-xl"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Period Start</label>
          <Input
            type="date"
            value={formData.period_start}
            onChange={(e) => setFormData({ ...formData, period_start: e.target.value })}
            className="rounded-xl"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Period End (optional)</label>
          <Input
            type="date"
            value={formData.period_end}
            onChange={(e) => setFormData({ ...formData, period_end: e.target.value })}
            className="rounded-xl"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Notes (optional)</label>
        <Input
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Add notes..."
          className="rounded-xl"
        />
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="ghost" onClick={onCancel} className="rounded-xl">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="rounded-xl glow-orange">
          {isLoading ? "Saving..." : revenue ? "Update" : "Add Revenue"}
        </Button>
      </div>
    </form>
  );
}

export function RevenueOverviewPage() {
  const { data: revenues, isLoading: revenuesLoading } = useRevenue();
  const { data: comprehensive } = useComprehensiveSummary();
  const createMutation = useCreateRevenue();
  const updateMutation = useUpdateRevenue();
  const deleteMutation = useDeleteRevenue();

  const [showForm, setShowForm] = useState(false);
  const [editingRevenue, setEditingRevenue] = useState<Revenue | null>(null);

  // Calculate totals
  const totals = useMemo(() => {
    if (!revenues) return { gross: 0, commission: 0, net: 0 };
    return revenues.reduce(
      (acc, r) => ({
        gross: acc.gross + r.gross_revenue,
        commission: acc.commission + r.app_store_commission,
        net: acc.net + r.net_revenue,
      }),
      { gross: 0, commission: 0, net: 0 }
    );
  }, [revenues]);

  // Platform breakdown for pie chart
  const platformData = useMemo(() => {
    if (!revenues) return [];
    const byPlatform = revenues.reduce((acc, r) => {
      acc[r.platform] = (acc[r.platform] || 0) + r.net_revenue;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(byPlatform).map(([platform, value]) => ({
      name: platform.toUpperCase(),
      value,
      color: platformColors[platform as keyof typeof platformColors],
    }));
  }, [revenues]);

  // Monthly revenue for bar chart
  const monthlyData = useMemo(() => {
    if (!revenues) return [];
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), 5 - i);
      return format(startOfMonth(date), "yyyy-MM");
    });

    const byMonth = revenues.reduce((acc, r) => {
      const month = format(parseISO(r.date), "yyyy-MM");
      if (!acc[month]) acc[month] = { gross: 0, net: 0 };
      acc[month].gross += r.gross_revenue;
      acc[month].net += r.net_revenue;
      return acc;
    }, {} as Record<string, { gross: number; net: number }>);

    return last6Months.map((month) => ({
      month: format(parseISO(month + "-01"), "MMM"),
      gross: byMonth[month]?.gross || 0,
      net: byMonth[month]?.net || 0,
    }));
  }, [revenues]);

  const handleCreate = async (data: CreateRevenueInput) => {
    await createMutation.mutateAsync(data);
    setShowForm(false);
  };

  const handleUpdate = async (data: CreateRevenueInput) => {
    if (!editingRevenue) return;
    await updateMutation.mutateAsync({ id: editingRevenue.id, data });
    setEditingRevenue(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this revenue entry?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Revenue</h1>
          <p className="text-muted-foreground text-lg">Track your income streams</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="rounded-xl glow-orange"
          disabled={showForm || !!editingRevenue}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Revenue
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass rounded-2xl p-5 transition-smooth hover:shadow-[0_0_50px_rgba(var(--primary-rgb),0.3)]">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-500/20 text-green-500">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gross Revenue</p>
              {revenuesLoading ? (
                <Skeleton className="h-8 w-28 mt-1" />
              ) : (
                <p className="text-2xl font-bold">{formatCurrency(totals.gross)}</p>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5 transition-smooth hover:shadow-[0_0_50px_rgba(var(--primary-rgb),0.3)]">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-destructive/20 text-destructive">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">App Store Commission</p>
              {revenuesLoading ? (
                <Skeleton className="h-8 w-28 mt-1" />
              ) : (
                <p className="text-2xl font-bold">{formatCurrency(totals.commission)}</p>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5 transition-smooth hover:shadow-[0_0_50px_rgba(var(--primary-rgb),0.3)]">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary glow-orange text-primary-foreground">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Net Revenue</p>
              {revenuesLoading ? (
                <Skeleton className="h-8 w-28 mt-1" />
              ) : (
                <p className="text-2xl font-bold">{formatCurrency(totals.net)}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profit/Loss Card */}
      {comprehensive && (
        <div className={`glass rounded-2xl p-6 border-2 ${comprehensive.monthly_profit >= 0 ? 'border-green-500/30' : 'border-destructive/30'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Monthly Profit/Loss</p>
              <p className={`text-3xl font-bold ${comprehensive.monthly_profit >= 0 ? 'text-green-500' : 'text-destructive'}`}>
                {formatCurrency(comprehensive.monthly_profit)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Revenue per User</p>
              <p className="text-xl font-bold">{formatCurrency(comprehensive.revenue_per_active_user)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Revenue Bar Chart */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Monthly Revenue</h2>
              <p className="text-sm text-muted-foreground">Last 6 months</p>
            </div>
          </div>

          {revenuesLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                    }}
                    formatter={(value) => [`$${Number(value).toFixed(2)}`, ""]}
                  />
                  <Bar dataKey="gross" name="Gross" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="net" name="Net" fill="hsl(23, 87%, 55%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Platform Pie Chart */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Revenue by Platform</h2>
              <p className="text-sm text-muted-foreground">Distribution</p>
            </div>
          </div>

          {revenuesLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : platformData.length > 0 ? (
            <div className="h-64 flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <p>No revenue data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <RevenueForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
          isLoading={createMutation.isPending}
        />
      )}

      {editingRevenue && (
        <RevenueForm
          revenue={editingRevenue}
          onSubmit={handleUpdate}
          onCancel={() => setEditingRevenue(null)}
          isLoading={updateMutation.isPending}
        />
      )}

      {/* Revenue List */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4">Recent Entries</h2>
        <div className="space-y-3">
          {revenuesLoading ? (
            <>
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </>
          ) : revenues && revenues.length > 0 ? (
            revenues.slice(0, 10).map((revenue) => {
              const IconComponent = platformIcons[revenue.platform];
              return (
                <div
                  key={revenue.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-background/50 hover:bg-background/70 transition-smooth group"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${platformColors[revenue.platform]}20`, color: platformColors[revenue.platform] }}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {revenue.platform.toUpperCase()} - {revenue.revenue_type}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(parseISO(revenue.date), "MMM d, yyyy")}
                        {revenue.notes && ` • ${revenue.notes}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(revenue.net_revenue)}</p>
                      <p className="text-xs text-muted-foreground">
                        Gross: {formatCurrency(revenue.gross_revenue)}
                      </p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-lg h-8 w-8"
                        onClick={() => setEditingRevenue(revenue)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-lg h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(revenue.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No revenue entries yet</p>
              <Button onClick={() => setShowForm(true)} variant="link" className="text-primary mt-2">
                Add your first entry
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
