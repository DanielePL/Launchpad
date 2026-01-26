import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAmbassadors,
  getAmbassadorById,
  createAmbassador,
  updateAmbassador,
  deleteAmbassador,
  getDeliverables,
  createDeliverable,
  updateDeliverable,
  deleteDeliverable,
  getAmbassadorStats,
} from "@/api/ambassadorClient";
import type {
  AmbassadorFilters,
  AmbassadorCreate,
  AmbassadorUpdate,
  DeliverableCreate,
  DeliverableUpdate,
} from "@/api/types";

// =====================================================
// Ambassador Hooks
// =====================================================

export function useAmbassadors(filters?: AmbassadorFilters) {
  return useQuery({
    queryKey: ["ambassadors", filters],
    queryFn: () => getAmbassadors(filters),
  });
}

export function useAmbassador(id: string | null) {
  return useQuery({
    queryKey: ["ambassadors", id],
    queryFn: () => getAmbassadorById(id!),
    enabled: !!id,
  });
}

export function useAmbassadorStats() {
  return useQuery({
    queryKey: ["ambassador-stats"],
    queryFn: getAmbassadorStats,
  });
}

export function useCreateAmbassador() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ambassador: AmbassadorCreate) => createAmbassador(ambassador),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ambassadors"] });
      queryClient.invalidateQueries({ queryKey: ["ambassador-stats"] });
    },
  });
}

export function useUpdateAmbassador() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, update }: { id: string; update: AmbassadorUpdate }) =>
      updateAmbassador(id, update),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ambassadors"] });
      queryClient.invalidateQueries({ queryKey: ["ambassador-stats"] });
    },
  });
}

export function useDeleteAmbassador() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAmbassador(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ambassadors"] });
      queryClient.invalidateQueries({ queryKey: ["ambassador-stats"] });
    },
  });
}

// =====================================================
// Deliverable Hooks
// =====================================================

export function useDeliverables(ambassadorId: string | null) {
  return useQuery({
    queryKey: ["deliverables", ambassadorId],
    queryFn: () => getDeliverables(ambassadorId!),
    enabled: !!ambassadorId,
  });
}

export function useCreateDeliverable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (deliverable: DeliverableCreate) => createDeliverable(deliverable),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["deliverables", variables.ambassador_id] });
      queryClient.invalidateQueries({ queryKey: ["ambassador-stats"] });
    },
  });
}

export function useUpdateDeliverable(ambassadorId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, update }: { id: string; update: DeliverableUpdate }) =>
      updateDeliverable(id, update),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deliverables", ambassadorId] });
      queryClient.invalidateQueries({ queryKey: ["ambassador-stats"] });
    },
  });
}

export function useDeleteDeliverable(ambassadorId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDeliverable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deliverables", ambassadorId] });
      queryClient.invalidateQueries({ queryKey: ["ambassador-stats"] });
    },
  });
}
