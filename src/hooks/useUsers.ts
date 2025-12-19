import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@/api/endpoints/users";
import type { UserFilters } from "@/api/types/users";

// Query Keys
export const userKeys = {
  all: ["users"] as const,
  list: (filters?: UserFilters) => [...userKeys.all, "list", filters] as const,
  detail: (id: string) => [...userKeys.all, "detail", id] as const,
  costs: (id: string) => [...userKeys.all, "costs", id] as const,
};

// Get all users with filters
export function useUsers(filters?: UserFilters) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => usersApi.getAll(filters),
  });
}

// Get user by ID
export function useUser(userId: string) {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => usersApi.getById(userId),
    enabled: !!userId,
  });
}

// Get user cost details
export function useUserCosts(userId: string) {
  return useQuery({
    queryKey: userKeys.costs(userId),
    queryFn: () => usersApi.getCostDetails(userId),
    enabled: !!userId,
  });
}
