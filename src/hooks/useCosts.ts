import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { costsApi, fixedCostsApi } from "@/api/endpoints/costs";
import type { CreateFixedCostInput } from "@/api/types/costs";

// Query Keys
export const costKeys = {
  all: ["costs"] as const,
  summary: () => [...costKeys.all, "summary"] as const,
  daily: (days: number) => [...costKeys.all, "daily", days] as const,
  users: (limit: number) => [...costKeys.all, "users", limit] as const,
  events: () => [...costKeys.all, "events"] as const,
  services: () => [...costKeys.all, "services"] as const,
  comprehensive: () => [...costKeys.all, "comprehensive"] as const,
  fixedCosts: () => [...costKeys.all, "fixed"] as const,
};

// Cost Summary
export function useCostSummary() {
  return useQuery({
    queryKey: costKeys.summary(),
    queryFn: costsApi.getSummary,
  });
}

// Daily Costs
export function useDailyCosts(days: number = 30) {
  return useQuery({
    queryKey: costKeys.daily(days),
    queryFn: () => costsApi.getDaily(days),
  });
}

// User Costs
export function useUserCosts(limit: number = 50) {
  return useQuery({
    queryKey: costKeys.users(limit),
    queryFn: () => costsApi.getUsers(limit),
  });
}

// Event Costs
export function useEventCosts() {
  return useQuery({
    queryKey: costKeys.events(),
    queryFn: costsApi.getEvents,
  });
}

// Service Costs
export function useServiceCosts() {
  return useQuery({
    queryKey: costKeys.services(),
    queryFn: costsApi.getServiceCosts,
  });
}

// Comprehensive Summary
export function useComprehensiveSummary() {
  return useQuery({
    queryKey: costKeys.comprehensive(),
    queryFn: costsApi.getComprehensive,
  });
}

// Fixed Costs
export function useFixedCosts() {
  return useQuery({
    queryKey: costKeys.fixedCosts(),
    queryFn: fixedCostsApi.getAll,
  });
}

// Create Fixed Cost
export function useCreateFixedCost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFixedCostInput) => fixedCostsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: costKeys.fixedCosts() });
      queryClient.invalidateQueries({ queryKey: costKeys.comprehensive() });
    },
  });
}

// Update Fixed Cost
export function useUpdateFixedCost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateFixedCostInput> }) =>
      fixedCostsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: costKeys.fixedCosts() });
      queryClient.invalidateQueries({ queryKey: costKeys.comprehensive() });
    },
  });
}

// Delete Fixed Cost
export function useDeleteFixedCost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => fixedCostsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: costKeys.fixedCosts() });
      queryClient.invalidateQueries({ queryKey: costKeys.comprehensive() });
    },
  });
}
