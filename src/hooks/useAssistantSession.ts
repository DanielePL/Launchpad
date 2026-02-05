import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/api/endpoints/appLaunch";
import type { AssistantSession } from "@/api/types/appLaunch";

// Query keys for assistant sessions
export const assistantKeys = {
  all: ["assistant"] as const,
  active: () => [...assistantKeys.all, "active"] as const,
  paused: () => [...assistantKeys.all, "paused"] as const,
  session: (id: string) => [...assistantKeys.all, id] as const,
};

/**
 * Hook to get the active assistant session
 */
export function useActiveSession() {
  return useQuery({
    queryKey: assistantKeys.active(),
    queryFn: api.getActiveSession,
    retry: false,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Hook to get all paused sessions
 */
export function usePausedSessions() {
  return useQuery({
    queryKey: assistantKeys.paused(),
    queryFn: api.getPausedSessions,
    retry: false,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Hook to create a new assistant session
 */
export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createAssistantSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assistantKeys.all });
    },
  });
}

/**
 * Hook to resume a paused session
 */
export function useResumeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.resumeSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assistantKeys.all });
    },
  });
}

/**
 * Hook to pause an active session
 */
export function usePauseSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.pauseSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assistantKeys.all });
    },
  });
}

/**
 * Hook to update an assistant session
 */
export function useUpdateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      updates,
    }: {
      sessionId: string;
      updates: Parameters<typeof api.updateAssistantSession>[1];
    }) => api.updateAssistantSession(sessionId, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: assistantKeys.all });
      if (data) {
        queryClient.setQueryData(assistantKeys.session(data.id), data);
      }
    },
  });
}

/**
 * Hook to send a message to the assistant
 */
export function useSendAssistantMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ message, sessionId }: { message: string; sessionId: string }) =>
      api.sendAssistantMessage(message, sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assistantKeys.all });
      // Also invalidate conversations if we need to refetch messages
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

/**
 * Hook to complete an assistant session
 */
export function useCompleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.completeSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assistantKeys.all });
    },
  });
}

/**
 * Hook to optimistically update session data locally
 * Useful for immediate UI feedback before server confirmation
 */
export function useOptimisticSessionUpdate() {
  const queryClient = useQueryClient();

  return (sessionId: string, update: Partial<AssistantSession>) => {
    queryClient.setQueryData<AssistantSession | null>(
      assistantKeys.active(),
      (old) => {
        if (!old || old.id !== sessionId) return old;
        return { ...old, ...update };
      }
    );
  };
}
