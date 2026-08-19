import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import type { LeaderboardEntry, RankTier } from '@/types/api.types';

export interface TeamLeaderboardEntry {
  rank: number;
  teamId: string;
  teamName: string;
  score: number;
  memberCount: number;
  members: { userId: string; userName: string; avatarUrl?: string }[];
}

export function useLeaderboard() {
  return useQuery<LeaderboardEntry[], Error>({
    queryKey: ['leaderboard'],
    queryFn: () => apiFetch<LeaderboardEntry[]>('/leaderboard'),
    staleTime: 30 * 1000,
  });
}

export function useTeamLeaderboard() {
  return useQuery<TeamLeaderboardEntry[], Error>({
    queryKey: ['leaderboard', 'teams'],
    queryFn: async () => {
      try {
        return await apiFetch<TeamLeaderboardEntry[]>('/leaderboard/teams');
      } catch {
        // Endpoint may not exist yet — return empty gracefully
        return [];
      }
    },
    staleTime: 30 * 1000,
    retry: false,
  });
}

export function useRanks() {
  return useQuery<RankTier[], Error>({
    queryKey: ['ranks'],
    queryFn: () => apiFetch<RankTier[]>('/ranks'),
    staleTime: 30 * 60 * 1000, // Rarely changes
  });
}
