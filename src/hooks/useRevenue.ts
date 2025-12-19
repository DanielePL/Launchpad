import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { revenueApi } from "@/api/endpoints/revenue";
import type { CreateRevenueInput } from "@/api/types/revenue";

// Query Keys
export const revenueKeys = {
  all: ["revenue"] as const,
  list: (month?: string) => [...revenueKeys.all, "list", month] as const,
  breakEven: () => [...revenueKeys.all, "break-even"] as const,
};

// Get all revenue entries
export function useRevenue(month?: string) {
  return useQuery({
    queryKey: revenueKeys.list(month),
    queryFn: () => revenueApi.getAll(month),
  });
}

// Get break-even analysis
export function useBreakEven() {
  return useQuery({
    queryKey: revenueKeys.breakEven(),
    queryFn: revenueApi.getBreakEven,
  });
}

// Create revenue entry
export function useCreateRevenue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRevenueInput) => revenueApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: revenueKeys.all });
    },
  });
}

// Update revenue entry
export function useUpdateRevenue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateRevenueInput> }) =>
      revenueApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: revenueKeys.all });
    },
  });
}

// Delete revenue entry
export function useDeleteRevenue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => revenueApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: revenueKeys.all });
    },
  });
}
