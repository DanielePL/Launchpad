import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { contractsApi } from "@/api/endpoints/contracts";
import type { CreateContractInput, SignContractInput } from "@/api/types/contracts";

// Query Keys
export const contractKeys = {
  all: ["contracts"] as const,
  list: () => [...contractKeys.all, "list"] as const,
  detail: (id: string) => [...contractKeys.all, "detail", id] as const,
  byCreator: (creatorId: string) => [...contractKeys.all, "creator", creatorId] as const,
  stats: () => [...contractKeys.all, "stats"] as const,
};

// Get all contracts
export function useContracts() {
  return useQuery({
    queryKey: contractKeys.list(),
    queryFn: contractsApi.getAll,
  });
}

// Get contract by ID
export function useContract(id: string) {
  return useQuery({
    queryKey: contractKeys.detail(id),
    queryFn: () => contractsApi.getById(id),
    enabled: !!id,
  });
}

// Get contracts by creator ID
export function useCreatorContracts(creatorId: string) {
  return useQuery({
    queryKey: contractKeys.byCreator(creatorId),
    queryFn: () => contractsApi.getByCreatorId(creatorId),
    enabled: !!creatorId,
  });
}

// Get contract statistics
export function useContractStats() {
  return useQuery({
    queryKey: contractKeys.stats(),
    queryFn: contractsApi.getStats,
  });
}

// Create contract
export function useCreateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateContractInput) => contractsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractKeys.all });
    },
  });
}

// Upload contract PDF
export function useUploadContractPdf() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contractId, file }: { contractId: string; file: File }) =>
      contractsApi.uploadPdf(contractId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractKeys.all });
    },
  });
}

// Sign contract
export function useSignContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SignContractInput) => contractsApi.sign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractKeys.all });
    },
  });
}

// Send contract for signature
export function useSendContractForSignature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contractId: string) => contractsApi.sendForSignature(contractId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractKeys.all });
    },
  });
}

// Expire contract
export function useExpireContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contractId: string) => contractsApi.expire(contractId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractKeys.all });
    },
  });
}

// Delete contract
export function useDeleteContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => contractsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractKeys.all });
    },
  });
}
