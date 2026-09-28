'use client';

import { useUserDashboard } from '@/hooks/queries/useUser';
import { useSubmissions } from '@/hooks/queries/useSubmissions';
import { useSession } from '@/hooks/useSession';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import EmptyState from '@/components/shared/EmptyState';
import StatusBadge from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, ListChecks, Clock, Star, ArrowRight, Activity, Shield, Users, Crown, Check, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { RankConfig } from '@/types/api.types';

function NinjaStarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 1.5C12 1.5 13.5 8 17 10C19.5 11.5 22.5 12 22.5 12C22.5 12 19.5 12.5 17 14C13.5 16 12 22.5 12 22.5C12 22.5 10.5 16 7 14C4.5 12.5 1.5 12 1.5 12C1.5 12 4.5 11.5 7 10C10.5 8 12 1.5 12 1.5ZM12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" />
    </svg>
  );
}

export default function UserDashboard() {
  const { data: user } = useSession();
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useUserDashboard();
  const { data: submissions, isLoading: submissionsLoading } = useSubmissions();

  useEffect(() => {
    if (user) {
      const userRole = user.role?.trim();
      if (userRole === 'admin') router.push('/admin');
      else if (userRole === 'judge') router.push('/judge');
    }
  }, [user, router]);

  if (isLoading) return <LoadingSkeleton variant="dashboard" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  if (!data) return <EmptyState message="Failed to load dashboard data." />;

  const ranksConfig = data?.ranksConfig || [];

  const currentRankName = data.team ? data.rank : (user?.rank || data.rank || 'Ronin');
  const currentRankIndex = ranksConfig.findIndex((r: RankConfig) => r.name === currentRankName);
  const currentRankData = ranksConfig[currentRankIndex !== -1 ? currentRankIndex : 0] || { name: 'Ronin', pts: 0, desc: '', diff: 'Easy' };
  const nextRank = currentRankIndex < ranksConfig.length - 1 ? ranksConfig[currentRankIndex + 1] : null;

  const currentTaskSubmission = submissions?.find((s) => s.taskId === data.currentTask?.id);

  const currentTaskStatus: 'not_submitted' | 'pending' | 'in_review' | 'approved' | 'rejected' = (() => {
    if (currentTaskSubmission?.status) return currentTaskSubmission.status;
    if (data.currentTask?.submissionStatus) return data.currentTask.submissionStatus;
    if (data.currentTask?.status && ['pending', 'in_review', 'approved', 'rejected'].includes(data.currentTask.status)) {
      return data.currentTask.status as 'pending' | 'in_review' | 'approved' | 'rejected';
    }
    if (currentRankData?.status === 'in_review') return 'in_review';
    if (currentRankData?.status === 'rejected') return 'rejected';
    if (currentRankData?.status === 'completed') return 'approved';
    return 'not_submitted';
  })();

  const completedLevelsCount = ranksConfig.filter((r: RankConfig) => r.status === 'completed').length;
  const rankProgressPercent = (completedLevelsCount / 4) * 100;

  const rankMeta: Record<string, { subtitle: string }> = {
    Ronin: { subtitle: 'Product Vision' },
    Kenshi: { subtitle: 'Frontend Craft' },
    Samurai: { subtitle: 'Full-Stack' },
    Shogun: { subtitle: 'Production' },
  };

  const getRankIcon = (rankName: string) => {
    switch (rankName) {
      case 'Ronin': return Star;
      case 'Kenshi': return Trophy;
      case 'Samurai': return Shield;
      case 'Shogun': return Crown;
      default: return Star;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* ── Bento Banner (Hero Bento Card) ── */}
      <div className="relative overflow-hidden rounded-3xl bg-card-bg border border-borders px-6 md:px-10 py-10 md:py-14 shadow-xs">
        <div 
          className="absolute inset-0 z-0 opacity-40 pointer-events-none" 
          style={{ maskImage: 'linear-gradient(to bottom, black 60%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent)' }}
        >
          <Image src="/images/dashboard-header.png" alt="Landscape" fill className="object-cover mix-blend-multiply scale-105 grayscale contrast-125 brightness-110" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="font-serif text-3xl md:text-5xl font-bold text-primary-text drop-shadow-xs relative inline-block">
              Welcome back, {user?.fullName?.split(' ')[0] || user?.username}
              <svg className="absolute -bottom-3 left-0 w-full h-3 text-japan-red" viewBox="0 0 200 10" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 5 Q 50 10, 100 5 T 199 5" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
              </svg>
            </h1>
            <p className="text-secondary-text mt-3 font-medium text-base md:text-lg">Here&apos;s your journey overview &amp; warrior metrics.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {data.team ? (
              <div className="bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xs border border-borders/80 flex items-center gap-3">
                <Shield className="w-6 h-6 text-japan-red" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-muted-text font-bold">
                    Clan · {data.team.teamType.toUpperCase()}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-base text-primary-text truncate max-w-[140px]">{data.team.name}</span>
                    {data.team.rank > 0 && data.team.score > 0 ? (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                        #{data.team.rank}
                      </span>
                    ) : (
                      <span className="bg-secondary-bg text-muted-text text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        Ranked
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xs border border-borders/80 flex items-center gap-3">
              <NinjaStarIcon className="w-5 h-5 text-japan-red" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-muted-text font-bold">
                  {data.team ? 'Martial Title' : 'Current Rank'}
                </span>
                <span className="font-bold text-base text-primary-text">{currentRankName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Clan Standings & Intel Banner (Only for Clan Warriors) ── */}
      {data.team && (
        <div className="rounded-2xl border border-borders/80 bg-white/90 backdrop-blur-md p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-red-50 to-amber-50 border border-japan-red/30 flex items-center justify-center text-japan-red shrink-0 shadow-2xs">
              <Shield className="h-6 w-6 fill-japan-red/15" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-serif text-lg font-bold text-primary-text">
                  {data.team.name}
                </h3>
                {data.team.role === 'leader' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-800 border border-amber-200 font-bold px-2 py-0.5 rounded-full">
                    <Crown className="w-3 h-3 text-amber-600" />
                    Clan Leader
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold px-2 py-0.5 rounded-full">
                    <Users className="w-3 h-3 text-indigo-600" />
                    Clan Warrior
                  </span>
                )}
                {data.team.rank > 0 && data.team.score > 0 ? (
                  <span className="text-xs font-bold text-amber-700 font-serif">
                    Realm Rank #{data.team.rank}
                  </span>
                ) : (
                  <span className="text-xs text-muted-text font-medium">
                    Live Standings
                  </span>
                )}
              </div>
              <p className="text-xs text-secondary-text mt-0.5">
                {data.team.role === 'leader'
                  ? 'As Clan Leader, only you are authorized to submit repositories for challenge evaluations on behalf of your clan.'
                  : 'Your clan submissions are managed by your team leader. All honor points and task victories earned are credited directly to your clan.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-muted-text block">Clan Honor</span>
              <span className="font-serif font-black text-lg text-japan-red">{data.team.score} pts</span>
            </div>
            <Link
              href="/leaderboard"
              className="px-3.5 py-1.5 rounded-xl bg-secondary-bg hover:bg-white border border-borders text-xs font-bold text-primary-text hover:text-japan-red transition-all shadow-2xs"
            >
              View Standings →
            </Link>
          </div>
        </div>
      )}

      {/* ── Main Bento Grid Layout ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* Bento Tile 1: Rank Progress Timeline (Span 8) */}
        <Card className="md:col-span-8 rounded-3xl overflow-hidden border border-borders bg-card-bg shadow-xs flex flex-col justify-between hover:shadow-md transition-all duration-300 relative">
          <div 
            className="absolute -right-12 -bottom-12 w-64 h-64 opacity-5 pointer-events-none z-0"
            style={{ backgroundImage: 'radial-gradient(circle, #B93A32 10%, transparent 70%)' }}
          />
          <CardContent className="p-6 md:p-8 flex flex-col justify-between h-full relative z-10">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold tracking-widest text-japan-red uppercase font-serif">
                      Progression Path
                    </span>
                  </div>
                  <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary-text flex items-center gap-2.5">
                    <NinjaStarIcon className="w-5 h-5 text-japan-red" />
                    Level &amp; Rank Progression
                  </h2>
                </div>
                <div className="self-start sm:self-auto">
                  <span className="inline-flex items-center gap-2 text-xs font-bold text-japan-red bg-japan-red/8 px-3.5 py-1 rounded-full border border-japan-red/25 font-serif shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-japan-red animate-pulse" />
                    Tier {Math.min(currentRankIndex + 1, 4)} of 4 · {currentRankName}
                  </span>
                </div>
              </div>
              <p className="text-sm text-secondary-text max-w-xl">
                Ascend through the four sacred martial tiers. Submit challenge deliverables to the Council of Judges to unlock higher tiers.
              </p>
            </div>
            
            {/* Timeline Medallion Path */}
            <div className="relative w-full py-8 my-auto">
              {/* Connecting Path Track */}
              <div className="absolute top-[64px] left-10 sm:left-14 right-10 sm:right-14 z-0">
                <div className="w-full h-1.5 bg-[#E8E1D5] -translate-y-1/2 rounded-full" />
                <div 
                  className="absolute top-0 left-0 h-1.5 bg-gradient-to-r from-japan-red via-dark-red to-japan-red -translate-y-1/2 rounded-full transition-all duration-700 shadow-xs" 
                  style={{ width: `${Math.min(100, Math.max(0, (completedLevelsCount / 3) * 100))}%` }} 
                />
              </div>
              
              <div className="relative flex justify-between z-10 px-0 sm:px-2">
                {ranksConfig.map((rank: RankConfig, i: number) => {
                  const isCompleted = rank.status === 'completed';
                  const isCurrent = rank.status === 'current';
                  const isInReview = rank.status === 'in_review';
                  const isRejected = rank.status === 'rejected';
                  const isLocked = rank.status === 'locked' || (!isCompleted && !isCurrent && !isInReview && !isRejected);
                  const meta = rankMeta[rank.name] || { subtitle: '' };
                  const avatarPath = `/${rank.name.toLowerCase()}.png`;

                  return (
                    <div key={rank.name} className="flex flex-col items-center w-20 sm:w-28 shrink-0 group">
                      {/* Circular Medallion */}
                      <div className="relative mb-3.5">
                        <div className={cn(
                          "w-16 h-16 sm:w-[70px] sm:h-[70px] rounded-full flex items-center justify-center transition-all duration-300 relative overflow-hidden",
                          isCompleted && "bg-[#FAF7F2] border-2 border-emerald-600 ring-4 ring-emerald-500/15 shadow-sm",
                          isInReview && "bg-[#FAF7F2] border-2 border-amber-500 ring-4 ring-amber-500/20 shadow-sm",
                          isRejected && "bg-[#FAF7F2] border-2 border-rose-500 ring-4 ring-rose-500/20 shadow-sm",
                          isCurrent && "bg-white border-2 border-japan-red ring-4 ring-japan-red/20 shadow-md scale-105",
                          isLocked && "bg-[#FAF7F2]/80 border-2 border-borders/80 opacity-70 group-hover:opacity-90"
                        )}>
                          {/* Inner warrior illustration */}
                          <div className={cn(
                            "w-full h-full relative p-2 transition-transform duration-300 group-hover:scale-105",
                            isLocked && "grayscale contrast-125 opacity-35"
                          )}>
                            <Image 
                              src={avatarPath} 
                              alt={rank.name} 
                              fill 
                              className="object-contain p-1" 
                            />
                          </div>

                          {/* Subtle warm wash for current tier */}
                          {isCurrent && (
                            <div className="absolute inset-0 bg-radial from-japan-red/10 to-transparent pointer-events-none" />
                          )}
                        </div>

                        {/* Top Level Chip */}
                        <span className={cn(
                          "absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold px-2 py-0.5 rounded-full border shadow-2xs font-serif leading-none whitespace-nowrap",
                          isCompleted && "bg-card-bg border-emerald-300 text-emerald-800",
                          isCurrent && "bg-japan-red border-japan-red text-white shadow-xs",
                          isInReview && "bg-card-bg border-amber-300 text-amber-800",
                          isRejected && "bg-card-bg border-rose-300 text-rose-800",
                          isLocked && "bg-secondary-bg border-borders text-muted-text"
                        )}>
                          L{rank.level || (i + 1)}
                        </span>

                        {/* Bottom-right Status Badge */}
                        <div className="absolute -bottom-1 -right-1 z-20">
                          {isCompleted ? (
                            <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center ring-2 ring-card-bg shadow-xs">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          ) : isInReview ? (
                            <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center ring-2 ring-card-bg shadow-xs animate-pulse">
                              <Clock className="w-3 h-3 stroke-[2.5]" />
                            </div>
                          ) : isRejected ? (
                            <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center ring-2 ring-card-bg shadow-xs">
                              <AlertCircle className="w-3 h-3 stroke-[2.5]" />
                            </div>
                          ) : isCurrent ? (
                            <div className="w-5 h-5 rounded-full bg-japan-red text-white flex items-center justify-center ring-2 ring-card-bg shadow-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-secondary-bg border border-borders text-muted-text flex items-center justify-center ring-2 ring-card-bg shadow-2xs">
                              <Lock className="w-2.5 h-2.5 opacity-70" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Rank Label & Subtitle */}
                      <div className="text-center w-full">
                        <p className={cn(
                          "font-serif font-bold text-sm tracking-wide",
                          isCompleted && "text-emerald-800",
                          isCurrent && "text-japan-red font-black",
                          isInReview && "text-amber-800",
                          isRejected && "text-rose-800",
                          isLocked && "text-secondary-text"
                        )}>
                          {rank.name}
                        </p>
                        <p className="text-[10px] text-muted-text tracking-tight hidden sm:block truncate mt-0.5">
                          {meta.subtitle}
                        </p>

                        {/* Status / Requirement Indicator */}
                        <div className="mt-1 flex justify-center">
                          {isCompleted ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full shadow-2xs font-sans">
                              {rank.scoreEarned != null ? `${rank.scoreEarned} pts` : 'Mastered'}
                            </span>
                          ) : isInReview ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full shadow-2xs font-sans">
                              In Review
                            </span>
                          ) : isRejected ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full shadow-2xs font-sans">
                              Needs Fix
                            </span>
                          ) : isCurrent ? (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-japan-red bg-japan-red/8 border border-japan-red/25 px-2.5 py-0.5 rounded-full shadow-2xs font-sans">
                              <span className="w-1.5 h-1.5 rounded-full bg-japan-red animate-pulse" />
                              In Progress
                            </span>
                          ) : (
                            <span className="text-[11px] text-muted-text/80 font-medium">
                              Locked
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-borders/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-medium">
              <div className="flex items-center gap-2 flex-wrap text-secondary-text">
                <span className="text-muted-text">Active Tier:</span>
                <strong className="text-primary-text font-serif text-sm">{currentRankName}</strong>
                <span className="text-borders">·</span>
                <span className="text-muted-text">{data.team ? 'Clan Honor:' : 'Total Honor:'}</span>
                <strong className="text-japan-red font-serif text-sm">{data.totalScore || 0} pts</strong>
              </div>
              <div className="text-left sm:text-right">
                {nextRank ? (
                  <span className="text-secondary-text">
                    Next Tier: Pass <strong className="text-japan-red font-serif">{currentRankName}</strong> to ascend to <strong className="text-primary-text font-serif">{nextRank.name}</strong>
                  </span>
                ) : (
                  <span className="text-amber-800 bg-amber-50 border border-amber-200 font-serif font-bold px-3 py-1 rounded-full">
                    👑 Grandmaster Shogun · All Martial Levels Mastered
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bento Tile 2: Continue Journey OR Congratulations Card (Span 4) */}
        <Card className="md:col-span-4 rounded-3xl border border-borders bg-card-bg shadow-xs overflow-hidden relative flex flex-col justify-between hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-japan-red to-hover-red" />
          
          {/* Subtle Torii Background Blend */}
          <div 
            className="absolute -right-4 -bottom-4 w-44 h-44 opacity-15 pointer-events-none z-0"
            style={{ maskImage: 'radial-gradient(circle, black, transparent 75%)', WebkitMaskImage: 'radial-gradient(circle, black, transparent 75%)' }}
          >
            <Image 
              src="/images/landscape-torii.png" 
              alt="Torii" 
              fill 
              className="object-contain mix-blend-multiply grayscale contrast-125" 
            />
          </div>

          <CardContent className="p-6 md:p-8 flex flex-col justify-between h-full relative z-10">
            {(data.tasksAvailable ?? 0) === 0 ? (
              /* All Tasks Completed / Victory State */
              <>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-100/80 px-3 py-1 rounded-full border border-amber-200">
                      🎉 Victory
                    </span>
                    <span className="text-xs font-bold text-japan-red font-serif">
                      All Levels Completed!
                    </span>
                  </div>

                  <div className="flex items-center gap-4 my-3">
                    <div className="w-20 h-20 rounded-2xl bg-amber-50 border border-amber-200 shadow-xs shrink-0 overflow-hidden relative flex items-center justify-center text-amber-600">
                      <Trophy className="w-10 h-10 animate-bounce" />
                    </div>
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-primary-text">Grandmaster!</h3>
                      <p className="text-xs text-secondary-text mt-1 leading-relaxed">
                        You have conquered all martial levels in Journey to Mastery. Check the Hall of Masters for your final standings!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-borders/50 mt-4">
                  <Link 
                    href="/leaderboard" 
                    className="w-full py-3.5 rounded-2xl bg-japan-red text-white font-bold hover:bg-hover-red transition-all flex items-center justify-center gap-2 text-sm shadow-xs active:scale-[0.99]"
                  >
                    View Leaderboard <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </>
            ) : (
              /* Tasks Available / Active Task Goal State */
              <>
                <div className="space-y-4">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-japan-red bg-japan-red/8 px-3 py-1 rounded-full border border-japan-red/20 font-serif">
                      <NinjaStarIcon className="w-3.5 h-3.5 text-japan-red" />
                      Active Trial
                    </span>
                    <span className="text-xs font-bold text-secondary-text bg-secondary-bg/80 border border-borders/70 px-3 py-1 rounded-full font-serif">
                      {data.currentTask?.points ?? 100} pts reward
                    </span>
                  </div>

                  {/* Task Identity */}
                  <div className="flex items-center gap-4 pt-1">
                    <div className="w-20 h-20 rounded-2xl bg-[#FAF7F2] border border-borders/80 shadow-xs shrink-0 overflow-hidden relative p-1.5 group-hover:border-japan-red/40 transition-colors">
                      <Image 
                        src={`/${(data.currentTask?.title || currentRankName || 'ronin').toLowerCase().includes('ronin') ? 'ronin' : (data.currentTask?.title || currentRankName || '').toLowerCase().includes('kenshi') ? 'kenshi' : (data.currentTask?.title || currentRankName || '').toLowerCase().includes('samurai') ? 'samurai' : 'shogun'}.png`} 
                        alt={data.currentTask?.title || currentRankName || 'Task'} 
                        fill 
                        className="object-contain p-1" 
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] uppercase font-bold text-muted-text tracking-wider">
                          Level {Math.min(currentRankIndex + 1, 4)} Challenge
                        </span>
                      </div>
                      <h3 className="font-serif text-2xl font-bold text-primary-text leading-tight truncate">
                        {data.currentTask?.title || currentRankData.name}
                      </h3>
                      <p className="text-xs text-secondary-text mt-1 line-clamp-2 leading-relaxed">
                        {data.currentTask?.shortDescription || data.currentTask?.description || currentRankData.desc}
                      </p>
                    </div>
                  </div>

                  {/* Editorial Ascension Box (Japanese scroll feel) with dynamic task status */}
                  <div className={cn(
                    "border-l-3 bg-secondary-bg/60 rounded-r-2xl p-3.5 border-y border-r border-borders/60 text-xs text-secondary-text space-y-1.5 transition-colors",
                    currentTaskStatus === 'in_review' || currentTaskStatus === 'pending'
                      ? 'border-l-amber-500 bg-amber-500/[0.04]'
                      : currentTaskStatus === 'rejected'
                      ? 'border-l-rose-500 bg-rose-500/[0.04]'
                      : currentTaskStatus === 'approved'
                      ? 'border-l-emerald-600 bg-emerald-500/[0.04]'
                      : 'border-l-japan-red'
                  )}>
                    <div className="font-semibold text-primary-text flex items-center justify-between">
                      <span>Level Advancement</span>
                      {currentTaskStatus === 'in_review' || currentTaskStatus === 'pending' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/90 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          In Review
                        </span>
                      ) : currentTaskStatus === 'rejected' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200/90 shadow-2xs">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                          Needs Revision
                        </span>
                      ) : currentTaskStatus === 'approved' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/90 shadow-2xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FAF7F2] text-secondary-text border border-borders shadow-2xs">
                          <Clock className="w-3.5 h-3.5 text-muted-text" />
                          Not Submitted
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-text leading-normal">
                      {currentTaskStatus === 'in_review' || currentTaskStatus === 'pending' ? (
                        <>Repository submitted and awaiting evaluation by the judges. Once reviewed, your score and rank status will update.</>
                      ) : currentTaskStatus === 'rejected' ? (
                        <>Judge evaluation returned with feedback. Revise and resubmit your repository to earn your rank ascension.</>
                      ) : currentTaskStatus === 'approved' ? (
                        <>Trial passed! Submission approved by judges. Your rank ascends {nextRank ? <>to <strong className="text-primary-text font-serif">{nextRank.name}</strong></> : 'to the Grandmaster tier'}.</>
                      ) : (
                        <>Submit your repository for evaluation. Once approved by judges, your rank ascends {nextRank ? <>to <strong className="text-primary-text font-serif">{nextRank.name}</strong></> : 'to the Grandmaster tier'}.</>
                      )}
                    </p>
                  </div>
                </div>

                {/* Dojo CTA Button */}
                <div className="pt-6 border-t border-borders/50 mt-4">
                  <Link 
                    href={data.currentTask?.id ? `/tasks/${data.currentTask.id}` : "/tasks"} 
                    className="w-full py-3.5 rounded-2xl bg-japan-red text-white font-bold hover:bg-hover-red transition-all flex items-center justify-center gap-2 text-sm shadow-xs active:scale-[0.99] group"
                  >
                    <span>
                      {currentTaskStatus === 'in_review' || currentTaskStatus === 'pending'
                        ? 'View Submission Status'
                        : currentTaskStatus === 'rejected'
                        ? 'Revise Submission'
                        : currentTaskStatus === 'approved'
                        ? 'View Submission Details'
                        : 'Enter Challenge Dojo'}
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* ── Bento Mini Stat Tiles Row (Span 12 -> 4 x 3 col) ── */}
        
        {/* Stat 1: Total Score */}
        <Card className="md:col-span-3 rounded-3xl hover:shadow-md transition-all duration-300 border-borders bg-white/80">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center shrink-0 border border-red-100">
              <NinjaStarIcon className="h-6 w-6 text-japan-red" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-text uppercase tracking-wider">
                {data.team ? 'Clan Honor' : 'Total Honor'}
              </p>
              <p className="text-2xl font-bold text-primary-text font-serif">{data.totalScore || 0}</p>
              <p className="text-[11px] text-secondary-text mt-0.5">
                {data.team ? `${data.team.name} points` : 'Points accumulated'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stat 2: Tasks Completed */}
        <Card className="md:col-span-3 rounded-3xl hover:shadow-md transition-all duration-300 border-borders bg-white/80">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center shrink-0 border border-red-100">
              <ListChecks className="h-6 w-6 text-japan-red" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-text uppercase tracking-wider">
                {data.team ? 'Clan Tasks Solved' : 'Tasks Completed'}
              </p>
              <p className="text-2xl font-bold text-primary-text font-serif">{data.tasksCompleted || 0}</p>
              <p className="text-[11px] text-secondary-text mt-0.5">
                {data.team ? 'Approved for clan' : 'Approved solutions'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stat 3: Pending Reviews */}
        <Card className="md:col-span-3 rounded-3xl hover:shadow-md transition-all duration-300 border-borders bg-white/80">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-text uppercase tracking-wider">Pending Reviews</p>
              <p className="text-2xl font-bold text-primary-text font-serif">
                {submissions?.filter(sub => sub.status === 'pending' || sub.status === 'in_review').length ?? 0}
              </p>
              <p className="text-[11px] text-secondary-text mt-0.5">Awaiting judge review</p>
            </div>
          </CardContent>
        </Card>

        {/* Stat 4: Tasks Available */}
        <Card className="md:col-span-3 rounded-3xl hover:shadow-md transition-all duration-300 border-borders bg-white/80">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center shrink-0 border border-stone-200">
              <Trophy className="h-6 w-6 text-stone-800" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-text uppercase tracking-wider">Tasks Available</p>
              <p className="text-2xl font-bold text-primary-text font-serif">{data.tasksAvailable ?? 0}</p>
              <p className="text-[11px] text-secondary-text mt-0.5">Ready to unlock</p>
            </div>
          </CardContent>
        </Card>

        {/* Bento Tile 3: Tasks Radial Overview (Span 7) */}
        <Card className="md:col-span-7 rounded-3xl border-borders shadow-xs bg-white/80 hover:shadow-md transition-all duration-300">
          <CardHeader className="border-b border-borders/40 pb-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <NinjaStarIcon className="w-5 h-5 text-japan-red" />
                  <CardTitle className="font-serif text-lg font-bold">Tasks Breakdown</CardTitle>
                </div>
                <span className="text-xs font-semibold text-muted-text">Distribution</span>
              </div>
          </CardHeader>
          <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 md:gap-12">
             <div className="relative w-36 h-36 shrink-0">
               {(() => {
                  const available = data.tasksAvailable ?? 0;
                  const completed = data.tasksCompleted ?? 0;
                  const inProgress = submissions?.filter(sub => sub.status === 'pending' || sub.status === 'in_review').length ?? 0;
                  const actualTotal = available + completed + inProgress;
                  const totalForMath = actualTotal || 1;
                  
                  const r = 40;
                  const circ = 2 * Math.PI * r;
                  
                  const availPct = available / totalForMath;
                  const inProgPct = inProgress / totalForMath;
                  const compPct = completed / totalForMath;

                  const availRot = -90;
                  const inProgRot = availRot + (availPct * 360);
                  const compRot = inProgRot + (inProgPct * 360);

                  return (
                    <>
                      <svg className="w-full h-full drop-shadow-xs" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r={r} stroke="currentColor" strokeWidth="12" fill="transparent" className="text-secondary-bg" />
                        <circle cx="50" cy="50" r={r} stroke="#111111" strokeWidth="12" fill="transparent" className="transition-all duration-1000" 
                          strokeDasharray={`${availPct * circ} ${circ}`} 
                          transform={`rotate(${availRot} 50 50)`} 
                        />
                        <circle cx="50" cy="50" r={r} stroke="#D4AF37" strokeWidth="12" fill="transparent" className="transition-all duration-1000" 
                          strokeDasharray={`${inProgPct * circ} ${circ}`} 
                          transform={`rotate(${inProgRot} 50 50)`} 
                        />
                        <circle cx="50" cy="50" r={r} stroke="#B93A32" strokeWidth="12" fill="transparent" className="transition-all duration-1000" 
                          strokeDasharray={`${compPct * circ} ${circ}`} 
                          transform={`rotate(${compRot} 50 50)`} 
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                         <span className="text-3xl font-bold font-serif text-primary-text">{actualTotal}</span>
                         <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text">Total</span>
                      </div>
                    </>
                  );
               })()}
             </div>

             <div className="flex-1 w-full space-y-3.5">
               <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200/60 text-sm">
                 <div className="flex items-center gap-2.5">
                   <div className="w-3 h-3 rounded-md shadow-xs" style={{ backgroundColor: '#111111' }} />
                   <span className="font-semibold text-primary-text">Available</span>
                 </div>
                 <span className="font-bold text-base font-serif">{data.tasksAvailable ?? 0}</span>
               </div>
               <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/50 border border-amber-200/60 text-sm">
                 <div className="flex items-center gap-2.5">
                   <div className="w-3 h-3 rounded-md shadow-xs" style={{ backgroundColor: '#D4AF37' }} />
                   <span className="font-semibold text-primary-text">In Review</span>
                 </div>
                 <span className="font-bold text-base font-serif">{submissions?.filter(sub => sub.status === 'pending' || sub.status === 'in_review').length ?? 0}</span>
               </div>
               <div className="flex items-center justify-between p-2.5 rounded-xl bg-red-50/50 border border-red-200/60 text-sm">
                 <div className="flex items-center gap-2.5">
                   <div className="w-3 h-3 rounded-md shadow-xs" style={{ backgroundColor: '#B93A32' }} />
                   <span className="font-semibold text-primary-text">Completed</span>
                 </div>
                 <span className="font-bold text-base font-serif">{data.tasksCompleted ?? 0}</span>
               </div>
             </div>
          </CardContent>
        </Card>

        {/* Bento Tile 4: Recent Submissions Feed (Span 5) */}
        <Card className="md:col-span-5 rounded-3xl border-borders shadow-xs bg-white/80 hover:shadow-md transition-all duration-300">
          <CardHeader className="border-b border-borders/40 pb-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <NinjaStarIcon className="w-5 h-5 text-japan-red" />
                  <CardTitle className="font-serif text-lg font-bold">Submissions</CardTitle>
                </div>
                <Link href="/submissions" className="text-xs font-bold text-japan-red hover:underline">View All →</Link>
              </div>
          </CardHeader>
          <CardContent className="p-4">
            {submissionsLoading ? (
              <div className="space-y-2"><div className="h-10 bg-borders animate-pulse rounded-2xl" /></div>
            ) : !submissions || submissions.length === 0 ? (
              <EmptyState icon="inbox" message="No submissions yet." />
            ) : (
              <div className="space-y-2.5">
                {submissions.slice(0, 2).map((sub) => (
                  <Link key={sub.id} href={`/submissions/${sub.id}`} className="block">
                    <div className="p-3.5 rounded-2xl border border-borders/80 bg-card-bg hover:border-japan-red/50 hover:shadow-xs transition-all">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-bold text-sm text-primary-text truncate max-w-[200px]">{sub.taskTitle || 'Task Submission'}</p>
                        <StatusBadge status={sub.status} />
                      </div>
                      <p className="text-[11px] text-muted-text truncate">{sub.repoName || sub.repoUrl}</p>
                      <p className="text-[10px] text-secondary-text mt-1">{new Date(sub.submittedAt).toLocaleDateString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bento Tile 5: Recent Activity (Span 7) */}
        <Card className="md:col-span-7 rounded-3xl border-borders shadow-xs bg-white/80 hover:shadow-md transition-all duration-300">
          <CardHeader className="border-b border-borders/40 pb-4">
             <div className="flex items-center gap-2.5">
               <NinjaStarIcon className="w-5 h-5 text-japan-red" />
               <CardTitle className="font-serif text-lg font-bold">Recent Activity</CardTitle>
             </div>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {(!submissions || submissions.length === 0) ? (
              <div className="text-sm text-muted-text text-center py-4">No recent activity logged.</div>
            ) : (
              submissions.slice(0, 3).map((sub) => (
                <div key={sub.id} className="flex items-center gap-4">
                  <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border", 
                    sub.status === 'approved' ? "bg-red-50 text-japan-red border-japan-red/20" :
                    sub.status === 'rejected' ? "bg-secondary-bg text-primary-text border-borders" :
                    "bg-amber-50 text-amber-600 border-amber-200"
                  )}>
                    {sub.status === 'approved' ? <ListChecks className="w-5 h-5" /> : 
                     sub.status === 'rejected' ? <Activity className="w-5 h-5" /> :
                     <Clock className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-primary-text truncate">
                      {sub.status === 'approved' ? 'Submission approved!' : 
                       sub.status === 'rejected' ? 'Submission rejected' :
                       'Submission pending review'}
                    </p>
                    <p className="text-xs text-muted-text truncate">{sub.taskTitle || 'Unknown Task'}</p>
                  </div>
                  <span className="text-[11px] font-medium text-muted-text whitespace-nowrap">
                    {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : 'Just now'}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Bento Tile 6: Samurai Inspirational Quote Banner (Span 5) */}
        <Card className="md:col-span-5 rounded-3xl overflow-hidden border-borders shadow-xs relative min-h-[170px] bg-white group hover:shadow-md transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-0 z-0 opacity-80 mix-blend-multiply flex justify-end">
            <Image 
              src="/images/ninja-kneeling.png" 
              alt="Ninja" 
              width={260} 
              height={180} 
              className="object-contain object-bottom-right group-hover:scale-105 transition-transform duration-700 grayscale contrast-125 brightness-110" 
            />
          </div>
          <div className="relative z-20 p-6 h-full flex flex-col justify-center max-w-[220px]">
            <h3 className="font-marker text-xl md:text-2xl font-bold text-primary-text leading-tight uppercase">
              DISCIPLINE TODAY, <br/><span className="text-japan-red">MASTERY TOMORROW.</span>
            </h3>
            <div className="w-10 h-1 bg-japan-red rounded-full mt-2.5" />
          </div>
        </Card>

      </div>
    </div>
  );
}
