'use client';

import { useState } from 'react';
import {
  useWarriorProfile,
  useClanProfile,
  type TeamLeaderboardMember,
} from '@/hooks/queries/useLeaderboard';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import RankBadge from '@/components/shared/RankBadge';
import {
  Shield,
  Users,
  Trophy,
  CheckCircle2,
  Crown,
  GraduationCap,
  MessageSquare,
  ExternalLink,
  Loader2,
  X,
  ChevronRight,
  Flame,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Rank } from '@/types/api.types';

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function NinjaStarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 1.5C12 1.5 13.5 8 17 10C19.5 11.5 22.5 12 22.5 12C22.5 12 19.5 12.5 17 14C13.5 16 12 22.5 12 22.5C12 22.5 10.5 16 7 14C4.5 12.5 1.5 12 1.5 12C1.5 12 4.5 11.5 7 10C10.5 8 12 1.5 12 1.5ZM12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" />
    </svg>
  );
}

export interface WarriorProfileInitialData {
  userId?: string;
  userName?: string;
  username?: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  userRank?: Rank;
  rank?: Rank;
  score?: number;
  teamName?: string | null;
  teamId?: string | null;
  teamType?: 'solo' | 'duo' | 'trio';
  teamMembers?: TeamLeaderboardMember[];
}

export interface ClanProfileInitialData {
  teamId?: string;
  id?: string;
  teamName?: string;
  name?: string;
  score?: number;
  rank?: number;
  memberCount?: number;
  teamType?: 'solo' | 'duo' | 'trio';
  members?: TeamLeaderboardMember[];
  leader?: string | null;
}

export interface WarriorProfileDialogProps {
  userId?: string | null;
  teamId?: string | null;
  mode?: 'warrior' | 'clan';
  isOpen: boolean;
  onClose: () => void;
  initialData?: WarriorProfileInitialData | null;
  initialClanData?: ClanProfileInitialData | null;
}

function getInitialDialogState(
  userId?: string | null,
  teamId?: string | null,
  mode: 'warrior' | 'clan' = 'warrior',
  initialData?: WarriorProfileInitialData | null,
  initialClanData?: ClanProfileInitialData | null
) {
  const isTeamItem =
    mode === 'clan' ||
    Boolean(teamId && !userId) ||
    Boolean(initialData?.teamName && (initialData?.userName === initialData.teamName || initialData?.username === initialData.teamName)) ||
    Boolean(initialData?.teamId && initialData?.userId === initialData.teamId) ||
    Boolean(initialClanData);

  const initialMode: 'warrior' | 'clan' = isTeamItem ? 'clan' : (mode || 'warrior');
  const initialUserId = isTeamItem ? null : (userId || null);
  const initialTeamId = teamId || (isTeamItem ? (initialData?.teamId || initialData?.userId || initialClanData?.teamId || null) : null);

  return { initialMode, initialUserId, initialTeamId };
}

