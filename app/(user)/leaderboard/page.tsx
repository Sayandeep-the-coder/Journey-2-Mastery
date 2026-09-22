'use client';

import { useState } from 'react';
import { useLeaderboard } from '@/hooks/queries/useLeaderboard';
import { useSession } from '@/hooks/useSession';
import { useTeamDetail } from '@/hooks/queries/useTeam';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import RankBadge from '@/components/shared/RankBadge';
import WarriorProfileDialog, {
  type WarriorProfileInitialData,
  type ClanProfileInitialData,
} from '@/components/shared/WarriorProfileDialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Crown, Medal, Swords, Shield, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import type { LeaderboardEntry, LeaderboardTeamMember, Rank } from '@/types/api.types';

function getPureMartialRank(score: number, rank?: string): Rank {
  if (rank && ['Ronin', 'Kenshi', 'Samurai', 'Shogun'].includes(rank)) {
    return rank as Rank;
  }
  if (score >= 300) return 'Shogun';
  if (score >= 200) return 'Samurai';
  if (score >= 100) return 'Kenshi';
  return 'Ronin';
}

function NinjaStarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 1.5C12 1.5 13.5 8 17 10C19.5 11.5 22.5 12 22.5 12C22.5 12 19.5 12.5 17 14C13.5 16 12 22.5 12 22.5C12 22.5 10.5 16 7 14C4.5 12.5 1.5 12 1.5 12C1.5 12 4.5 11.5 7 10C10.5 8 12 1.5 12 1.5ZM12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" />
    </svg>
  );
}

