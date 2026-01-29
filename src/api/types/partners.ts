import type { InfluencerCategory, TeamMember } from "./influencers";

// Creator type distinguishes between partners, influencers, and beta partners in the unified system
export type CreatorType = "partner" | "influencer" | "beta_partner";

// Contract status for creators
export type ContractStatus = "pending" | "signed" | "expired";

// ============================================
// PRODUCT TYPES & TIERS
// ============================================

export type ProductType = "app" | "coach" | "enterprise";

export type EnterpriseTier = "basic_gym" | "pro_gym" | "advanced_gym";

export const PRODUCT_LABELS: Record<ProductType, string> = {
  app: "Prometheus App",
  coach: "Prometheus Coach",
  enterprise: "Prometheus Enterprise",
};

export const ENTERPRISE_TIERS: Record<EnterpriseTier, {
  label: string;
  monthlyPrice: number;
  yearlyPrice: number;
  maxTrainers: number;
  description: string;
}> = {
  basic_gym: {
    label: "Basic Gym",
    monthlyPrice: 149,
    yearlyPrice: 1490,
    maxTrainers: 3,
    description: "Single location",
  },
  pro_gym: {
    label: "Pro Gym",
    monthlyPrice: 249,
    yearlyPrice: 2490,
    maxTrainers: 6,
    description: "Medium facility",
  },
  advanced_gym: {
    label: "Advanced Gym",
    monthlyPrice: 399,
    yearlyPrice: 3990,
    maxTrainers: 10,
    description: "Multi zone",
  },
};

// Product-specific commission configuration
export interface ProductCommission {
  product: ProductType;
  commission_percent: number;
  enabled: boolean;
}

// Default commission rates per product (can be overridden per creator)
export const DEFAULT_COMMISSIONS: Record<ProductType, number> = {
  app: 20,        // 20% of net revenue
  coach: 20,      // 20% of subscription
  enterprise: 20, // 20% of subscription (recurring)
};

// ============================================
// ENTERPRISE DEALS / PIPELINE
// ============================================

export type DealStage = "lead" | "contacted" | "demo_scheduled" | "demo_done" | "proposal_sent" | "negotiation" | "closed_won" | "closed_lost";

export const DEAL_STAGES: Record<DealStage, {
  label: string;
  color: string;
  bg: string;
  order: number;
}> = {
  lead: { label: "Lead", color: "text-gray-500", bg: "bg-gray-500/20", order: 0 },
  contacted: { label: "Contacted", color: "text-blue-500", bg: "bg-blue-500/20", order: 1 },
  demo_scheduled: { label: "Demo Scheduled", color: "text-purple-500", bg: "bg-purple-500/20", order: 2 },
  demo_done: { label: "Demo Done", color: "text-indigo-500", bg: "bg-indigo-500/20", order: 3 },
  proposal_sent: { label: "Proposal Sent", color: "text-orange-500", bg: "bg-orange-500/20", order: 4 },
  negotiation: { label: "Negotiation", color: "text-yellow-500", bg: "bg-yellow-500/20", order: 5 },
  closed_won: { label: "Closed Won", color: "text-green-500", bg: "bg-green-500/20", order: 6 },
  closed_lost: { label: "Closed Lost", color: "text-red-500", bg: "bg-red-500/20", order: 7 },
};

export interface EnterpriseDeal {
  id: string;
  creator_id: string;           // The partner who brought the deal
  creator_name?: string;

  // Prospect info
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  company_type?: string;        // gym, physio, studio, etc.
  location?: string;

  // Deal details
  stage: DealStage;
  tier: EnterpriseTier;
  billing_cycle: "monthly" | "yearly";
  deal_value: number;           // Total deal value
  commission_amount: number;    // Creator's commission

  // Dates
  created_at: string;
  last_activity_at?: string;
  demo_date?: string;
  expected_close_date?: string;
  closed_at?: string;

  // Notes
  notes?: string;
  loss_reason?: string;
}

export interface Partner {
  id: string;
  partner_id?: string; // From partner_statistics view, normalized to id
  name: string;
  email: string;
  referral_code: string;
  partner_type: "affiliate" | "other";
  commission_percent: number;
  instagram_handle?: string;
  follower_count?: number;
  payout_method?: string;
  payout_details?: {
    revolut_email?: string;
    iban?: string;
    bic?: string;
    bank_country?: string;
  };
  status: "pending_approval" | "active" | "inactive" | "terminated";
  created_by?: string; // Email of who created the partner
  total_referrals: number;
  total_earned: number;
  total_paid: number;
  counterparty_id?: string;
  notes?: string;
  created_at: string;
  // Monitoring fields
  referrals_this_month?: number;
  last_referral_at?: string;
  confirmed_referrals?: number;

  // Creator type (partner or influencer)
  creator_type: CreatorType;

  // Influencer-specific fields (optional, only for creator_type="influencer")
  tiktok_handle?: string;
  youtube_handle?: string;
  engagement_rate?: number;
  category?: InfluencerCategory;
  contact_person?: TeamMember;

  // Contract management
  contract_id?: string;
  contract_signed_at?: string;
  contract_status?: ContractStatus;
  contract_pdf_url?: string;        // Supabase Storage URL
  contract_generated_at?: string;   // When contract was generated

  // Product assignments - which products can this creator sell
  products?: ProductType[];
  product_commissions?: ProductCommission[];

  // Enterprise-specific stats (for partners selling Enterprise)
  enterprise_deals_count?: number;
  enterprise_deals_value?: number;
  enterprise_active_subscriptions?: number;
}

export interface CreatePartnerInput {
  name: string;
  email: string;
  referral_code?: string;
  partner_type?: "affiliate" | "other";
  commission_percent?: number;
  instagram_handle?: string;
  follower_count?: number;
  payout_method?: string;
  notes?: string;
  status?: "pending_approval" | "active";
  created_by?: string;

  // Creator type (defaults to "partner" if not specified)
  creator_type?: CreatorType;

  // Influencer-specific fields
  tiktok_handle?: string;
  youtube_handle?: string;
  engagement_rate?: number;
  category?: InfluencerCategory;
  contact_person?: TeamMember;

  // Product assignments
  products?: ProductType[];
  product_commissions?: ProductCommission[];
}

export interface ApprovePartnerInput {
  partner_id: string;
  approved: boolean;
  rejection_reason?: string;
}

export interface PartnerReferral {
  id: string;
  partner_id: string;
  partner_name?: string;
  user_id: string;
  user_email?: string;
  subscription_revenue: number;
  commission_amount: number;
  commission_status: "pending" | "confirmed" | "paid";
  referral_date: string;
  payout_id?: string;
}

export interface PartnerPayout {
  id: string;
  partner_id: string;
  amount: number;
  currency: string;
  status: "pending" | "processing" | "completed" | "failed";
  payout_reference?: string;
  referral_count: number;
  period_start: string;
  period_end: string;
  created_at: string;
}

export interface PendingPayout {
  partner_id: string;
  partner_name: string;
  referral_code: string;
  email: string;
  revolut_email?: string;
  iban?: string;
  counterparty_id?: string;
  referral_count: number;
  total_amount: number;
  eligible: boolean;
  missing_payout_info: boolean;
}
