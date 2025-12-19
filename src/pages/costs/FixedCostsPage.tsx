import { useState } from "react";
import { Plus, Pencil, Trash2, Building2, Server, CreditCard } from "lucide-react";
import { useFixedCosts, useCreateFixedCost, useUpdateFixedCost, useDeleteFixedCost } from "@/hooks/useCosts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { FixedCost, CreateFixedCostInput } from "@/api/types/costs";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

const categoryIcons: Record<string, typeof Building2> = {
  infrastructure: Server,
  office: Building2,
  subscription: CreditCard,
};

const categoryColors: Record<string, string> = {
  infrastructure: "bg-blue-500/20 text-blue-500",
  office: "bg-green-500/20 text-green-500",
  subscription: "bg-purple-500/20 text-purple-500",
};

interface CostFormProps {
  cost?: FixedCost;
  onSubmit: (data: CreateFixedCostInput) => void;
  onCancel: () => void;
  isLoading: boolean;
}

function CostForm({ cost, onSubmit, onCancel, isLoading }: CostFormProps) {
  const [formData, setFormData] = useState<CreateFixedCostInput>({
    name: cost?.name || "",
    category: cost?.category || "subscription",
    amount: cost?.amount || 0,
    recurrence_type: cost?.recurrence_type || "monthly",
    description: cost?.description || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4">
      <h3 className="text-lg font-bold">{cost ? "Edit Fixed Cost" : "Add Fixed Cost"}</h3>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Name</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Supabase Pro"
            className="rounded-xl"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full h-10 px-3 rounded-xl bg-background border border-input"
          >
            <option value="subscription">Subscription</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="office">Office</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Amount ($)</label>
          <Input
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            placeholder="0.00"
            className="rounded-xl"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Recurrence</label>
          <select
            value={formData.recurrence_type}
            onChange={(e) => setFormData({ ...formData, recurrence_type: e.target.value as "monthly" | "yearly" | "one_time" })}
            className="w-full h-10 px-3 rounded-xl bg-background border border-input"
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="one_time">One-time</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description (optional)</label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Add a description..."
          className="rounded-xl"
        />
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="ghost" onClick={onCancel} className="rounded-xl">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="rounded-xl glow-orange">
          {isLoading ? "Saving..." : cost ? "Update" : "Add Cost"}
        </Button>
      </div>
    </form>
  );
}

export function FixedCostsPage() {
  const { data: fixedCosts, isLoading } = useFixedCosts();
  const createMutation = useCreateFixedCost();
  const updateMutation = useUpdateFixedCost();
  const deleteMutation = useDeleteFixedCost();

  const [showForm, setShowForm] = useState(false);
  const [editingCost, setEditingCost] = useState<FixedCost | null>(null);

  const totalMonthly = fixedCosts?.reduce((sum, cost) => sum + cost.monthly_equivalent, 0) || 0;

  const handleCreate = async (data: CreateFixedCostInput) => {
    await createMutation.mutateAsync(data);
    setShowForm(false);
  };

  const handleUpdate = async (data: CreateFixedCostInput) => {
    if (!editingCost) return;
    await updateMutation.mutateAsync({ id: editingCost.id, data });
    setEditingCost(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this cost?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Fixed Costs</h1>
          <p className="text-muted-foreground text-lg">
            Manage your recurring expenses
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="rounded-xl glow-orange"
          disabled={showForm || !!editingCost}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Cost
        </Button>
      </div>

      {/* Total Summary */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center glow-orange">
            <CreditCard className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Monthly Fixed Costs</p>
            {isLoading ? (
              <Skeleton className="h-9 w-32 mt-1" />
            ) : (
              <p className="text-3xl font-bold">{formatCurrency(totalMonthly)}</p>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <CostForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
          isLoading={createMutation.isPending}
        />
      )}

      {editingCost && (
        <CostForm
          cost={editingCost}
          onSubmit={handleUpdate}
          onCancel={() => setEditingCost(null)}
          isLoading={updateMutation.isPending}
        />
      )}

      {/* Costs List */}
      <div className="space-y-4">
        {isLoading ? (
          <>
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </>
        ) : fixedCosts && fixedCosts.length > 0 ? (
          fixedCosts.map((cost) => {
            const IconComponent = categoryIcons[cost.category] || CreditCard;
            const colorClass = categoryColors[cost.category] || "bg-primary/20 text-primary";

            return (
              <div
                key={cost.id}
                className="glass rounded-2xl p-5 transition-smooth hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)] group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{cost.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="capitalize">{cost.category}</span>
                        <span>•</span>
                        <span className="capitalize">{cost.recurrence_type.replace("_", " ")}</span>
                        {cost.description && (
                          <>
                            <span>•</span>
                            <span>{cost.description}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold">{formatCurrency(cost.amount)}</p>
                      {cost.recurrence_type !== "monthly" && (
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(cost.monthly_equivalent)}/mo
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl"
                        onClick={() => setEditingCost(cost)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl text-destructive hover:text-destructive"
                        onClick={() => handleDelete(cost.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="glass rounded-2xl p-12 text-center">
            <CreditCard className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-bold mb-2">No fixed costs yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your recurring expenses to track your total monthly costs
            </p>
            <Button onClick={() => setShowForm(true)} className="rounded-xl glow-orange">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Cost
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
