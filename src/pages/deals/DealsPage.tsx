import { useState, useMemo } from "react";
import {
  Building2,
  Plus,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  ArrowRight,
  X,
  ChevronRight,
  Target,
  Users,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useDeals, useCreateDeal, useUpdateDeal, useAdvanceDealStage, useDeleteDeal, useDealStats } from "@/hooks/useDeals";
import { usePartners } from "@/hooks/usePartners";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import type { EnterpriseDeal, DealStage, EnterpriseTier } from "@/api/types/partners";
import { DEAL_STAGES, ENTERPRISE_TIERS } from "@/api/types/partners";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function DealsPage() {
  const { data: deals, isLoading: dealsLoading } = useDeals();
  const { data: stats, isLoading: statsLoading } = useDealStats();
  const { data: partners } = usePartners();
  const createDealMutation = useCreateDeal();
  const updateDealMutation = useUpdateDeal();
  const advanceStageMutation = useAdvanceDealStage();
  const deleteDealMutation = useDeleteDeal();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<EnterpriseDeal | null>(null);

  const isLoading = dealsLoading || statsLoading;

  // Enterprise partners (those who can sell enterprise)
  const enterprisePartners = useMemo(() => {
    return partners?.filter(p => p.products?.includes("enterprise")) || [];
  }, [partners]);

  // Group deals by stage for pipeline view
  const dealsByStage = useMemo((): Partial<Record<DealStage, EnterpriseDeal[]>> => {
    if (!deals) return {};
    return deals.reduce<Partial<Record<DealStage, EnterpriseDeal[]>>>((acc, deal) => {
      if (!acc[deal.stage]) acc[deal.stage] = [];
      acc[deal.stage]!.push(deal);
      return acc;
    }, {});
  }, [deals]);

  // Active pipeline stages (excluding closed)
  const pipelineStages: DealStage[] = ["lead", "contacted", "demo_scheduled", "demo_done", "proposal_sent", "negotiation"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Enterprise Deals</h1>
          <p className="text-muted-foreground text-lg">B2B sales pipeline for Prometheus Enterprise</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="rounded-xl glow-orange"
          disabled={enterprisePartners.length === 0}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Deal
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/20 text-primary">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Open Deals</p>
              {isLoading ? (
                <Skeleton className="h-7 w-12 mt-1" />
              ) : (
                <p className="text-xl font-bold">{stats?.open_deals || 0}</p>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/20 text-blue-500">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pipeline Value</p>
              {isLoading ? (
                <Skeleton className="h-7 w-20 mt-1" />
              ) : (
                <p className="text-xl font-bold">{formatCurrency(stats?.total_pipeline_value || 0)}</p>
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
              <p className="text-sm text-muted-foreground">Won</p>
              {isLoading ? (
                <Skeleton className="h-7 w-12 mt-1" />
              ) : (
                <p className="text-xl font-bold">{stats?.won_deals || 0}</p>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-yellow-500/20 text-yellow-500">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Conversion</p>
              {isLoading ? (
                <Skeleton className="h-7 w-16 mt-1" />
              ) : (
                <p className="text-xl font-bold">{(stats?.conversion_rate || 0).toFixed(0)}%</p>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-500/20 text-purple-500">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Won Value</p>
              {isLoading ? (
                <Skeleton className="h-7 w-20 mt-1" />
              ) : (
                <p className="text-xl font-bold">{formatCurrency(stats?.total_won_value || 0)}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {pipelineStages.map((stage) => {
            const config = DEAL_STAGES[stage];
            const stageDeals = dealsByStage[stage] || [];

            return (
              <div key={stage} className="w-72 flex-shrink-0">
                {/* Stage Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full", config.bg.replace("/20", ""))} />
                    <span className="font-medium text-sm">{config.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground bg-card px-2 py-0.5 rounded-full">
                    {stageDeals.length}
                  </span>
                </div>

                {/* Deal Cards */}
                <div className="space-y-3">
                  {isLoading ? (
                    <>
                      <Skeleton className="h-32 rounded-xl" />
                      <Skeleton className="h-32 rounded-xl" />
                    </>
                  ) : stageDeals.length > 0 ? (
                    stageDeals.map((deal) => (
                      <div
                        key={deal.id}
                        className="glass rounded-xl p-4 cursor-pointer hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)] transition-all"
                        onClick={() => setSelectedDeal(deal)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-sm">{deal.company_name}</h4>
                            <p className="text-xs text-muted-foreground">{deal.contact_name}</p>
                          </div>
                          <span className={cn(
                            "px-2 py-0.5 rounded text-xs font-medium",
                            ENTERPRISE_TIERS[deal.tier].monthlyPrice >= 399
                              ? "bg-purple-500/20 text-purple-500"
                              : ENTERPRISE_TIERS[deal.tier].monthlyPrice >= 249
                              ? "bg-blue-500/20 text-blue-500"
                              : "bg-gray-500/20 text-gray-400"
                          )}>
                            {ENTERPRISE_TIERS[deal.tier].label}
                          </span>
                        </div>

                        <div className="text-lg font-bold text-primary mb-2">
                          {formatCurrency(deal.deal_value)}
                          <span className="text-xs text-muted-foreground font-normal ml-1">
                            /{deal.billing_cycle === "yearly" ? "yr" : "mo"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          {deal.creator_name && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {deal.creator_name}
                            </span>
                          )}
                          {deal.expected_close_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(parseISO(deal.expected_close_date), "MMM d")}
                            </span>
                          )}
                        </div>

                        {/* Quick advance button */}
                        {stage !== "negotiation" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full mt-2 h-7 text-xs rounded-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              advanceStageMutation.mutate(deal.id);
                            }}
                          >
                            Move to Next Stage
                            <ChevronRight className="w-3 h-3 ml-1" />
                          </Button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="glass rounded-xl p-4 text-center text-muted-foreground text-sm">
                      No deals
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Closed Columns */}
          <div className="w-72 flex-shrink-0">
            <div className="flex items-center gap-2 mb-3 px-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="font-medium text-sm">Closed Won</span>
              <span className="text-xs text-muted-foreground bg-card px-2 py-0.5 rounded-full ml-auto">
                {dealsByStage["closed_won"]?.length || 0}
              </span>
            </div>
            <div className="space-y-3">
              {(dealsByStage["closed_won"] || []).slice(0, 3).map((deal) => (
                <div key={deal.id} className="glass rounded-xl p-4 border border-green-500/30">
                  <h4 className="font-semibold text-sm">{deal.company_name}</h4>
                  <p className="text-lg font-bold text-green-500">{formatCurrency(deal.deal_value)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="w-72 flex-shrink-0">
            <div className="flex items-center gap-2 mb-3 px-1">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="font-medium text-sm">Closed Lost</span>
              <span className="text-xs text-muted-foreground bg-card px-2 py-0.5 rounded-full ml-auto">
                {dealsByStage["closed_lost"]?.length || 0}
              </span>
            </div>
            <div className="space-y-3">
              {(dealsByStage["closed_lost"] || []).slice(0, 3).map((deal) => (
                <div key={deal.id} className="glass rounded-xl p-4 border border-red-500/30 opacity-60">
                  <h4 className="font-semibold text-sm">{deal.company_name}</h4>
                  <p className="text-xs text-muted-foreground">{deal.loss_reason || "No reason"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Create Deal Modal */}
      {showCreateModal && (
        <CreateDealModal
          partners={enterprisePartners}
          onClose={() => setShowCreateModal(false)}
          onCreate={async (data) => {
            await createDealMutation.mutateAsync(data);
            setShowCreateModal(false);
          }}
          isLoading={createDealMutation.isPending}
        />
      )}

      {/* Deal Detail Modal */}
      {selectedDeal && (
        <DealDetailModal
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
          onUpdate={async (input) => {
            await updateDealMutation.mutateAsync({ dealId: selectedDeal.id, input });
          }}
          onDelete={async () => {
            await deleteDealMutation.mutateAsync(selectedDeal.id);
            setSelectedDeal(null);
          }}
          onAdvance={async () => {
            await advanceStageMutation.mutateAsync(selectedDeal.id);
          }}
          isUpdating={updateDealMutation.isPending}
        />
      )}

      {/* Empty State */}
      {!isLoading && (!deals || deals.length === 0) && (
        <div className="glass rounded-2xl p-12 text-center">
          <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-xl font-bold mb-2">No enterprise deals yet</h3>
          <p className="text-muted-foreground mb-4">
            {enterprisePartners.length === 0
              ? "First, assign Enterprise product to a partner"
              : "Start tracking B2B sales opportunities"}
          </p>
          {enterprisePartners.length > 0 && (
            <Button onClick={() => setShowCreateModal(true)} className="rounded-xl glow-orange">
              <Plus className="w-4 h-4 mr-2" />
              Create First Deal
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Create Deal Modal Component
function CreateDealModal({
  partners,
  onClose,
  onCreate,
  isLoading,
}: {
  partners: Array<{ id: string; name: string }>;
  onClose: () => void;
  onCreate: (data: {
    creator_id: string;
    company_name: string;
    contact_name: string;
    contact_email: string;
    contact_phone?: string;
    company_type?: string;
    location?: string;
    tier: EnterpriseTier;
    billing_cycle: "monthly" | "yearly";
    expected_close_date?: string;
    notes?: string;
  }) => Promise<void>;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    creator_id: partners[0]?.id || "",
    company_name: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    company_type: "",
    location: "",
    tier: "basic_gym" as EnterpriseTier,
    billing_cycle: "monthly" as "monthly" | "yearly",
    expected_close_date: "",
    notes: "",
  });

  const selectedTier = ENTERPRISE_TIERS[formData.tier];
  const dealValue = formData.billing_cycle === "monthly"
    ? selectedTier.monthlyPrice
    : selectedTier.yearlyPrice;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-bold">New Enterprise Deal</h3>
          <Button variant="ghost" size="icon" className="rounded-xl" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await onCreate(formData);
          }}
          className="p-4 space-y-4"
        >
          {/* Partner */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Sales Partner</label>
            <select
              value={formData.creator_id}
              onChange={(e) => setFormData({ ...formData, creator_id: e.target.value })}
              className="w-full h-10 px-3 rounded-xl bg-background border border-input"
              required
            >
              {partners.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Company Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Company Name</label>
              <Input
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="Fitness Studio XYZ"
                className="rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Company Type</label>
              <select
                value={formData.company_type}
                onChange={(e) => setFormData({ ...formData, company_type: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-background border border-input"
              >
                <option value="">Select type...</option>
                <option value="gym">Gym / Fitness Studio</option>
                <option value="physio">Physiotherapy Practice</option>
                <option value="therapy">Therapy Center</option>
                <option value="sports_club">Sports Club</option>
                <option value="yoga">Yoga / Pilates Studio</option>
                <option value="martial_arts">Martial Arts School</option>
                <option value="dance">Dance Studio</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Contact Name</label>
              <Input
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                placeholder="John Smith"
                className="rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contact Email</label>
              <Input
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                placeholder="john@studio.com"
                className="rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                placeholder="+1 234 567 890"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="City, Country"
                className="rounded-xl"
              />
            </div>
          </div>

          {/* Tier Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Enterprise Tier</label>
            <div className="grid gap-2 md:grid-cols-3">
              {(Object.keys(ENTERPRISE_TIERS) as EnterpriseTier[]).map((tier) => {
                const config = ENTERPRISE_TIERS[tier];
                return (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setFormData({ ...formData, tier })}
                    className={cn(
                      "p-3 rounded-xl border-2 text-left transition-colors",
                      formData.tier === tier
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-primary/50"
                    )}
                  >
                    <p className="font-medium text-sm">{config.label}</p>
                    <p className="text-lg font-bold">${config.monthlyPrice}/mo</p>
                    <p className="text-xs text-muted-foreground">≤{config.maxTrainers} trainers</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Billing Cycle */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Billing Cycle</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, billing_cycle: "monthly" })}
                className={cn(
                  "flex-1 py-2 rounded-xl border-2 font-medium transition-colors",
                  formData.billing_cycle === "monthly"
                    ? "border-primary bg-primary/5"
                    : "border-muted"
                )}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, billing_cycle: "yearly" })}
                className={cn(
                  "flex-1 py-2 rounded-xl border-2 font-medium transition-colors",
                  formData.billing_cycle === "yearly"
                    ? "border-primary bg-primary/5"
                    : "border-muted"
                )}
              >
                Yearly (Save 17%)
              </button>
            </div>
          </div>

          {/* Deal Value Preview */}
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
            <p className="text-sm text-muted-foreground">Deal Value</p>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(dealValue)}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                /{formData.billing_cycle === "yearly" ? "year" : "month"}
              </span>
            </p>
          </div>

          {/* Expected Close Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Expected Close Date</label>
            <Input
              type="date"
              value={formData.expected_close_date}
              onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
              className="rounded-xl"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <Input
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              className="rounded-xl"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="rounded-xl glow-orange">
              {isLoading ? "Creating..." : "Create Deal"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Deal Detail Modal Component
function DealDetailModal({
  deal,
  onClose,
  onUpdate,
  onDelete,
  onAdvance,
  isUpdating,
}: {
  deal: EnterpriseDeal;
  onClose: () => void;
  onUpdate: (input: { stage?: DealStage; notes?: string; loss_reason?: string }) => Promise<void>;
  onDelete: () => Promise<void>;
  onAdvance: () => Promise<void>;
  isUpdating: boolean;
}) {
  const config = DEAL_STAGES[deal.stage];
  const tierConfig = ENTERPRISE_TIERS[deal.tier];
  const isOpen = !["closed_won", "closed_lost"].includes(deal.stage);

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="text-lg font-bold">{deal.company_name}</h3>
            <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", config.bg, config.color)}>
              {config.label}
            </span>
          </div>
          <Button variant="ghost" size="icon" className="rounded-xl" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          {/* Contact Info */}
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-muted-foreground" />
              {deal.contact_name}
            </p>
            <p className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              {deal.contact_email}
            </p>
            {deal.contact_phone && (
              <p className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                {deal.contact_phone}
              </p>
            )}
            {deal.location && (
              <p className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                {deal.location}
              </p>
            )}
          </div>

          {/* Deal Value */}
          <div className="p-4 rounded-xl bg-primary/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{tierConfig.label}</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(deal.deal_value)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Commission (20%)</p>
                <p className="text-lg font-bold text-green-500">{formatCurrency(deal.commission_amount)}</p>
              </div>
            </div>
          </div>

          {/* Stage Actions */}
          {isOpen && (
            <div className="flex gap-2">
              <Button
                onClick={() => onAdvance()}
                disabled={isUpdating || deal.stage === "negotiation"}
                className="flex-1 rounded-xl"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Advance Stage
              </Button>
              <Button
                variant="outline"
                onClick={() => onUpdate({ stage: "closed_won" })}
                disabled={isUpdating}
                className="rounded-xl text-green-500 hover:text-green-500"
              >
                <CheckCircle className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const reason = prompt("Loss reason?");
                  if (reason) onUpdate({ stage: "closed_lost", loss_reason: reason });
                }}
                disabled={isUpdating}
                className="rounded-xl text-red-500 hover:text-red-500"
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Notes */}
          {deal.notes && (
            <div className="p-3 rounded-xl bg-muted/30">
              <p className="text-sm text-muted-foreground">{deal.notes}</p>
            </div>
          )}

          {/* Dates */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Created: {format(parseISO(deal.created_at), "MMM d, yyyy")}</p>
            {deal.closed_at && <p>Closed: {format(parseISO(deal.closed_at), "MMM d, yyyy")}</p>}
          </div>

          {/* Delete */}
          <Button
            variant="ghost"
            onClick={() => {
              if (confirm("Delete this deal?")) onDelete();
            }}
            className="w-full text-destructive hover:text-destructive rounded-xl"
          >
            Delete Deal
          </Button>
        </div>
      </div>
    </div>
  );
}
