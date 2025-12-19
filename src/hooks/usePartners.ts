import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { partnersApi } from "@/api/endpoints/partners";
import type { CreatePartnerInput } from "@/api/types/partners";

// Query Keys
export const partnerKeys = {
  all: ["partners"] as const,
  list: () => [...partnerKeys.all, "list"] as const,
  detail: (id: string) => [...partnerKeys.all, "detail", id] as const,
  referrals: (partnerId?: string) => [...partnerKeys.all, "referrals", partnerId] as const,
  pendingPayouts: () => [...partnerKeys.all, "pending-payouts"] as const,
};

// Get all partners
export function usePartners() {
  return useQuery({
    queryKey: partnerKeys.list(),
    queryFn: partnersApi.getAll,
  });
}

// Get partner referrals
export function usePartnerReferrals(partnerId?: string) {
  return useQuery({
    queryKey: partnerKeys.referrals(partnerId),
    queryFn: () => partnersApi.getReferrals(partnerId),
  });
}

// Get pending payouts
export function usePendingPayouts() {
  return useQuery({
    queryKey: partnerKeys.pendingPayouts(),
    queryFn: partnersApi.getPendingPayouts,
  });
}

// Create partner
export function useCreatePartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePartnerInput) => partnersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.all });
    },
  });
}

// Update partner
export function useUpdatePartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePartnerInput> }) =>
      partnersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.all });
    },
  });
}

// Delete partner
export function useDeletePartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => partnersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.all });
    },
  });
}

// Create payout record
export function useCreatePayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { partner_id: string; period_start: string; period_end: string }) =>
      partnersApi.createPayout(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.all });
    },
  });
}

// Send Revolut payout
export function useSendRevolutPayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (partnerId: string) => partnersApi.sendRevolutPayout(partnerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.all });
    },
  });
}

// Send batch payouts
export function useSendBatchPayouts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => partnersApi.sendBatchPayouts(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.all });
    },
  });
}

// Create Revolut counterparty
export function useCreateRevolutCounterparty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (partnerId: string) => partnersApi.createRevolutCounterparty(partnerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.all });
    },
  });
}

// Confirm pending commissions
export function useConfirmPendingCommissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => partnersApi.confirmPendingCommissions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.all });
    },
  });
}
