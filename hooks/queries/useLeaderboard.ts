import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import type { LeaderboardEntry, RankTier, Rank } from '@/types/api.types';

export interface TeamLeaderboardMember {
  userId: string;
  id?: string;
  userName: string;
  username?: string;
  fullName?: string | null;
  avatarUrl?: string;
  rank?: Rank;
  role?: string;
  teamRole?: 'leader' | 'member';
  score?: number;
  bio?: string | null;
  collegeName?: string | null;
  branch?: string | null;
  discord?: string | null;
}

export interface TeamLeaderboardEntry {
  rank: number;
  teamId: string;
  teamName: string;
  score: number;
  memberCount: number;
  teamType?: 'solo' | 'duo' | 'trio';
  members: TeamLeaderboardMember[];
}

export interface WarriorProfileData {
  id: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: 'user' | 'judge' | 'admin';
  rank: Rank;
  score: number;
  tasksCompleted?: number;
  submissionCount?: number;
  bio: string | null;
  collegeName: string | null;
  branch: string | null;
  year: string | null;
  phone?: string | null;
  email?: string | null;
  discord: string | null;
  githubId?: string;
  createdAt?: string;
  team: {
    id: string;
    name: string;
    score: number;
    teamType: 'solo' | 'duo' | 'trio';
    memberCount: number;
    members: TeamLeaderboardMember[];
  } | null;
}

export function useLeaderboard() {
  return useQuery<LeaderboardEntry[], Error>({
    queryKey: ['leaderboard'],
    queryFn: () => apiFetch<LeaderboardEntry[]>('/leaderboard?limit=200'),
    staleTime: 0,
    refetchInterval: 10_000, // Live polling every 10s
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
    staleTime: 0,
    refetchInterval: 10_000, // Live polling every 10s
    retry: false,
  });
}

export function useWarriorProfile(userId: string | null) {
  return useQuery<WarriorProfileData, Error>({
    queryKey: ['warrior', 'profile', userId],
    queryFn: () => apiFetch<WarriorProfileData>(`/users/${userId}/profile`),
    enabled: !!userId,
  });
}

export interface ClanProfileData {
  id: string;
  name: string;
  score: number;
  rank?: number;
  status?: string;
  leader: string | null;
  memberCount: number;
  teamType: 'solo' | 'duo' | 'trio';
  members: TeamLeaderboardMember[];
}

export function useClanProfile(teamId: string | null) {
  return useQuery<ClanProfileData, Error>({
    queryKey: ['clan', 'profile', teamId],
    queryFn: () => apiFetch<ClanProfileData>(`/teams/${teamId}`),
    enabled: !!teamId,
    staleTime: 30_000,
  });
}

export function useRanks() {
  return useQuery<RankTier[], Error>({
    queryKey: ['ranks'],
    queryFn: () => apiFetch<RankTier[]>('/ranks'),
    staleTime: 30 * 60 * 1000, // Rarely changes
  });
}
