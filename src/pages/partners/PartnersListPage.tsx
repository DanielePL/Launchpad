import { useState, useMemo } from "react";
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
  AlertTriangle,
  TrendingUp,
  Clock,
  Trophy,
  Flame,
  Sparkles,
  CheckCircle,
  XCircle,
  FileText,
  UserCircle,
  Video,
  Smartphone,
  GraduationCap,
  Building2,
} from "lucide-react";
import {
  usePartners,
  useCreatePartner,
  useUpdatePartner,
  useDeletePartner,
} from "@/hooks/usePartners";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { Partner, CreatePartnerInput, CreatorType, ProductType, ProductCommission } from "@/api/types/partners";
import { PRODUCT_LABELS, DEFAULT_COMMISSIONS } from "@/api/types/partners";
import { INFLUENCER_CATEGORIES, TEAM_MEMBERS, type InfluencerCategory, type TeamMember } from "@/api/types/influencers";
import { cn } from "@/lib/utils";

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
  existingCodes: string[];
  onSubmit: (data: CreatePartnerInput) => void;
  onCancel: () => void;
  isLoading: boolean;
  defaultCreatorType?: CreatorType;
}

// Clean string for referral code (uppercase, alphanumeric + underscore only)
function cleanCode(str: string): string {
  return str.toUpperCase().replace(/[^A-Z0-9_]/g, "");
}

// Generate code suggestions based on available data
function generateCodeSuggestions(
  name: string,
  instagram: string,
  commission: number,
  existingCodes: string[]
): string[] {
  const suggestions: string[] = [];
  const takenSet = new Set(existingCodes.map((c) => c.toUpperCase()));

  // Try Instagram handle first (most unique)
  if (instagram) {
    const igCode = cleanCode(instagram);
    if (igCode && !takenSet.has(igCode)) {
      suggestions.push(igCode);
    }
  }

  // Try name-based codes
  if (name) {
    const baseName = cleanCode(name.split(" ")[0]); // First name/word only

    // NAME + commission (e.g., DANIEL20)
    const nameCommission = `${baseName}${commission}`;
    if (!takenSet.has(nameCommission)) {
      suggestions.push(nameCommission);
    }

    // Just NAME
    if (!takenSet.has(baseName)) {
      suggestions.push(baseName);
    }

    // NAME + random 3 digits
    for (let i = 0; i < 3; i++) {
      const randomNum = Math.floor(Math.random() * 900) + 100;
      const nameRandom = `${baseName}${randomNum}`;
      if (!takenSet.has(nameRandom) && !suggestions.includes(nameRandom)) {
        suggestions.push(nameRandom);
        break;
      }
    }

    // NAME_FIT, NAME_PRO variations
    const suffixes = ["FIT", "PRO", "VIP", "TEAM"];
    for (const suffix of suffixes) {
      const nameSuffix = `${baseName}_${suffix}`;
      if (!takenSet.has(nameSuffix) && !suggestions.includes(nameSuffix)) {
        suggestions.push(nameSuffix);
        break;
      }
    }
  }

  return suggestions.slice(0, 4); // Return max 4 suggestions
}

// Product icons
const PRODUCT_ICONS: Record<ProductType, React.ComponentType<{ className?: string }>> = {
  app: Smartphone,
  coach: GraduationCap,
  enterprise: Building2,
};

