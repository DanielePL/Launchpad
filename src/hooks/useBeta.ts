import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBetaTesters,
  getBetaTesterStats,
  createBetaTester,
  createBetaTesters,
  updateBetaTester,
  deleteBetaTester,
  inviteBetaTester,
  activateBetaTester,
  getBetaFeedback,
  updateBetaFeedback,
  getIosBetaFeedback,
  updateIosBetaFeedback,
  getBetaOverview,
} from "@/api/betaClient";
import type {
  BetaTesterFilters,
  BetaTesterCreate,
  BetaTesterUpdate,
  BetaFeedbackFilters,
  BetaFeedbackUpdate,
} from "@/api/types";

// =====================================================
// Beta Testers Hooks
// =====================================================

export function useBetaTesters(filters?: BetaTesterFilters) {
  return useQuery({
    queryKey: ["beta-testers", filters],
    queryFn: () => getBetaTesters(filters),
  });
}

export function useBetaTesterStats() {
  return useQuery({
    queryKey: ["beta-tester-stats"],
    queryFn: getBetaTesterStats,
  });
}

export function useBetaOverview() {
  return useQuery({
    queryKey: ["beta-overview"],
    queryFn: getBetaOverview,
  });
}

export function useCreateBetaTester() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tester: BetaTesterCreate) => createBetaTester(tester),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beta-testers"] });
      queryClient.invalidateQueries({ queryKey: ["beta-tester-stats"] });
      queryClient.invalidateQueries({ queryKey: ["beta-overview"] });
    },
  });
}

export function useCreateBetaTesters() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (testers: BetaTesterCreate[]) => createBetaTesters(testers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beta-testers"] });
      queryClient.invalidateQueries({ queryKey: ["beta-tester-stats"] });
      queryClient.invalidateQueries({ queryKey: ["beta-overview"] });
    },
  });
}

export function useUpdateBetaTester() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, update }: { id: string; update: BetaTesterUpdate }) =>
      updateBetaTester(id, update),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beta-testers"] });
      queryClient.invalidateQueries({ queryKey: ["beta-tester-stats"] });
      queryClient.invalidateQueries({ queryKey: ["beta-overview"] });
    },
  });
}

export function useDeleteBetaTester() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBetaTester(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beta-testers"] });
      queryClient.invalidateQueries({ queryKey: ["beta-tester-stats"] });
      queryClient.invalidateQueries({ queryKey: ["beta-overview"] });
    },
  });
}

export function useInviteBetaTester() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => inviteBetaTester(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beta-testers"] });
      queryClient.invalidateQueries({ queryKey: ["beta-tester-stats"] });
    },
  });
}

export function useActivateBetaTester() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => activateBetaTester(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beta-testers"] });
      queryClient.invalidateQueries({ queryKey: ["beta-tester-stats"] });
    },
  });
}

// =====================================================
// Beta Feedback Hooks (Android)
// =====================================================

export function useBetaFeedback(filters?: BetaFeedbackFilters) {
  return useQuery({
    queryKey: ["beta-feedback", filters],
    queryFn: () => getBetaFeedback(filters),
  });
}

export function useUpdateBetaFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, update }: { id: string; update: BetaFeedbackUpdate }) =>
      updateBetaFeedback(id, update),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beta-feedback"] });
      queryClient.invalidateQueries({ queryKey: ["beta-overview"] });
    },
  });
}

// =====================================================
// iOS Beta Feedback Hooks
// =====================================================

export function useIosBetaFeedback(filters?: BetaFeedbackFilters) {
  return useQuery({
    queryKey: ["ios-beta-feedback", filters],
    queryFn: () => getIosBetaFeedback(filters),
  });
}

export function useUpdateIosBetaFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, update }: { id: string; update: BetaFeedbackUpdate }) =>
      updateIosBetaFeedback(id, update),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ios-beta-feedback"] });
      queryClient.invalidateQueries({ queryKey: ["beta-overview"] });
    },
  });
}
