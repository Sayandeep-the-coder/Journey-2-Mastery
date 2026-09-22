import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export interface EmailBroadcastLog {
  id: string;
  actorId: string;
  action: string;
  metadata?: {
    subject?: string;
    recipientCount?: number;
    sentCount?: number;
    failedCount?: number;
  } | null;
  details?: {
    subject?: string;
    recipientCount?: number;
    sentCount?: number;
    failedCount?: number;
  } | null;
  createdAt: string;
}

export interface EmailStats {
  recipientCount: number;
  isConfigured: boolean;
  recentBroadcasts: EmailBroadcastLog[];
}

export interface SendBroadcastInput {
  subject: string;
  htmlContent: string;
}

export interface SendBroadcastResult {
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
}

export interface SendTestEmailInput {
  to: string;
  subject: string;
  htmlContent: string;
}

export function useEmailStats() {
  return useQuery<EmailStats, Error>({
    queryKey: ["admin", "emails", "stats"],
    queryFn: () => apiFetch<EmailStats>("/admin/emails/stats"),
    staleTime: 30 * 1000,
  });
}

export function useSendBroadcastEmail() {
  const queryClient = useQueryClient();

  return useMutation<SendBroadcastResult, Error, SendBroadcastInput>({
    mutationFn: (data) =>
      apiFetch<SendBroadcastResult>("/admin/emails/broadcast", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "emails", "stats"] });
    },
  });
}

export function useSendTestEmail() {
  return useMutation<{ success: boolean; message?: string }, Error, SendTestEmailInput>({
    mutationFn: (data) =>
      apiFetch<{ success: boolean; message?: string }>("/admin/emails/test", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}