export default function LeaderboardPage() {
  const { data: entries, isLoading, isError, error, refetch } = useLeaderboard();
  const { data: currentUser } = useSession();
  const { data: myTeam } = useTeamDetail();

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<'warrior' | 'clan'>('clan');
  const [selectedPreview, setSelectedPreview] = useState<WarriorProfileInitialData | null>(null);
  const [selectedClanPreview, setSelectedClanPreview] = useState<ClanProfileInitialData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState<number>(20);

  const totalCount = entries?.length || 0;
  const displayedEntries = entries ? entries.slice(0, visibleCount) : [];

  const handleOpenClan = (team: LeaderboardEntry) => {
    const tId = team.teamId || team.userId;
    if (tId) {
      setSelectedTeamId(tId);
      setSelectedUserId(null);
      setSelectedClanPreview(team as unknown as ClanProfileInitialData);
      setDialogMode('clan');
      setDialogOpen(true);
    }
  };

  const handleOpenWarrior = (
    member: LeaderboardTeamMember | LeaderboardEntry,
    teamContext?: LeaderboardEntry
  ) => {
    const id = member.userId || ('id' in member ? member.id : undefined);
    if (id) {
      setSelectedUserId(id);
      setSelectedTeamId(
        teamContext?.teamId ||
        teamContext?.userId ||
        ('teamId' in member ? (member.teamId as string) : null) ||
        null
      );
      setSelectedPreview(member as unknown as WarriorProfileInitialData);
      setDialogMode('warrior');
      setDialogOpen(true);
    }
  };

  const handleOpenEntry = (entry: LeaderboardEntry) => {
    if (entry.teamType === 'solo' && (!entry.teamId || entry.userId === entry.teamId)) {
      const member = entry.teamMembers?.[0] || entry;
      handleOpenWarrior(member, entry);
    } else {
      handleOpenClan(entry);
    }
  };


  if (isLoading) return <LoadingSkeleton variant="table" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  // Top 3 for Podium (Only when scores have been awarded by judges)
  const hasScoredEntries = entries && entries.some((e) => e.score > 0);
  const topThree = hasScoredEntries && entries.length >= 3
    ? [entries[1], entries[0], entries[2]]
    : [];

  const rankGradients = [
    'from-slate-200 to-slate-400 shadow-slate-300/50', // Silver #2
    'from-yellow-300 to-amber-500 shadow-amber-400/50', // Gold #1
    'from-orange-300 to-orange-600 shadow-orange-500/50', // Bronze #3
  ];

  const borderColors = [
    'border-slate-300',
    'border-amber-400',
    'border-orange-400',
  ];

  const icons = [Medal, Crown, Swords];

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-card-bg border border-borders px-8 py-12 md:py-16 shadow-sm">
        <div
          className="absolute inset-0 z-0 opacity-40 pointer-events-none"
          style={{
            maskImage: 'linear-gradient(to bottom, black 50%, transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent)',
          }}
        >
          <Image
            src="/images/dashboard-header.png"
            alt="Landscape"
            fill
            className="object-cover mix-blend-multiply grayscale contrast-125 brightness-110"
          />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary-text drop-shadow-sm flex items-center gap-3">
              <NinjaStarIcon className="h-10 w-10 text-japan-red" />
              Hall of Masters
            </h1>
            <p className="text-secondary-text mt-4 font-medium text-lg">
              Elite clans and solo warriors ranked by honor and glory. Live rankings.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-5 py-2.5 bg-white/90 backdrop-blur-sm border border-borders text-primary-text shadow-sm rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {totalCount} Ranked Teams & Warriors
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Podium (Active once scores are awarded by judges) */}
      {hasScoredEntries && topThree.length >= 3 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mt-8 max-w-5xl mx-auto px-4">
          {topThree.map((entry, i) => {
            const position = i === 0 ? 2 : i === 1 ? 1 : 3;
            const PosIcon = icons[i];
            const pureRank = getPureMartialRank(entry.score, entry.userRank as string);
            const isUserEntry =
              currentUser?.id === entry.userId ||
              (entry.teamId && myTeam?.id === entry.teamId);
            const isSolo = entry.teamType === 'solo';

            return (
              <div
                key={entry.teamId || entry.userId}
                onClick={() => handleOpenEntry(entry)}
                className={cn(
                  'relative flex items-center p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-borders shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 group cursor-pointer hover:border-japan-red/40',
                  position === 1 ? 'md:-translate-y-4 shadow-md ring-2 ring-amber-400/25' : '',
                  isUserEntry ? 'border-japan-red/50 bg-red-50/20' : ''
                )}
              >
                {/* Rank Badge */}
                <div
                  className={cn(
                    'absolute -top-3 -left-3 flex items-center justify-center rounded-full bg-gradient-to-br border-2 border-white shadow-sm z-20',
                    rankGradients[i],
                    position === 1 ? 'w-10 h-10' : 'w-8 h-8'
                  )}
                >
                  <PosIcon className="w-4 h-4 text-white drop-shadow-sm" />
                </div>

                {/* Crest / Avatar */}
                <div className="relative mr-4 shrink-0">
                  {position === 1 && (
                    <div className="absolute inset-0 rounded-full bg-amber-400/25 animate-ping" />
                  )}
                  <Avatar
                    className={cn(
                      'border-2 shadow-sm relative z-10 rounded-2xl transition-colors',
                      borderColors[i],
                      position === 1 ? 'h-16 w-16 text-2xl' : 'h-14 w-14 text-xl'
                    )}
                  >
                    {entry.avatarUrl && <AvatarImage src={entry.avatarUrl} alt={entry.userName} className="rounded-2xl object-cover" />}
                    <AvatarFallback
                      className={cn(
                        'font-serif font-black',
                        position === 1 ? 'bg-amber-50 text-amber-700' : 'bg-secondary-bg text-primary-text'
                      )}
                    >
                      {(entry.teamName || entry.userName)?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Entry Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-lg text-primary-text truncate group-hover:text-japan-red transition-colors">
                      {entry.teamName || entry.userName}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    {entry.teamType === 'trio' ? (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] px-1.5 py-0 font-semibold">
                        Trio (3/3)
                      </Badge>
                    ) : entry.teamType === 'duo' ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] px-1.5 py-0 font-semibold">
                        Duo (2/2)
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] px-1.5 py-0 font-semibold">
                        Solo Warrior
                      </Badge>
                    )}
                    <RankBadge rank={pureRank} size="sm" />
                  </div>

                  {/* Member Avatars (if multi-member team) */}
                  {!isSolo && entry.teamMembers && entry.teamMembers.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <div className="flex -space-x-1.5">
                        {entry.teamMembers.slice(0, 3).map((m, idx) => (
                          <Avatar key={m.userId || idx} className="h-6 w-6 border-2 border-white shadow-xs ring-1 ring-borders/60">
                            {m.avatarUrl && <AvatarImage src={m.avatarUrl} alt={m.userName} />}
                            <AvatarFallback className="text-[9px] font-bold bg-secondary-bg">
                              {(m.userName || m.username)?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <span className="text-[11px] text-muted-text font-medium">
                        {entry.teamMembers.length} warriors
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 mt-1.5 text-sm font-bold text-primary-text">
                    <NinjaStarIcon className="w-3.5 h-3.5 text-japan-red" />
                    {entry.score} <span className="text-muted-text font-medium text-xs">pts</span>
                  </div>
                </div>

                {/* Large Background Rank Number */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-[0.08] pointer-events-none">
                  <span className="text-7xl font-black font-serif italic">{position}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-borders bg-white/70 backdrop-blur-md p-6 text-center max-w-2xl mx-auto shadow-xs mt-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 mx-auto mb-3 shadow-2xs">
            <Trophy className="h-6 w-6" />
          </div>
          <h3 className="font-serif font-bold text-lg text-primary-text">Live Rankings & Podium</h3>
          <p className="text-xs text-secondary-text mt-1 max-w-md mx-auto leading-relaxed">
            All teams and warriors are currently at 0 points. Ranks and podium honors are determined strictly by points awarded through judge reviews.
          </p>
        </div>
      )}

      {/* Main Leaderboard Table */}
      {!entries || entries.length === 0 ? (
        <Card className="border-borders shadow-sm bg-white mt-8 rounded-2xl">
          <CardContent className="py-16 text-center">
            <Shield className="w-12 h-12 text-borders mx-auto mb-4" />
            <h3 className="text-lg font-bold text-primary-text mb-2">No Rankings Yet</h3>
            <p className="text-secondary-text text-sm">Teams and warriors will appear here once they start earning honor points.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-borders shadow-lg bg-card-bg overflow-hidden mt-8 rounded-2xl">
          <CardHeader className="border-b border-borders/50 bg-secondary-bg/30 flex flex-row items-center justify-between py-6 px-8">
            <div>
              <CardTitle className="font-serif text-2xl flex items-center gap-3">
                <Shield className="w-6 h-6 text-japan-red" />
                Team & Warrior Standings
              </CardTitle>
              <p className="text-xs text-secondary-text mt-1 font-medium">
                Clans and solo warriors ranked live by honor points and mission completions.
              </p>
            </div>
            <div className="px-4 py-1.5 bg-white border border-borders text-primary-text shadow-sm rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Showing {displayedEntries.length} of {totalCount} Ranked
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-secondary-bg/20">
                <TableRow className="hover:bg-transparent border-borders/50">
                  <TableHead className="w-24 text-center font-bold text-muted-text">Rank</TableHead>
                  <TableHead className="font-bold text-muted-text">Clan / Warrior</TableHead>
                  <TableHead className="font-bold text-muted-text">Team Format</TableHead>
                  <TableHead className="font-bold text-muted-text">Warriors</TableHead>
                  <TableHead className="font-bold text-muted-text">Martial Title</TableHead>
                  <TableHead className="text-right font-bold text-muted-text">Honor Points</TableHead>
                  <TableHead className="text-right font-bold text-muted-text">Tasks</TableHead>
                  <TableHead className="text-right font-bold text-muted-text w-28">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedEntries.map((entry) => {
                  const pureRank = getPureMartialRank(entry.score, entry.userRank as string);
                  const isTrio = entry.teamType === 'trio' || (entry.teamMembers && entry.teamMembers.length >= 3);
                  const isDuo = entry.teamType === 'duo' || (entry.teamMembers && entry.teamMembers.length === 2);
                  const isSolo = entry.teamType === 'solo';
                  const isUserEntry =
                    currentUser?.id === entry.userId ||
                    (entry.teamId && myTeam?.id === entry.teamId);

                  return (
                    <TableRow
                      key={entry.teamId || entry.userId}
                      onClick={() => handleOpenEntry(entry)}
                      className={cn(
                        'transition-all duration-300 border-borders/50 group cursor-pointer',
                        isUserEntry
                          ? 'bg-japan-red/[0.04] border-l-4 border-l-japan-red hover:bg-japan-red/[0.07]'
                          : 'hover:bg-secondary-bg/40'
                      )}
                    >
                      {/* Team Rank */}
                      <TableCell className="font-bold text-center py-4">
                        {entry.score > 0 && entry.rank > 0 ? (
                          entry.rank <= 3 ? (
                            <span
                              className={cn(
                                'inline-flex items-center justify-center w-10 h-10 rounded-full text-white font-black text-lg shadow-md group-hover:scale-110 transition-transform',
                                entry.rank === 1
                                  ? 'bg-gradient-to-br from-yellow-300 to-amber-600 ring-4 ring-amber-100'
                                  : entry.rank === 2
                                  ? 'bg-gradient-to-br from-slate-200 to-slate-500 ring-4 ring-slate-100'
                                  : 'bg-gradient-to-br from-orange-300 to-orange-700 ring-4 ring-orange-100'
                              )}
                            >
                              {entry.rank}
                            </span>
                          ) : (
                            <span className="text-primary-text font-serif text-xl font-bold group-hover:text-japan-red transition-colors">
                              #{entry.rank}
                            </span>
                          )
                        ) : (
                          <span className="text-muted-text/80 font-serif text-xl font-bold tracking-wider" title="Unranked until judges award honor points">
                            —
                          </span>
                        )}
                      </TableCell>

                      {/* Clan / Warrior Cell */}
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            className={cn(
                              'h-11 w-11 rounded-2xl border-2 shadow-xs group-hover:border-japan-red transition-all',
                              isUserEntry
                                ? 'border-japan-red ring-1 ring-japan-red/30'
                                : 'border-borders'
                            )}
                          >
                            {entry.avatarUrl && <AvatarImage src={entry.avatarUrl} alt={entry.userName} className="rounded-2xl object-cover" />}
                            <AvatarFallback
                              className={cn(
                                'font-serif font-black text-lg rounded-2xl',
                                isUserEntry ? 'bg-red-50 text-japan-red' : 'bg-white text-primary-text'
                              )}
                            >
                              {(entry.teamName || entry.userName)?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  'text-base font-bold transition-colors group-hover:text-japan-red',
                                  isUserEntry ? 'text-japan-red' : 'text-primary-text'
                                )}
                              >
                                {entry.teamName || entry.userName}
                              </span>
                              {isUserEntry && (
                                <span className="text-[10px] bg-japan-red text-white uppercase tracking-widest font-black px-2 py-0.5 rounded-full">
                                  You
                                </span>
                              )}
                            </div>
                            {isSolo && entry.teamMembers?.[0]?.username && entry.teamMembers[0].username !== (entry.teamName || entry.userName) && (
                              <span className="text-xs text-muted-text font-mono">
                                @{entry.teamMembers[0].username}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Team Format Badge */}
                      <TableCell className="py-4">
                        {isTrio ? (
                          <Badge
                            variant="outline"
                            className="bg-purple-50 text-purple-700 border-purple-200 text-xs font-semibold"
                          >
                            Active Trio (3/3)
                          </Badge>
                        ) : isDuo ? (
                          <Badge
                            variant="outline"
                            className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold"
                          >
                            Active Duo (2/2)
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-amber-50 text-amber-700 border-amber-200 text-xs font-semibold"
                          >
                            Solo Warrior
                          </Badge>
                        )}
                      </TableCell>

                      {/* Warriors Avatar Stack */}
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {entry.teamMembers?.map((member, idx) => (
                              <button
                                key={member.userId || member.id || idx}
                                type="button"
                                title={`Inspect ${member.userName || member.username}`}
                                onClick={(evt) => {
                                  evt.stopPropagation();
                                  handleOpenWarrior(member, entry);
                                }}
                                className="relative hover:z-20 hover:scale-125 transition-transform cursor-pointer rounded-full"
                              >
                                <Avatar className="h-8 w-8 border-2 border-white shadow-sm ring-1 ring-borders/60">
                                  {member.avatarUrl && <AvatarImage src={member.avatarUrl} alt={member.userName} />}
                                  <AvatarFallback className="text-xs font-bold bg-secondary-bg">
                                    {(member.userName || member.username)?.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              </button>
                            ))}
                          </div>
                          <span className="text-xs font-semibold text-secondary-text ml-1">
                            {isSolo ? 'Solo warrior' : `${entry.teamMembers?.length || 1} warriors`}
                          </span>
                        </div>
                      </TableCell>

                      {/* Pure Martial Title */}
                      <TableCell className="py-4">
                        <RankBadge rank={pureRank} size="sm" />
                      </TableCell>

                      {/* Honor Points */}
                      <TableCell className="text-right font-black text-lg text-primary-text py-4">
                        <div className="flex items-center justify-end gap-2 group-hover:scale-105 transition-transform origin-right">
                          <NinjaStarIcon className="w-5 h-5 text-japan-red" />
                          {entry.score}
                        </div>
                      </TableCell>

                      {/* Tasks Solved */}
                      <TableCell className="text-right text-muted-text font-semibold py-4 text-base">
                        {entry.tasksCompleted}
                      </TableCell>

                      {/* Action */}
                      <TableCell className="text-right py-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2.5 text-xs gap-1.5 text-muted-text hover:text-japan-red hover:bg-secondary-bg cursor-pointer font-semibold"
                          onClick={(evt: React.MouseEvent) => {
                            evt.stopPropagation();
                            handleOpenEntry(entry);
                          }}
                        >
                          {isSolo ? (
                            <>
                              <Eye className="h-3.5 w-3.5 text-japan-red" />
                              <span>Inspect</span>
                            </>
                          ) : (
                            <>
                              <Shield className="h-3.5 w-3.5 text-japan-red" />
                              <span>View Clan</span>
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Pagination / Read More Controls */}
            {totalCount > 20 && (
              <div className="p-4 bg-secondary-bg/25 border-t border-borders/60 flex flex-col sm:flex-row items-center justify-between gap-3 px-6 sm:px-8">
                <span className="text-xs text-muted-text font-medium">
                  Showing <strong className="text-primary-text">{displayedEntries.length}</strong> of{' '}
                  <strong className="text-primary-text">{totalCount}</strong> ranked teams & warriors
                </span>
                <div className="flex items-center gap-2">
                  {visibleCount < totalCount ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setVisibleCount((prev) => Math.min(prev + 20, totalCount))}
                        className="bg-white hover:bg-secondary-bg border-borders text-primary-text font-bold text-xs gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <ChevronDown className="w-4 h-4 text-japan-red" />
                        <span>Read More (+20)</span>
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setVisibleCount(totalCount)}
                        className="bg-japan-red hover:bg-dark-red text-white font-bold text-xs gap-1.5 shadow-xs cursor-pointer"
                      >
                        <span>Show All ({totalCount})</span>
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setVisibleCount(20)}
                      className="bg-white hover:bg-secondary-bg border-borders text-secondary-text hover:text-japan-red font-semibold text-xs gap-1.5 cursor-pointer"
                    >
                      <ChevronUp className="w-4 h-4" />
                      <span>Collapse to Top 20</span>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Interactive Warrior & Clan Profile Dialog */}
      <WarriorProfileDialog
        userId={selectedUserId}
        teamId={selectedTeamId}
        mode={dialogMode}
        isOpen={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedUserId(null);
          setSelectedTeamId(null);
          setSelectedPreview(null);
          setSelectedClanPreview(null);
        }}
        initialData={selectedPreview}
        initialClanData={selectedClanPreview}
      />
    </div>
  );
}
