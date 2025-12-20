import { adminApi } from "../client";
import type {
  Partner,
  CreatePartnerInput,
  PartnerReferral,
  PendingPayout,
} from "../types/partners";

// Helper to normalize partner ID field (API returns partner_id from view, id from table)
const normalizePartner = (partner: Partner & { partner_id?: string }): Partner => ({
  ...partner,
  id: partner.id || partner.partner_id || "",
});

export const partnersApi = {
  getAll: async (): Promise<Partner[]> => {
    const response = await adminApi.get("/partners");
    return (response.data || []).map(normalizePartner);
  },

  create: async (
    data: CreatePartnerInput
  ): Promise<{ success: boolean; partner: Partner; generated_password: string; referral_code: string }> => {
    const response = await adminApi.post("/partners", data);
    return response.data;
  },

  update: async (
    id: string,
    data: Partial<CreatePartnerInput>
  ): Promise<{ success: boolean; partner: Partner }> => {
    const response = await adminApi.put(`/partners/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    const response = await adminApi.delete(`/partners/${id}`);
    return response.data;
  },

  getReferrals: async (partnerId?: string): Promise<PartnerReferral[]> => {
    const response = await adminApi.get("/partner-referrals", {
      params: partnerId ? { partner_id: partnerId } : undefined,
    });
    return response.data;
  },

  getPendingPayouts: async (): Promise<{
    pending_payouts: PendingPayout[];
    total_pending: number;
    min_payout: number;
  }> => {
    const response = await adminApi.get("/pending-payouts");
    return response.data;
  },

  createPayout: async (data: {
    partner_id: string;
    period_start: string;
    period_end: string;
  }): Promise<{ success: boolean; payout_id: string; amount: number; referral_count: number }> => {
    const response = await adminApi.post("/partner-payouts", data);
    return response.data;
  },

  sendRevolutPayout: async (
    partnerId: string
  ): Promise<{
    success: boolean;
    amount: number;
    currency: string;
    referral_count: number;
    transfer_id: string;
    partner_name: string;
  }> => {
    const response = await adminApi.post("/send-revolut-payout", {
      partner_id: partnerId,
    });
    return response.data;
  },

  sendBatchPayouts: async (): Promise<{
    success: boolean;
    payouts_sent: number;
    successful: number;
    failed: number;
    total_amount: number;
  }> => {
    const response = await adminApi.post("/send-batch-revolut-payouts");
    return response.data;
  },

  createRevolutCounterparty: async (
    partnerId: string
  ): Promise<{ success: boolean; counterparty_id: string; partner_name: string }> => {
    const response = await adminApi.post("/create-revolut-counterparty", {
      partner_id: partnerId,
    });
    return response.data;
  },

  confirmPendingCommissions: async (): Promise<{
    success: boolean;
    confirmed: number;
    message: string;
  }> => {
    const response = await adminApi.post("/confirm-pending-commissions");
    return response.data;
  },
};