function PartnerForm({ partner, existingCodes, onSubmit, onCancel, isLoading, defaultCreatorType = "partner" }: PartnerFormProps) {
  // Initialize product commissions
  const initProductCommissions = (): ProductCommission[] => {
    if (partner?.product_commissions) return partner.product_commissions;
    return (Object.keys(PRODUCT_LABELS) as ProductType[]).map(product => ({
      product,
      commission_percent: DEFAULT_COMMISSIONS[product],
      enabled: partner?.products?.includes(product) || false,
    }));
  };

  const [formData, setFormData] = useState<CreatePartnerInput>({
    name: partner?.name || "",
    email: partner?.email || "",
    referral_code: partner?.referral_code || "",
    partner_type: partner?.partner_type || "affiliate",
    commission_percent: partner?.commission_percent || 20,
    instagram_handle: partner?.instagram_handle || "",
    follower_count: partner?.follower_count || undefined,
    payout_method: partner?.payout_method || "",
    notes: partner?.notes || "",
    // Creator type & influencer fields
    creator_type: partner?.creator_type || defaultCreatorType,
    tiktok_handle: partner?.tiktok_handle || "",
    youtube_handle: partner?.youtube_handle || "",
    engagement_rate: partner?.engagement_rate || undefined,
    category: partner?.category || undefined,
    contact_person: partner?.contact_person || undefined,
    // Products
    products: partner?.products || [],
    product_commissions: initProductCommissions(),
  });

  const isInfluencer = formData.creator_type === "influencer";

  // Check if current code is available
  const codeStatus = useMemo(() => {
    const code = (formData.referral_code || "").toUpperCase();
    if (!code) return "empty";
    // When editing, allow keeping the same code
    if (partner?.referral_code?.toUpperCase() === code) return "available";
    return existingCodes.some((c) => c.toUpperCase() === code) ? "taken" : "available";
  }, [formData.referral_code, existingCodes, partner?.referral_code]);

  // Generate suggestions
  const suggestions = useMemo(() => {
    return generateCodeSuggestions(
      formData.name,
      formData.instagram_handle || "",
      formData.commission_percent || 20,
      existingCodes
    );
  }, [formData.name, formData.instagram_handle, formData.commission_percent, existingCodes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (codeStatus === "taken") {
      alert("Referral code is already taken. Please choose a different one.");
      return;
    }
    onSubmit(formData);
  };

  const handleGenerate = () => {
    if (suggestions.length > 0) {
      setFormData({ ...formData, referral_code: suggestions[0] });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">
          {partner ? "Edit" : "Add"} {isInfluencer ? "Influencer" : "Partner"}
        </h3>
        {!partner && (
          <div className="flex rounded-xl bg-background/50 p-1">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, creator_type: "partner" })}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors",
                formData.creator_type === "partner"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Partner
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, creator_type: "influencer" })}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors",
                formData.creator_type === "influencer"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Influencer
            </button>
          </div>
        )}
      </div>

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
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                value={formData.referral_code}
                onChange={(e) => setFormData({ ...formData, referral_code: cleanCode(e.target.value) })}
                placeholder="e.g., FITNESSJULIA"
                className={`rounded-xl pr-10 ${
                  codeStatus === "taken"
                    ? "border-destructive focus-visible:ring-destructive"
                    : codeStatus === "available"
                    ? "border-green-500 focus-visible:ring-green-500"
                    : ""
                }`}
              />
              {formData.referral_code && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {codeStatus === "available" ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-destructive" />
                  )}
                </div>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleGenerate}
              className="rounded-xl shrink-0"
              disabled={suggestions.length === 0}
            >
              <Sparkles className="w-4 h-4" />
            </Button>
          </div>
          {codeStatus === "taken" && suggestions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              <span className="text-xs text-muted-foreground">Vorschläge:</span>
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setFormData({ ...formData, referral_code: suggestion })}
                  className="px-2 py-0.5 text-xs rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
          {codeStatus === "empty" && suggestions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              <span className="text-xs text-muted-foreground">Klicke auf ✨ oder wähle:</span>
              {suggestions.slice(0, 3).map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setFormData({ ...formData, referral_code: suggestion })}
                  className="px-2 py-0.5 text-xs rounded-md bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
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
            <option value="">Select payout method</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="paypal">PayPal</option>
            <option value="crypto">Crypto</option>
          </select>
        </div>
      </div>

      {/* Product Authorization */}
      <div className="space-y-3 pt-2">
        <label className="text-sm font-medium">Products & Commissions</label>
        <p className="text-xs text-muted-foreground">Select which products this creator can sell</p>
        <div className="grid gap-3 md:grid-cols-3">
          {(Object.keys(PRODUCT_LABELS) as ProductType[]).map((product) => {
            const Icon = PRODUCT_ICONS[product];
            const productCommission = formData.product_commissions?.find(p => p.product === product);
            const isEnabled = productCommission?.enabled || false;

            return (
              <div
                key={product}
                className={cn(
                  "rounded-xl border-2 p-4 transition-colors cursor-pointer",
                  isEnabled
                    ? "border-primary bg-primary/5"
                    : "border-muted hover:border-primary/50"
                )}
                onClick={() => {
                  const newCommissions = formData.product_commissions?.map(p =>
                    p.product === product ? { ...p, enabled: !p.enabled } : p
                  ) || [];
                  const newProducts = newCommissions.filter(p => p.enabled).map(p => p.product);
                  setFormData({
                    ...formData,
                    products: newProducts,
                    product_commissions: newCommissions,
                  });
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    isEnabled ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{PRODUCT_LABELS[product]}</p>
                    <p className="text-xs text-muted-foreground">
                      {product === "app" && "B2C Subscriptions"}
                      {product === "coach" && "Coaching Software"}
                      {product === "enterprise" && "B2B $149-399/mo"}
                    </p>
                  </div>
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                    isEnabled ? "border-primary bg-primary" : "border-muted"
                  )}>
                    {isEnabled && <Check className="w-3 h-3 text-primary-foreground" />}
                  </div>
                </div>

                {isEnabled && (
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <span className="text-xs text-muted-foreground">Commission:</span>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={productCommission?.commission_percent || DEFAULT_COMMISSIONS[product]}
                      onChange={(e) => {
                        const newCommissions = formData.product_commissions?.map(p =>
                          p.product === product
                            ? { ...p, commission_percent: parseInt(e.target.value) || 0 }
                            : p
                        ) || [];
                        setFormData({ ...formData, product_commissions: newCommissions });
                      }}
                      className="h-7 w-16 text-xs rounded-lg"
                    />
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Influencer-specific fields */}
        {isInfluencer && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">TikTok Handle</label>
              <Input
                value={formData.tiktok_handle}
                onChange={(e) => setFormData({ ...formData, tiktok_handle: e.target.value.replace("@", "") })}
                placeholder="username (without @)"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">YouTube Handle</label>
              <Input
                value={formData.youtube_handle}
                onChange={(e) => setFormData({ ...formData, youtube_handle: e.target.value.replace("@", "") })}
                placeholder="channel name"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Engagement Rate %</label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.engagement_rate || ""}
                onChange={(e) => setFormData({ ...formData, engagement_rate: parseFloat(e.target.value) || undefined })}
                placeholder="e.g., 3.5"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <select
                value={formData.category || ""}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as InfluencerCategory || undefined })}
                className="w-full h-10 px-3 rounded-xl bg-background border border-input"
              >
                <option value="">Select category</option>
                {INFLUENCER_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Contact Person</label>
              <select
                value={formData.contact_person || ""}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value as TeamMember || undefined })}
                className="w-full h-10 px-3 rounded-xl bg-background border border-input"
              >
                <option value="">Select contact</option>
                {TEAM_MEMBERS.map((member) => (
                  <option key={member} value={member}>
                    {member}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
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

type TabFilter = "all" | "partner" | "influencer";

export function PartnersListPage() {
  const { data: partners, isLoading } = usePartners();
  const createMutation = useCreatePartner();
  const updateMutation = useUpdatePartner();
  const deleteMutation = useDeletePartner();
  const { hasPermission, isSuperAdmin, user } = useAuth();

  const canCreatePartners = hasPermission("partners:create");

  const [showForm, setShowForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [activeTab, setActiveTab] = useState<TabFilter>("all");

  // Filter partners based on active tab
  const filteredPartners = useMemo(() => {
    if (!partners) return [];
    if (activeTab === "all") return partners;
    return partners.filter((p) => p.creator_type === activeTab);
  }, [partners, activeTab]);

  // Count by type
  const partnerCount = partners?.filter((p) => p.creator_type === "partner").length || 0;
  const influencerCount = partners?.filter((p) => p.creator_type === "influencer").length || 0;

  // Summary stats
  const totalPartners = partners?.length || 0;
  const activePartners = partners?.filter((p) => p.status === "active").length || 0;
  const totalReferrals = partners?.reduce((sum, p) => sum + p.total_referrals, 0) || 0;
  const totalEarned = partners?.reduce((sum, p) => sum + p.total_earned, 0) || 0;
  const totalPaid = partners?.reduce((sum, p) => sum + p.total_paid, 0) || 0;

  // Existing referral codes for duplicate checking
  const existingCodes = useMemo(() =>
    partners?.map((p) => p.referral_code).filter(Boolean) || [],
    [partners]
  );

  // Partner monitoring - calculate days since last referral
  const getDaysSinceLastReferral = (lastReferralAt?: string) => {
    if (!lastReferralAt) return Infinity;
    const lastDate = new Date(lastReferralAt);
    const now = new Date();
    return Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Needs Attention: Active partners with 0 referrals this month OR no referral in 14+ days
  const needsAttention = partners?.filter((p) => {
    if (p.status !== "active") return false;
    const daysSince = getDaysSinceLastReferral(p.last_referral_at);
    return (p.referrals_this_month === 0) || daysSince >= 14;
  }).sort((a, b) => {
    // Sort by days since last referral (most inactive first)
    return getDaysSinceLastReferral(b.last_referral_at) - getDaysSinceLastReferral(a.last_referral_at);
  }) || [];

  // Partner Wins: Partners with referrals this month
  const partnerWins = partners?.filter((p) => {
    return (p.referrals_this_month || 0) > 0;
  }).sort((a, b) => {
    // Sort by referrals this month (most active first)
    return (b.referrals_this_month || 0) - (a.referrals_this_month || 0);
  }) || [];

  const handleCreate = async (data: CreatePartnerInput) => {
    // Clean up empty strings to undefined (avoid DB check constraint violations)
    const cleaned: CreatePartnerInput = {
      ...data,
      referral_code: data.referral_code || undefined,
      instagram_handle: data.instagram_handle || undefined,
      payout_method: data.payout_method || undefined,
      notes: data.notes || undefined,
      tiktok_handle: data.tiktok_handle || undefined,
      youtube_handle: data.youtube_handle || undefined,
      created_by: user?.email,
    };
    await createMutation.mutateAsync(cleaned);
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
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Creators</h1>
          <p className="text-muted-foreground text-lg">Manage partners and influencers</p>
        </div>
        {canCreatePartners && (
          <Button
            onClick={() => setShowForm(true)}
            className="rounded-xl glow-orange"
            disabled={showForm || !!editingPartner}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add {activeTab === "influencer" ? "Influencer" : activeTab === "partner" ? "Partner" : "Creator"}
          </Button>
        )}
      </div>

      {/* Creator Type Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab("all")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors",
            activeTab === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-card hover:bg-card/80 text-muted-foreground"
          )}
        >
          <Users className="w-4 h-4" />
          All
          <span className="px-1.5 py-0.5 rounded-md bg-background/20 text-xs">
            {partners?.length || 0}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("partner")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors",
            activeTab === "partner"
              ? "bg-primary text-primary-foreground"
              : "bg-card hover:bg-card/80 text-muted-foreground"
          )}
        >
          <UserCircle className="w-4 h-4" />
          Partners
          <span className="px-1.5 py-0.5 rounded-md bg-background/20 text-xs">
            {partnerCount}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("influencer")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors",
            activeTab === "influencer"
              ? "bg-primary text-primary-foreground"
              : "bg-card hover:bg-card/80 text-muted-foreground"
          )}
        >
          <Video className="w-4 h-4" />
          Influencers
          <span className="px-1.5 py-0.5 rounded-md bg-background/20 text-xs">
            {influencerCount}
          </span>
        </button>
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

      {/* Partner Monitoring Sections */}
      {!isLoading && (needsAttention.length > 0 || partnerWins.length > 0) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Needs Attention */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <h3 className="font-bold">Needs Attention</h3>
                <p className="text-sm text-muted-foreground">{needsAttention.length} partners inactive</p>
              </div>
            </div>

            {needsAttention.length > 0 ? (
              <div className="space-y-2 max-h-[280px] overflow-y-auto">
                {needsAttention.slice(0, 5).map((partner) => {
                  const daysSince = getDaysSinceLastReferral(partner.last_referral_at);
                  return (
                    <Link
                      key={partner.id}
                      to={`/partners/${partner.id}`}
                      className="flex items-center justify-between p-3 rounded-xl bg-background/50 hover:bg-background/70 transition-smooth group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-yellow-500/20 text-yellow-500 flex items-center justify-center">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{partner.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {daysSince === Infinity
                              ? "No referrals yet"
                              : `${daysSince} days inactive`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-yellow-500">
                          {partner.referrals_this_month || 0} this month
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {partner.total_referrals} total
                        </p>
                      </div>
                    </Link>
                  );
                })}
                {needsAttention.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    +{needsAttention.length - 5} more partners need attention
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">All partners are performing!</p>
              </div>
            )}
          </div>

          {/* Partner Wins */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-bold">Partner Wins</h3>
                <p className="text-sm text-muted-foreground">{partnerWins.length} partners converting</p>
              </div>
            </div>

            {partnerWins.length > 0 ? (
              <div className="space-y-2 max-h-[280px] overflow-y-auto">
                {partnerWins.slice(0, 5).map((partner, index) => (
                  <Link
                    key={partner.id}
                    to={`/partners/${partner.id}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-background/50 hover:bg-background/70 transition-smooth group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        index === 0
                          ? "bg-yellow-500/20 text-yellow-500"
                          : index === 1
                          ? "bg-gray-400/20 text-gray-400"
                          : index === 2
                          ? "bg-amber-600/20 text-amber-600"
                          : "bg-green-500/20 text-green-500"
                      }`}>
                        {index < 3 ? <Trophy className="w-4 h-4" /> : <Flame className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{partner.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {partner.referral_code}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-500">
                        +{partner.referrals_this_month || 0} this month
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(partner.total_earned)} earned
                      </p>
                    </div>
                  </Link>
                ))}
                {partnerWins.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    +{partnerWins.length - 5} more winning partners
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No referrals this month yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <PartnerForm
          existingCodes={existingCodes}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
          isLoading={createMutation.isPending}
          defaultCreatorType={activeTab === "influencer" ? "influencer" : "partner"}
        />
      )}

      {editingPartner && (
        <PartnerForm
          partner={editingPartner}
          existingCodes={existingCodes}
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
        ) : filteredPartners && filteredPartners.length > 0 ? (
          filteredPartners.map((partner) => (
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
                      {/* Creator type badge */}
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium",
                          partner.creator_type === "influencer"
                            ? "bg-purple-500/20 text-purple-500"
                            : "bg-blue-500/20 text-blue-500"
                        )}
                      >
                        {partner.creator_type === "influencer" ? "Influencer" : "Partner"}
                      </span>
                      {/* Status badge */}
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          partner.status === "active"
                            ? "bg-green-500/20 text-green-500"
                            : partner.status === "pending_approval"
                            ? "bg-orange-500/20 text-orange-500"
                            : partner.status === "inactive"
                            ? "bg-yellow-500/20 text-yellow-500"
                            : "bg-destructive/20 text-destructive"
                        }`}
                      >
                        {partner.status === "pending_approval" ? "Pending Approval" : partner.status}
                      </span>
                      {/* Contract status badge */}
                      {partner.contract_status && (
                        <span
                          className={cn(
                            "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                            partner.contract_status === "signed"
                              ? "bg-green-500/20 text-green-500"
                              : partner.contract_status === "pending"
                              ? "bg-yellow-500/20 text-yellow-500"
                              : "bg-red-500/20 text-red-500"
                          )}
                        >
                          <FileText className="w-3 h-3" />
                          {partner.contract_status === "signed" ? "Signed" : partner.contract_status === "pending" ? "Pending" : "Expired"}
                        </span>
                      )}
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

                    {/* Product badges */}
                    {partner.products && partner.products.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2">
                        {partner.products.map((product) => {
                          const Icon = PRODUCT_ICONS[product];
                          return (
                            <span
                              key={product}
                              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-background/50 text-xs"
                              title={PRODUCT_LABELS[product]}
                            >
                              <Icon className="w-3 h-3" />
                              {product === "app" && "App"}
                              {product === "coach" && "Coach"}
                              {product === "enterprise" && "Enterprise"}
                            </span>
                          );
                        })}
                      </div>
                    )}
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
            {activeTab === "influencer" ? (
              <Video className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            ) : (
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            )}
            <h3 className="text-xl font-bold mb-2">
              No {activeTab === "influencer" ? "influencers" : activeTab === "partner" ? "partners" : "creators"} yet
            </h3>
            <p className="text-muted-foreground mb-4">
              {canCreatePartners
                ? `Add your first ${activeTab === "influencer" ? "influencer" : "partner"} to start tracking referrals`
                : `No ${activeTab === "influencer" ? "influencers" : "partners"} have been added yet`}
            </p>
            {canCreatePartners && (
              <Button onClick={() => setShowForm(true)} className="rounded-xl glow-orange">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First {activeTab === "influencer" ? "Influencer" : "Partner"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
