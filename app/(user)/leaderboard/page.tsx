'use client';

import { useState } from 'react';
import { useLeaderboard, useTeamLeaderboard } from '@/hooks/queries/useLeaderboard';
import { useSession } from '@/hooks/useSession';
import { useTeamDetail } from '@/hooks/queries/useTeam';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import RankBadge from '@/components/shared/RankBadge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Crown, Medal, Swords, Sparkles, Users, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

function NinjaStarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 1.5C12 1.5 13.5 8 17 10C19.5 11.5 22.5 12 22.5 12C22.5 12 19.5 12.5 17 14C13.5 16 12 22.5 12 22.5C12 22.5 10.5 16 7 14C4.5 12.5 1.5 12 1.5 12C1.5 12 4.5 11.5 7 10C10.5 8 12 1.5 12 1.5ZM12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" />
    </svg>
  );
}

export default function LeaderboardPage() {
  const { data: entries, isLoading, isError, error, refetch } = useLeaderboard();
  const { data: teamEntries, isLoading: isTeamLoading } = useTeamLeaderboard();
  const { data: currentUser } = useSession();
  const { data: myTeam } = useTeamDetail();
  const [activeView, setActiveView] = useState<'individual' | 'teams'>('individual');

  if (isLoading) return <LoadingSkeleton variant="table" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-card-bg border border-borders px-8 py-12 md:py-16 shadow-sm">
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" style={{ maskImage: 'linear-gradient(to bottom, black 50%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent)' }}>
          <Image src="/images/dashboard-header.png" alt="Landscape" fill className="object-cover mix-blend-multiply grayscale contrast-125 brightness-110" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary-text drop-shadow-sm flex items-center gap-3">
              <NinjaStarIcon className="h-10 w-10 text-japan-red" />
              Hall of Masters
            </h1>
            <p className="text-secondary-text mt-4 font-medium text-lg">Top warriors ranked by honor and glory. Live rankings.</p>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 mt-6">
        <button
          onClick={() => setActiveView('individual')}
          className={cn(
            'px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200',
            activeView === 'individual'
              ? 'bg-japan-red text-white shadow-md'
              : 'bg-white text-secondary-text border border-borders hover:bg-off-white'
          )}
        >
          <span className="flex items-center gap-2"><Trophy className="w-4 h-4" /> Individual</span>
        </button>
        <button
          onClick={() => setActiveView('teams')}
          className={cn(
            'px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200',
            activeView === 'teams'
              ? 'bg-japan-red text-white shadow-md'
              : 'bg-white text-secondary-text border border-borders hover:bg-off-white'
          )}
        >
          <span className="flex items-center gap-2"><Users className="w-4 h-4" /> Clan Rankings</span>
        </button>
      </div>

      {activeView === 'individual' ? (
      <>

      {/* Compact Top 3 podium */}
      {entries && entries.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mt-8 max-w-5xl mx-auto px-4">
          {[entries[1], entries[0], entries[2]].map((entry, i) => {
            const position = i === 0 ? 2 : i === 1 ? 1 : 3;
            
            // Unified theme gradients for the medals/accents
            const rankGradients = [
              'from-slate-200 to-slate-400 shadow-slate-300/50', // Silver
              'from-yellow-300 to-amber-500 shadow-amber-400/50', // Gold
              'from-orange-300 to-orange-600 shadow-orange-500/50'  // Bronze
            ];
            
            const borderColors = [
              'border-slate-300',
              'border-amber-400',
              'border-orange-400'
            ];
            
            const Icons = [Medal, Crown, Swords];
            const PosIcon = Icons[i];

            return (
              <div key={entry.userId} className={cn(
                'relative flex items-center p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-borders shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 group',
                position === 1 ? 'md:-translate-y-4 shadow-md ring-2 ring-amber-400/20' : ''
              )}>
                
                {/* Rank Badge */}
                <div className={cn(
                  "absolute -top-3 -left-3 flex items-center justify-center rounded-full bg-gradient-to-br border-2 border-white shadow-sm z-20",
                  rankGradients[i],
                  position === 1 ? "w-10 h-10" : "w-8 h-8"
                )}>
                  <PosIcon className="w-4 h-4 text-white drop-shadow-sm" />
                </div>
                
                {/* Avatar */}
                <div className="relative mr-4 shrink-0">
                  {position === 1 && (
                    <div className="absolute inset-0 rounded-full bg-amber-400/30 animate-ping" />
                  )}
                  <Avatar className={cn(
                    "border-2 shadow-sm relative z-10", 
                    borderColors[i],
                    position === 1 ? "h-16 w-16" : "h-14 w-14"
                  )}>
                    {entry.avatarUrl && <AvatarImage src={entry.avatarUrl} />}
                    <AvatarFallback className="text-xl font-serif font-bold text-japan-red">{entry.userName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
                
                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg text-primary-text truncate group-hover:text-japan-red transition-colors">{entry.userName}</p>
                  <div className="flex items-center gap-1.5 mt-1 text-sm font-bold text-primary-text">
                     <NinjaStarIcon className="w-3.5 h-3.5 text-japan-red" />
                     {entry.score} <span className="text-muted-text font-medium">pts</span>
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
      )}

      {/* Full Table */}
      <Card className="border-borders shadow-lg bg-card-bg overflow-hidden mt-12 rounded-2xl">
        <CardHeader className="border-b border-borders/50 bg-secondary-bg/30 flex flex-row items-center justify-between py-6 px-8">
          <CardTitle className="font-serif text-2xl flex items-center gap-3">
            <Trophy className="w-6 h-6 text-japan-red" />
            Hall of Masters
          </CardTitle>
          <div className="px-4 py-1.5 bg-white border border-borders text-primary-text shadow-sm rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {entries?.length || 0} Ranked Warriors
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-secondary-bg/20">
              <TableRow className="hover:bg-transparent border-borders/50">
                <TableHead className="w-24 text-center font-bold text-muted-text">Rank</TableHead>
                <TableHead className="font-bold text-muted-text">Warrior</TableHead>
                <TableHead className="font-bold text-muted-text">Current Title</TableHead>
                <TableHead className="text-right font-bold text-muted-text">Honor Points</TableHead>
                <TableHead className="text-right font-bold text-muted-text">Tasks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries?.map((entry) => (
                <TableRow
                  key={entry.userId}
                  className={cn(
                    "transition-all duration-300 border-borders/50 group cursor-default",
                    currentUser?.id === entry.userId 
                      ? 'bg-japan-red/[0.03] border-l-4 border-l-japan-red hover:bg-japan-red/[0.05]' 
                      : 'hover:bg-secondary-bg/40'
                  )}
                >
                  <TableCell className="font-bold text-center py-4">
                    {entry.rank <= 3 ? (
                      <span className={cn(
                        "inline-flex items-center justify-center w-10 h-10 rounded-full text-white font-black text-lg shadow-lg group-hover:scale-110 transition-transform",
                        entry.rank === 1 ? "bg-gradient-to-br from-yellow-300 to-amber-600 ring-4 ring-amber-100" :
                        entry.rank === 2 ? "bg-gradient-to-br from-slate-200 to-slate-500 ring-4 ring-slate-100" :
                        "bg-gradient-to-br from-orange-300 to-orange-700 ring-4 ring-orange-100"
                      )}>
                        {entry.rank}
                      </span>
                    ) : (
                      <span className="text-muted-text font-serif text-xl font-bold group-hover:text-primary-text transition-colors">#{entry.rank}</span>
                    )}
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-4">
                      <Avatar className={cn(
                        "h-12 w-12 border-2 shadow-sm group-hover:shadow-md transition-shadow", 
                        currentUser?.id === entry.userId ? 'border-japan-red' : 'border-borders'
                      )}>
                        {entry.avatarUrl && <AvatarImage src={entry.avatarUrl} />}
                        <AvatarFallback className="font-serif font-bold text-lg">{entry.userName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className={cn(
                          'text-base', 
                          currentUser?.id === entry.userId ? 'font-bold text-japan-red' : 'font-bold text-primary-text'
                        )}>
                          {entry.userName}
                        </span>
                        {currentUser?.id === entry.userId && (
                          <span className="text-[10px] text-japan-red uppercase tracking-widest font-black mt-0.5">You</span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4"><RankBadge rank={entry.userRank} size="sm" /></TableCell>
                  <TableCell className="text-right font-black text-lg text-primary-text py-4">
                    <div className="flex items-center justify-end gap-2 group-hover:scale-105 transition-transform origin-right">
                      <NinjaStarIcon className="w-5 h-5 text-japan-red" />
                      {entry.score}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-muted-text font-semibold py-4 text-base">{entry.tasksCompleted}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </>
      ) : (
      /* ═══════ TEAM LEADERBOARD ═══════ */
      <>
        {isTeamLoading ? (
          <LoadingSkeleton variant="table" />
        ) : !teamEntries || teamEntries.length === 0 ? (
          <Card className="border-borders shadow-sm bg-white mt-8 rounded-2xl">
            <CardContent className="py-16 text-center">
              <Users className="w-12 h-12 text-borders mx-auto mb-4" />
              <h3 className="text-lg font-bold text-primary-text mb-2">No Clans Ranked Yet</h3>
              <p className="text-secondary-text text-sm">Teams will appear here once they start earning points through submissions.</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-borders shadow-lg bg-card-bg overflow-hidden mt-8 rounded-2xl">
            <CardHeader className="border-b border-borders/50 bg-secondary-bg/30 flex flex-row items-center justify-between py-6 px-8">
              <CardTitle className="font-serif text-2xl flex items-center gap-3">
                <Shield className="w-6 h-6 text-japan-red" />
                Clan Rankings
              </CardTitle>
              <div className="px-4 py-1.5 bg-white border border-borders text-primary-text shadow-sm rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                {teamEntries.length} Ranked Clans
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-secondary-bg/20">
                  <TableRow className="hover:bg-transparent border-borders/50">
                    <TableHead className="w-24 text-center font-bold text-muted-text">Rank</TableHead>
                    <TableHead className="font-bold text-muted-text">Clan</TableHead>
                    <TableHead className="font-bold text-muted-text">Members</TableHead>
                    <TableHead className="text-right font-bold text-muted-text">Honor Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamEntries.map((team) => (
                    <TableRow
                      key={team.teamId}
                      className={cn(
                        "transition-all duration-300 border-borders/50 group cursor-default",
                        myTeam?.id === team.teamId
                          ? 'bg-japan-red/[0.03] border-l-4 border-l-japan-red hover:bg-japan-red/[0.05]'
                          : 'hover:bg-secondary-bg/40'
                      )}
                    >
                      <TableCell className="font-bold text-center py-4">
                        {team.rank <= 3 ? (
                          <span className={cn(
                            "inline-flex items-center justify-center w-10 h-10 rounded-full text-white font-black text-lg shadow-lg group-hover:scale-110 transition-transform",
                            team.rank === 1 ? "bg-gradient-to-br from-yellow-300 to-amber-600 ring-4 ring-amber-100" :
                            team.rank === 2 ? "bg-gradient-to-br from-slate-200 to-slate-500 ring-4 ring-slate-100" :
                            "bg-gradient-to-br from-orange-300 to-orange-700 ring-4 ring-orange-100"
                          )}>
                            {team.rank}
                          </span>
                        ) : (
                          <span className="text-muted-text font-serif text-xl font-bold group-hover:text-primary-text transition-colors">#{team.rank}</span>
                        )}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-lg shadow-sm",
                            myTeam?.id === team.teamId ? 'border-japan-red bg-red-50 text-japan-red' : 'border-borders bg-white text-primary-text'
                          )}>
                            {team.teamName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className={cn(
                              'text-base font-bold',
                              myTeam?.id === team.teamId ? 'text-japan-red' : 'text-primary-text'
                            )}>
                              {team.teamName}
                            </span>
                            {myTeam?.id === team.teamId && (
                              <span className="text-[10px] text-japan-red uppercase tracking-widest font-black mt-0.5">Your Clan</span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex -space-x-2">
                          {team.members?.slice(0, 3).map((member, idx) => (
                            <Avatar key={member.userId} className="h-8 w-8 border-2 border-white shadow-sm" title={member.userName}>
                              {member.avatarUrl && <AvatarImage src={member.avatarUrl} />}
                              <AvatarFallback className="text-xs font-bold">{member.userName?.charAt(0)}</AvatarFallback>
                            </Avatar>
                          ))}
                          <span className="flex items-center justify-center text-xs font-bold text-secondary-text ml-3">
                            {team.memberCount} members
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-black text-lg text-primary-text py-4">
                        <div className="flex items-center justify-end gap-2 group-hover:scale-105 transition-transform origin-right">
                          <NinjaStarIcon className="w-5 h-5 text-japan-red" />
                          {team.score}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </>
      )}
    </div>
  );
}
