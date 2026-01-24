import type { InfluencerCategory, TeamMember } from "./influencers";

// Creator type distinguishes between partners and influencers in the unified system
export type CreatorType = "partner" | "influencer";

// Contract status for creators
export type ContractStatus = "pending" | "signed" | "expired";

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