function WarriorProfileDialogContent({
  userId,
  teamId,
  mode = 'warrior',
  isOpen,
  onClose,
  initialData,
  initialClanData,
}: WarriorProfileDialogProps) {
  const initialState = getInitialDialogState(userId, teamId, mode, initialData, initialClanData);

  // Navigation & View Mode State
  const [viewMode, setViewMode] = useState<'warrior' | 'clan'>(initialState.initialMode);
  const [currentUserId, setCurrentUserId] = useState<string | null>(initialState.initialUserId);
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(initialState.initialTeamId);
  const [navHistory, setNavHistory] = useState<
    Array<{ mode: 'warrior' | 'clan'; id: string; name?: string }>
  >([]);

  // Queries
  const { data: warriorProfile, isLoading: isWarriorLoading } = useWarriorProfile(
    viewMode === 'warrior' ? currentUserId : null
  );

  const clanQueryId =
    currentTeamId || (warriorProfile?.team ? warriorProfile.team.id : null);
  const { data: clanProfile, isLoading: isClanLoading } = useClanProfile(
    viewMode === 'clan' ? clanQueryId : null
  );

  if (!isOpen) return null;

  // Handlers for switching views
  const handleInspectWarrior = (wId: string) => {
    if (!wId) return;
    setNavHistory((prev) => [
      ...prev,
      {
        mode: 'clan',
        id: currentTeamId || '',
        name: clanProfile?.name || initialClanData?.teamName || initialClanData?.name || 'Clan',
      },
    ]);
    setCurrentUserId(wId);
    setViewMode('warrior');
  };

  const handleInspectClan = (tId: string) => {
    if (!tId) return;
    setNavHistory((prev) => [
      ...prev,
      {
        mode: 'warrior',
        id: currentUserId || '',
        name:
          warriorProfile?.fullName ||
          warriorProfile?.username ||
          initialData?.userName ||
          'Warrior',
      },
    ]);
    setCurrentTeamId(tId);
    setViewMode('clan');
  };

  const handleBack = () => {
    if (navHistory.length === 0) return;
    const last = navHistory[navHistory.length - 1];
    setNavHistory((prev) => prev.slice(0, -1));
    if (last.mode === 'clan') {
      setCurrentTeamId(last.id);
      setViewMode('clan');
    } else {
      setCurrentUserId(last.id);
      setViewMode('warrior');
    }
  };


  // ──────────────────────────────────────────────
  // CLAN VIEW DATA
  // ──────────────────────────────────────────────
  const clanName =
    clanProfile?.name ||
    initialClanData?.teamName ||
    initialClanData?.name ||
    warriorProfile?.team?.name ||
    'Clan';
  const clanScore =
    clanProfile?.score ??
    initialClanData?.score ??
    warriorProfile?.team?.score ??
    0;
  const clanRank =
    clanProfile?.rank ?? initialClanData?.rank;
  const clanMembers =
    clanProfile?.members ||
    initialClanData?.members ||
    warriorProfile?.team?.members ||
    [];
  const clanMemberCount =
    clanProfile?.memberCount ||
    clanMembers.length ||
    initialClanData?.memberCount ||
    warriorProfile?.team?.memberCount ||
    1;
  const clanType =
    clanProfile?.teamType ||
    initialClanData?.teamType ||
    warriorProfile?.team?.teamType ||
    (clanMemberCount >= 3 ? 'trio' : clanMemberCount === 2 ? 'duo' : 'solo');
  const clanLeaderName =
    clanProfile?.leader ||
    initialClanData?.leader ||
    clanMembers.find((m) => m.teamRole === 'leader')?.userName ||
    clanMembers.find((m) => m.teamRole === 'leader')?.username ||
    null;

  // ──────────────────────────────────────────────
  // WARRIOR VIEW DATA
  // ──────────────────────────────────────────────
  const displayName =
    warriorProfile?.fullName ||
    warriorProfile?.username ||
    initialData?.fullName ||
    initialData?.userName ||
    initialData?.username ||
    'Warrior';
  const username =
    warriorProfile?.username ||
    initialData?.username ||
    initialData?.userName ||
    'unknown';
  const avatarUrl =
    warriorProfile?.avatarUrl || initialData?.avatarUrl || '';
  const warriorRank = (warriorProfile?.rank ||
    initialData?.userRank ||
    initialData?.rank ||
    'Ronin') as Rank;
  const warriorScore = warriorProfile?.score ?? initialData?.score ?? 0;
  const warriorTeam = warriorProfile?.team || (initialData?.teamName ? {
    id: initialData.teamId || '',
    name: initialData.teamName,
    score: initialData.score || 0,
    teamType: initialData.teamType || 'solo',
    memberCount: initialData.teamMembers?.length || 1,
    members: initialData.teamMembers || [],
  } : null);

  const prevStep = navHistory.length > 0 ? navHistory[navHistory.length - 1] : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[88vh] flex flex-col p-0 gap-0 rounded-3xl border border-borders shadow-2xl bg-[#FAF8F4] overflow-hidden [&>button:last-child]:hidden">
        
        {/* Top Crimson Accent Strip */}
        <div className="h-1.5 w-full shrink-0 bg-gradient-to-r from-japan-red via-dark-red to-japan-red" />

        {/* Fixed Header */}
        <div className="relative shrink-0 bg-gradient-to-b from-[#F2ECE3] to-[#FAF8F4] p-5 sm:p-6 border-b border-borders/70 overflow-hidden">
          {/* Subtle Kanji Watermark */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-[0.04] pointer-events-none select-none font-serif font-black text-8xl text-primary-text">
            {viewMode === 'clan' ? '陣' : '道'}
          </div>

          {/* Single, Perfectly Positioned Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 h-8 w-8 rounded-full bg-white/90 border border-borders/80 flex items-center justify-center text-muted-text hover:text-japan-red hover:bg-white transition-all cursor-pointer shadow-xs focus:outline-hidden"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Breadcrumb Back Button if navigated */}
          {prevStep && (
            <div className="mb-3">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-text hover:text-japan-red bg-white/80 hover:bg-white px-3 py-1 rounded-full border border-borders/70 shadow-2xs transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-japan-red" />
                <span>
                  Back to {prevStep.mode === 'clan' ? `Clan (${prevStep.name || 'Clan'})` : prevStep.name || 'Warrior'}
                </span>
              </button>
            </div>
          )}

          {/* ═════════════════ HEADER: CLAN MODE ═════════════════ */}
          {viewMode === 'clan' ? (
            <div className="flex items-start gap-4 sm:gap-5 pr-8">
              <div className="relative shrink-0">
                <div className="h-16 w-16 sm:h-18 sm:w-18 rounded-2xl bg-gradient-to-br from-red-50 to-amber-50 border-2 border-japan-red/40 ring-4 ring-white shadow-md flex items-center justify-center text-japan-red">
                  <Shield className="h-8 w-8 text-japan-red fill-japan-red/15" />
                </div>
              </div>

              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <DialogTitle className="font-serif text-2xl sm:text-3xl font-black text-primary-text truncate">
                    {clanName}
                  </DialogTitle>

                  {clanRank ? (
                    <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white font-serif font-black text-[11px] shadow-xs gap-1 py-0.5">
                      <Trophy className="w-3 h-3 text-amber-100" />
                      Clan #{clanRank}
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-japan-red border-red-200 text-[11px] font-bold">
                      Battle Clan
                    </Badge>
                  )}

                  {clanType === 'trio' ? (
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs font-semibold">
                      Trio (3/3)
                    </Badge>
                  ) : clanType === 'duo' ? (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold">
                      Duo (2/2)
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs font-semibold">
                      Solo Clan (1/2)
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-text font-medium">
                  {clanLeaderName && (
                    <span className="flex items-center gap-1 text-primary-text font-semibold">
                      <Crown className="w-3.5 h-3.5 text-amber-600" />
                      Leader: <span className="text-japan-red">{clanLeaderName}</span>
                    </span>
                  )}
                  <span>•</span>
                  <span>{clanMemberCount} {clanMemberCount === 1 ? 'Warrior' : 'Warriors'}</span>
                  <span>•</span>
                  <span className="font-mono font-bold text-japan-red">{clanScore} pts total</span>
                </div>
              </div>
            </div>
          ) : (
            /* ═════════════════ HEADER: WARRIOR MODE ═════════════════ */
            <div className="flex items-start gap-4 sm:gap-5 pr-8">
              <div className="relative shrink-0">
                <Avatar className="h-16 w-16 sm:h-18 sm:w-18 rounded-full border-3 border-white ring-2 ring-japan-red/20 shadow-md bg-white">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} className="object-cover" />}
                  <AvatarFallback className="text-2xl font-serif font-bold text-japan-red bg-[#F7F3EE]">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <DialogTitle className="font-serif text-2xl sm:text-3xl font-bold text-primary-text truncate">
                    {displayName}
                  </DialogTitle>
                  <RankBadge rank={warriorRank} size="sm" />
                  {warriorProfile?.role && warriorProfile.role !== 'user' && (
                    <Badge className="bg-japan-red text-white uppercase text-[9px] tracking-wider font-bold h-5">
                      {warriorProfile.role}
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-muted-text font-mono mt-0.5">@{username}</p>

                {warriorProfile?.bio ? (
                  <div className="mt-2 text-xs text-secondary-text bg-white/75 px-3 py-1 rounded-lg border border-borders/50 leading-relaxed italic">
                    &ldquo;{warriorProfile.bio}&rdquo;
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-text mt-1 italic">Honor in code, mastery in battle.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Loading Bar */}
        {(isWarriorLoading || isClanLoading) && (
          <div className="bg-amber-50/90 border-b border-amber-200/60 px-6 py-1.5 text-xs text-amber-900 flex items-center gap-2 shrink-0">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-700" />
            <span className="font-medium">
              {viewMode === 'clan' ? 'Gathering clan scroll & roster...' : 'Loading warrior record...'}
            </span>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            SCROLLABLE BODY AREA (Clean padding & no cutoff)
           ═══════════════════════════════════════════════ */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 space-y-6 pb-8 scrollbar-thin">
          
          {/* ═════════════════ BODY: CLAN VIEW ═════════════════ */}
          {viewMode === 'clan' ? (
            <div className="space-y-6">
              {/* Clan Stats Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-white p-3 rounded-2xl border border-borders/80 shadow-xs flex flex-col justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text">Clan Honor</span>
                  <p className="text-base font-serif font-black text-japan-red mt-1 flex items-center gap-1">
                    <NinjaStarIcon className="w-3.5 h-3.5 text-japan-red shrink-0" />
                    {clanScore} <span className="text-[11px] font-sans text-muted-text font-semibold">pts</span>
                  </p>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-borders/80 shadow-xs flex flex-col justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text">Realm Rank</span>
                  <p className="text-base font-serif font-black text-primary-text mt-1 flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    {clanRank ? `#${clanRank}` : 'Ranked'}
                  </p>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-borders/80 shadow-xs flex flex-col justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text">Warriors</span>
                  <p className="text-base font-serif font-black text-primary-text mt-1 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    {clanMemberCount} <span className="text-[11px] font-sans text-muted-text font-semibold">active</span>
                  </p>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-borders/80 shadow-xs flex flex-col justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text">Clan Format</span>
                  <div className="mt-1">
                    {clanType === 'trio' ? (
                      <span className="text-xs font-bold text-purple-700">Trio (3/3)</span>
                    ) : clanType === 'duo' ? (
                      <span className="text-xs font-bold text-emerald-700">Duo (2/2)</span>
                    ) : (
                      <span className="text-xs font-bold text-amber-700">Solo (1/2)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Clan Guild Links & Member GitHubs Card */}
              {clanMembers.length > 0 && (
                <div className="bg-white rounded-2xl border border-borders/80 p-4 shadow-xs space-y-3">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-text flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-japan-red" />
                    Clan Guild Intel & Members&apos; GitHub
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {clanMembers.map((member: TeamLeaderboardMember) => {
                      const mName = member.fullName || member.username || member.userName || 'Warrior';
                      const mHandle = member.username || member.userName;
                      if (!mHandle) return null;

                      return (
                        <a
                          key={member.id || member.userId || mHandle}
                          href={`https://github.com/${mHandle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-between gap-2 text-secondary-text hover:text-primary-text bg-[#FAF8F4] hover:bg-secondary-bg px-3 py-2 rounded-xl border border-borders/50 transition-colors group"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <GithubIcon className="h-4 w-4 text-primary-text shrink-0" />
                            <div className="truncate">
                              <span className="font-semibold text-primary-text group-hover:text-japan-red transition-colors">
                                github.com/{mHandle}
                              </span>
                              <span className="text-[10px] text-muted-text ml-1.5 font-normal">
                                ({mName})
                              </span>
                            </div>
                          </div>
                          <ExternalLink className="h-3 w-3 text-muted-text group-hover:text-primary-text shrink-0" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Clan Warriors Roster */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-japan-red" />
                    <h3 className="font-serif font-bold text-lg text-primary-text">
                      Clan Warriors Roster
                    </h3>
                  </div>
                  <span className="text-xs text-muted-text font-medium">
                    {clanMembers.length} battle {clanMembers.length === 1 ? 'comrade' : 'comrades'}
                  </span>
                </div>

                <p className="text-xs text-muted-text">
                  Warriors sworn to {clanName}. Click any warrior below to inspect their individual profile and battle intel:
                </p>

                {clanMembers.length > 0 ? (
                  <div className="space-y-2.5">
                    {clanMembers.map((member: TeamLeaderboardMember) => {
                      const mId = member.id || member.userId;
                      const mName = member.fullName || member.username || member.userName || 'Warrior';
                      const mHandle = member.username || member.userName || 'warrior';
                      const mRank = (member.rank || 'Ronin') as Rank;

                      return (
                        <button
                          key={mId}
                          type="button"
                          onClick={() => handleInspectWarrior(mId)}
                          className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-borders/80 bg-white hover:border-japan-red/50 hover:bg-[#FDFCFA] transition-all duration-200 cursor-pointer text-left shadow-2xs group"
                        >
                          {/* Left: Avatar & Info */}
                          <div className="flex items-center gap-3.5 min-w-0 pr-3">
                            <Avatar className="h-11 w-11 border border-white ring-2 ring-borders/60 shrink-0 group-hover:ring-japan-red/30 transition-all">
                              {member.avatarUrl && <AvatarImage src={member.avatarUrl} alt={mName} className="object-cover" />}
                              <AvatarFallback className="text-xs font-bold bg-[#F1ECE5] text-primary-text">
                                {mName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-sm text-primary-text truncate group-hover:text-japan-red transition-colors">
                                  {mName}
                                </span>
                                {member.teamRole === 'leader' && (
                                  <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded font-bold border border-amber-200">
                                    <Crown className="h-3 w-3 text-amber-600" />
                                    Leader
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-text font-mono truncate mt-0.5">
                                @{mHandle}
                              </p>
                              {(member.collegeName || member.branch) && (
                                <p className="text-[11px] text-secondary-text truncate mt-0.5">
                                  {member.collegeName} {member.branch ? `· ${member.branch}` : ''}
                                </p>
                              )}
                              {/* Member Direct GitHub & Guild Links */}
                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                {mHandle && (
                                  <a
                                    href={`https://github.com/${mHandle}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center gap-1 text-[11px] text-secondary-text hover:text-japan-red bg-[#FAF8F4] hover:bg-secondary-bg px-2 py-0.5 rounded-md border border-borders/50 transition-colors group/git"
                                    title={`Visit ${mName}'s GitHub`}
                                  >
                                    <GithubIcon className="h-3 w-3 text-primary-text shrink-0" />
                                    <span className="font-mono font-medium">github.com/{mHandle}</span>
                                    <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                                  </a>
                                )}
                                {member.discord && (
                                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-text bg-[#FAF8F4] px-2 py-0.5 rounded-md border border-borders/50">
                                    <MessageSquare className="h-3 w-3 text-indigo-500 shrink-0" />
                                    <span>{member.discord}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right: Rank Badge, Points & Action */}
                          <div className="shrink-0 flex items-center gap-3">
                            <div className="text-right flex flex-col items-end">
                              <RankBadge rank={mRank} size="sm" showIcon={false} />
                              <span className="text-xs font-serif font-bold text-japan-red mt-0.5">
                                {member.score ?? 0} pts
                              </span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-text opacity-40 group-hover:opacity-100 group-hover:text-japan-red group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl border border-dashed border-borders bg-white/60 text-center text-muted-text text-xs">
                    No warrior comrades registered yet under this clan banner.
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ═════════════════ BODY: WARRIOR VIEW ═════════════════ */
            <div className="space-y-6">
              {/* Key Metric Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-white p-3 rounded-2xl border border-borders/80 shadow-xs flex flex-col justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text">Title</span>
                  <div className="mt-1.5">
                    <RankBadge rank={warriorRank} size="sm" />
                  </div>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-borders/80 shadow-xs flex flex-col justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text">Honor Points</span>
                  <p className="text-base font-serif font-black text-japan-red mt-1 flex items-center gap-1">
                    <NinjaStarIcon className="w-3.5 h-3.5 text-japan-red shrink-0" />
                    {warriorScore} <span className="text-[11px] font-sans text-muted-text font-semibold">pts</span>
                  </p>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-borders/80 shadow-xs flex flex-col justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text">Tasks Solved</span>
                  <p className="text-base font-serif font-black text-primary-text mt-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    {warriorProfile?.tasksCompleted ?? 0}
                  </p>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-borders/80 shadow-xs flex flex-col justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text">Clan Mode</span>
                  <div className="mt-1">
                    {warriorTeam ? (
                      warriorTeam.teamType === 'trio' ? (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs font-semibold">
                          Trio (3/3)
                        </Badge>
                      ) : warriorTeam.teamType === 'duo' ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold">
                          Duo (2/2)
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs font-semibold">
                          Solo (1/2)
                        </Badge>
                      )
                    ) : (
                      <Badge variant="outline" className="bg-stone-50 text-stone-600 border-stone-200 text-xs font-medium">
                        Solo Warrior
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Warrior Intel & Socials Card */}
              {(warriorProfile?.collegeName || warriorProfile?.branch || warriorProfile?.discord || username) && (
                <div className="bg-white rounded-2xl border border-borders/80 p-4 shadow-xs space-y-2.5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-text flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-japan-red" />
                    Warrior Intel & Guild Links
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {(warriorProfile?.collegeName || warriorProfile?.branch) && (
                      <div className="flex items-center gap-2 text-secondary-text bg-[#FAF8F4] px-3 py-2 rounded-xl border border-borders/50">
                        <GraduationCap className="h-4 w-4 text-muted-text shrink-0" />
                        <span className="truncate font-medium">
                          {warriorProfile.collegeName} {warriorProfile.branch ? `(${warriorProfile.branch})` : ''}
                        </span>
                      </div>
                    )}

                    {warriorProfile?.discord && (
                      <div className="flex items-center gap-2 text-secondary-text bg-[#FAF8F4] px-3 py-2 rounded-xl border border-borders/50">
                        <MessageSquare className="h-4 w-4 text-indigo-500 shrink-0" />
                        <span className="truncate">Discord: <strong className="text-primary-text font-semibold">{warriorProfile.discord}</strong></span>
                      </div>
                    )}

                    {username && (!warriorTeam || username !== warriorTeam.name) && (
                      <Link
                        href={`https://github.com/${username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-between gap-2 text-secondary-text hover:text-primary-text bg-[#FAF8F4] hover:bg-secondary-bg px-3 py-2 rounded-xl border border-borders/50 transition-colors group"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <GithubIcon className="h-4 w-4 text-primary-text shrink-0" />
                          <span className="font-semibold text-primary-text group-hover:text-japan-red transition-colors">
                            github.com/{username}
                          </span>
                        </div>
                        <ExternalLink className="h-3 w-3 text-muted-text group-hover:text-primary-text shrink-0" />
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Clan & Comrades Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-japan-red" />
                    <h3 className="font-serif font-bold text-lg text-primary-text">
                      {warriorTeam ? (
                        <>
                          Clan: <span className="text-japan-red">{warriorTeam.name}</span>
                        </>
                      ) : (
                        'Clan Affiliation'
                      )}
                    </h3>
                  </div>

                  {warriorTeam && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleInspectClan(warriorTeam.id)}
                      className="h-7 text-xs font-bold gap-1 text-japan-red border-japan-red/30 hover:bg-red-50 hover:text-dark-red cursor-pointer rounded-full"
                    >
                      <Shield className="w-3 h-3" />
                      View Clan Info →
                    </Button>
                  )}
                </div>

                {warriorTeam ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-text">
                      <span>Clan comrades in battle. Click any warrior below:</span>
                      <span className="font-mono font-bold text-primary-text">{warriorTeam.score} clan pts</span>
                    </div>

                    <div className="space-y-2">
                      {warriorTeam.members.map((member: TeamLeaderboardMember) => {
                        const mId = member.id || member.userId;
                        const isSelf = mId === currentUserId;
                        const mName = member.fullName || member.username || member.userName;
                        const mHandle = member.username || member.userName;

                        return (
                          <button
                            key={mId}
                            type="button"
                            onClick={() => {
                              if (mId && !isSelf) {
                                setCurrentUserId(mId);
                              }
                            }}
                            className={cn(
                              'w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer group',
                              isSelf
                                ? 'bg-red-50/40 border-japan-red/40 ring-1 ring-japan-red/20 shadow-xs'
                                : 'bg-white border-borders hover:border-japan-red/40 hover:bg-[#FDFCFA] hover:shadow-xs'
                            )}
                          >
                            {/* Left: Avatar & Names */}
                            <div className="flex items-center gap-3 min-w-0 pr-3">
                              <Avatar className="h-10 w-10 border border-white ring-1 ring-borders shrink-0">
                                {member.avatarUrl && <AvatarImage src={member.avatarUrl} alt={mName} />}
                                <AvatarFallback className="text-xs font-bold bg-[#F1ECE5] text-primary-text">
                                  {mName?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>

                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-sm text-primary-text truncate group-hover:text-japan-red transition-colors">
                                    {mName}
                                  </span>
                                  {member.teamRole === 'leader' && (
                                    <span title="Clan Leader" className="inline-flex items-center gap-0.5 text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded font-semibold border border-amber-200">
                                      <Crown className="h-3 w-3 text-amber-600" />
                                      Leader
                                    </span>
                                  )}
                                  {isSelf && (
                                    <span className="text-[9px] bg-japan-red text-white font-black px-1.5 py-0.2 rounded uppercase">
                                      Viewing
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-muted-text font-mono truncate mt-0.5">
                                  @{mHandle}
                                </p>
                                {mHandle && (
                                  <a
                                    href={`https://github.com/${mHandle}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center gap-1 text-[11px] text-muted-text hover:text-japan-red mt-1 hover:underline group/cgit"
                                    title={`Visit ${mName}'s GitHub`}
                                  >
                                    <GithubIcon className="h-3 w-3 text-primary-text" />
                                    <span className="font-mono">github.com/{mHandle}</span>
                                    <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                                  </a>
                                )}
                              </div>
                            </div>

                            {/* Right: Rank Badge, Points & Arrow */}
                            <div className="shrink-0 flex items-center gap-2.5">
                              <div className="text-right flex flex-col items-end">
                                <RankBadge rank={(member.rank || 'Ronin') as Rank} size="sm" showIcon={false} />
                                <span className="text-[11px] font-serif font-bold text-japan-red mt-0.5">
                                  {member.score ?? 0} pts
                                </span>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-text opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl border border-dashed border-borders bg-white/60 text-center space-y-1.5">
                    <Users className="w-7 h-7 text-muted-text/60 mx-auto" />
                    <h4 className="font-serif font-bold text-sm text-primary-text">Lone Warrior</h4>
                    <p className="text-xs text-muted-text max-w-sm mx-auto leading-relaxed">
                      Walking the solitary path of the ronin with no clan affiliation. All honor and points are earned solo.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Clean Footer Inside Scroll Area with comfortable bottom clearance */}
          <div className="pt-4 flex items-center justify-between border-t border-borders/60">
            <span className="text-[11px] text-muted-text font-medium flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-japan-red" />
              Journey to Mastery · Dojo Intelligence
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="cursor-pointer font-bold px-5 rounded-full border-borders hover:bg-white"
            >
              Close
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function WarriorProfileDialog(props: WarriorProfileDialogProps) {
  if (!props.isOpen) return null;
  const dialogKey = `${props.userId || ''}-${props.teamId || ''}-${props.mode || ''}`;
  return <WarriorProfileDialogContent key={dialogKey} {...props} />;
}

