import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Instagram,
  Mail,
  DollarSign,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import {
  usePartners,
  useCreatePartner,
  useUpdatePartner,
  useDeletePartner,
} from "@/hooks/usePartners";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { Partner, CreatePartnerInput } from "@/api/types/partners";

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

interface PartnerFormProps {
  partner?: Partner;
  onSubmit: (data: CreatePartnerInput) => void;
  onCancel: () => void;
  isLoading: boolean;
}

function PartnerForm({ partner, onSubmit, onCancel, isLoading }: PartnerFormProps) {
  const [formData, setFormData] = useState<CreatePartnerInput>({
    name: partner?.name || "",
    email: partner?.email || "",
    referral_code: partner?.referral_code || "",
    partner_type: partner?.partner_type || "affiliate",
    commission_percent: partner?.commission_percent || 20,
    instagram_handle: partner?.instagram_handle || "",
    follower_count: partner?.follower_count || undefined,
    payout_method: partner?.payout_method || "revolut",
    notes: partner?.notes || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4">
      <h3 className="text-lg font-bold">{partner ? "Edit Partner" : "Add Partner"}</h3>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Name</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Partner name"
            className="rounded-xl"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="partner@example.com"
            className="rounded-xl"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Referral Code</label>
          <Input
            value={formData.referral_code}
            onChange={(e) => setFormData({ ...formData, referral_code: e.target.value.toUpperCase() })}
            placeholder="Leave empty to auto-generate"
            className="rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Commission %</label>
          <Input
            type="number"
            min="0"
            max="100"
            value={formData.commission_percent}
            onChange={(e) => setFormData({ ...formData, commission_percent: parseInt(e.target.value) || 0 })}
            className="rounded-xl"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Instagram Handle</label>
          <Input
            value={formData.instagram_handle}
            onChange={(e) => setFormData({ ...formData, instagram_handle: e.target.value.replace("@", "") })}
            placeholder="username (without @)"
            className="rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Follower Count</label>
          <Input
            type="number"
            value={formData.follower_count || ""}
            onChange={(e) => setFormData({ ...formData, follower_count: parseInt(e.target.value) || undefined })}
            placeholder="e.g., 50000"
            className="rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Partner Type</label>
          <select
            value={formData.partner_type}
            onChange={(e) => setFormData({ ...formData, partner_type: e.target.value as "affiliate" | "other" })}
            className="w-full h-10 px-3 rounded-xl bg-background border border-input"
          >
            <option value="affiliate">Affiliate</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Payout Method</label>
          <select
            value={formData.payout_method}
            onChange={(e) => setFormData({ ...formData, payout_method: e.target.value })}
            className="w-full h-10 px-3 rounded-xl bg-background border border-input"
          >
            <option value="revolut">Revolut</option>
            <option value="bank">Bank Transfer</option>
            <option value="paypal">PayPal</option>
          </select>
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
          {isLoading ? "Saving..." : partner ? "Update" : "Add Partner"}
        </Button>
      </div>
    </form>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded hover:bg-background/50 transition-colors"
      title="Copy to clipboard"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export function PartnersListPage() {
  const { data: partners, isLoading } = usePartners();
  const createMutation = useCreatePartner();
  const updateMutation = useUpdatePartner();
  const deleteMutation = useDeletePartner();

  const [showForm, setShowForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);

  // Summary stats
  const totalPartners = partners?.length || 0;
  const activePartners = partners?.filter((p) => p.status === "active").length || 0;
  const totalReferrals = partners?.reduce((sum, p) => sum + p.total_referrals, 0) || 0;
  const totalEarned = partners?.reduce((sum, p) => sum + p.total_earned, 0) || 0;
  const totalPaid = partners?.reduce((sum, p) => sum + p.total_paid, 0) || 0;

  const handleCreate = async (data: CreatePartnerInput) => {
    await createMutation.mutateAsync(data);
    setShowForm(false);
  };

  const handleUpdate = async (data: CreatePartnerInput) => {
    if (!editingPartner) return;
    await updateMutation.mutateAsync({ id: editingPartner.id, data });
    setEditingPartner(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this partner?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Partners</h1>
          <p className="text-muted-foreground text-lg">Manage your affiliate partners</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="rounded-xl glow-orange"
          disabled={showForm || !!editingPartner}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Partner
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/20 text-primary">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              {isLoading ? (
                <Skeleton className="h-7 w-12 mt-1" />
              ) : (
                <p className="text-xl font-bold">{totalPartners}</p>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-500/20 text-green-500">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              {isLoading ? (
                <Skeleton className="h-7 w-12 mt-1" />
              ) : (
                <p className="text-xl font-bold">{activePartners}</p>
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
              <p className="text-sm text-muted-foreground">Referrals</p>
              {isLoading ? (
                <Skeleton className="h-7 w-16 mt-1" />
              ) : (
                <p className="text-xl font-bold">{totalReferrals}</p>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-yellow-500/20 text-yellow-500">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Earned</p>
              {isLoading ? (
                <Skeleton className="h-7 w-20 mt-1" />
              ) : (
                <p className="text-xl font-bold">{formatCurrency(totalEarned)}</p>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-destructive/20 text-destructive">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Paid Out</p>
              {isLoading ? (
                <Skeleton className="h-7 w-20 mt-1" />
              ) : (
                <p className="text-xl font-bold">{formatCurrency(totalPaid)}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <PartnerForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
          isLoading={createMutation.isPending}
        />
      )}

      {editingPartner && (
        <PartnerForm
          partner={editingPartner}
          onSubmit={handleUpdate}
          onCancel={() => setEditingPartner(null)}
          isLoading={updateMutation.isPending}
        />
      )}

      {/* Partners List */}
      <div className="space-y-4">
        {isLoading ? (
          <>
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </>
        ) : partners && partners.length > 0 ? (
          partners.map((partner) => (
            <div
              key={partner.id}
              className="glass rounded-2xl p-5 transition-smooth hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)] group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg">{partner.name}</h3>
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
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        {partner.email}
                      </span>
                      {partner.instagram_handle && (
                        <a
                          href={`https://instagram.com/${partner.instagram_handle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-primary transition-colors"
                        >
                          <Instagram className="w-3.5 h-3.5" />
                          @{partner.instagram_handle}
                          {partner.follower_count && (
                            <span className="text-xs">({formatNumber(partner.follower_count)})</span>
                          )}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <code className="px-2 py-1 bg-background/50 rounded-lg text-sm font-mono">
                        {partner.referral_code}
                      </code>
                      <CopyButton text={partner.referral_code} />
                      <span className="text-xs text-muted-foreground">
                        {partner.commission_percent}% commission
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="text-right">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Referrals</p>
                        <p className="font-bold">{partner.total_referrals}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Earned</p>
                        <p className="font-bold text-green-500">{formatCurrency(partner.total_earned)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Paid</p>
                        <p className="font-bold">{formatCurrency(partner.total_paid)}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Balance: {formatCurrency(partner.total_earned - partner.total_paid)}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link to={`/partners/${partner.id}`}>
                      <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-xl h-8 w-8"
                      onClick={() => setEditingPartner(partner)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-xl h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(partner.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="glass rounded-2xl p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-bold mb-2">No partners yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your first affiliate partner to start tracking referrals
            </p>
            <Button onClick={() => setShowForm(true)} className="rounded-xl glow-orange">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Partner
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
