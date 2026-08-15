'use client';

import { useUserDashboard } from '@/hooks/queries/useUser';
import { useSubmissions } from '@/hooks/queries/useSubmissions';
import { useSession } from '@/hooks/useSession';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import EmptyState from '@/components/shared/EmptyState';
import StatusBadge from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, ListChecks, Clock, Star, ArrowRight, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

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

  const currentRankName = user?.rank || 'Ronin';
  const currentRankIndex = ranksConfig.findIndex((r: any) => r.name === currentRankName);
  const currentRankData = ranksConfig[currentRankIndex !== -1 ? currentRankIndex : 0] || { name: 'Ronin', pts: 0, desc: '', diff: 'Easy' };
  const nextRank = currentRankIndex < ranksConfig.length - 1 ? ranksConfig[currentRankIndex + 1] : null;
  const rankProgressPercent = currentRankIndex === -1 ? 0 : (currentRankIndex / Math.max(ranksConfig.length - 1, 1)) * 100;

  const getRankIcon = (rankName: string) => {
    switch (rankName) {
      case 'Ronin': return Star;
      case 'Kenshi': return Trophy;
      case 'Samurai': return ListChecks;
      case 'Shogun': return Star;
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
          
          <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xs border border-borders/80 flex items-center gap-3">
             <NinjaStarIcon className="w-5 h-5 text-japan-red" />
             <div className="flex flex-col">
               <span className="text-[10px] uppercase tracking-wider text-muted-text font-bold">Current Rank</span>
               <span className="font-bold text-base text-primary-text">{user?.rank || 'Ronin'}</span>
             </div>
          </div>
        </div>
      </div>

      {/* ── Main Bento Grid Layout ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* Bento Tile 1: Rank Progress Timeline (Span 8) */}
        <Card className="md:col-span-8 rounded-3xl overflow-hidden border-borders shadow-xs bg-white/70 backdrop-blur-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
          <CardContent className="p-6 md:p-8 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <NinjaStarIcon className="w-6 h-6 text-japan-red" />
                  <h2 className="font-serif text-xl font-bold text-primary-text">Rank Progress</h2>
                </div>
                <span className="text-xs font-bold text-muted-text uppercase tracking-wider bg-secondary-bg/80 px-3 py-1 rounded-full border border-borders">
                  {Math.round(rankProgressPercent)}% Complete
                </span>
              </div>
              <p className="text-sm text-secondary-text mb-6">Complete tasks to accumulate points and elevate your warrior rank.</p>
            </div>
            
            {/* Timeline Bar */}
            <div className="relative w-full py-6 my-auto">
              <div className="absolute top-12 left-10 right-10 z-0">
                <div className="w-full h-1.5 bg-borders -translate-y-1/2 rounded-full" />
                <div 
                  className="absolute top-0 left-0 h-1.5 bg-japan-red -translate-y-1/2 rounded-full transition-all duration-1000" 
                  style={{ width: `${rankProgressPercent}%` }} 
                />
              </div>
              
              <div className="relative flex justify-between z-10">
                {ranksConfig.map((rank: any, i: number) => {
                  const isActive = i <= currentRankIndex;
                  const Icon = getRankIcon(rank.name);
                  return (
                    <div key={rank.name} className="flex flex-col items-center w-20 shrink-0">
                      <div className={cn(
                        "w-11 h-11 rounded-2xl flex items-center justify-center border-2 transition-all bg-white mb-2 shadow-xs",
                        isActive ? "border-japan-red text-japan-red ring-4 ring-japan-red/10" : "border-borders text-muted-text opacity-70"
                      )}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="text-center w-full">
                        <p className={cn("font-bold text-xs md:text-sm", isActive ? "text-japan-red" : "text-secondary-text")}>{rank.name}</p>
                        <p className="text-[11px] text-muted-text mt-0.5">{i === currentRankIndex ? 'Current' : `${rank.pts} pts`}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-borders/40 flex items-center justify-between text-xs text-muted-text font-medium">
              <span>Current: <strong className="text-primary-text">{currentRankIndex >= 0 ? ranksConfig[currentRankIndex]?.pts : 0} pts</strong></span>
              <span>Next Rank: <strong className="text-primary-text">{nextRank ? `${nextRank.pts} pts` : 'Maxed Out'}</strong></span>
            </div>
          </CardContent>
        </Card>

        {/* Bento Tile 2: Continue Journey OR Congratulations Card (Span 4) */}
        <Card className="md:col-span-4 rounded-3xl border-borders shadow-xs bg-white/80 overflow-hidden relative flex flex-col justify-between hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-japan-red" />
          <CardContent className="p-6 md:p-8 flex flex-col justify-between h-full">
            {(data.tasksAvailable ?? 0) === 0 ? (
              /* All Tasks Completed / Victory State */
              <>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-100/80 px-3 py-1 rounded-full border border-amber-200">
                      🎉 Victory
                    </span>
                    <span className="text-xs font-bold text-japan-red font-serif">
                      All Tasks Completed!
                    </span>
                  </div>

                  <div className="flex items-center gap-4 my-3">
                    <div className="w-20 h-20 rounded-2xl bg-amber-50 border border-amber-200 shadow-xs shrink-0 overflow-hidden relative flex items-center justify-center text-amber-600">
                      <Trophy className="w-10 h-10 animate-bounce" />
                    </div>
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-primary-text">Congratulations!</h3>
                      <p className="text-xs text-secondary-text mt-1 leading-relaxed">
                        You have completed all available tasks in Journey to Mastery. Check the Hall of Masters for your rank!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-borders/50 mt-4">
                  <Link href="/leaderboard" className="block w-full">
                    <button className="w-full py-3 rounded-2xl bg-japan-red text-white font-bold hover:bg-japan-red/90 transition-all flex items-center justify-center gap-2 text-sm shadow-xs active:scale-[0.99]">
                      View Leaderboard <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </>
            ) : (
              /* Tasks Available / Next Goal State */
              <>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-japan-red bg-japan-red/10 px-3 py-1 rounded-full border border-japan-red/20">
                      {nextRank?.diff || currentRankData.diff || 'Active'}
                    </span>
                    <span className="text-xs font-bold text-secondary-text font-serif">
                      {nextRank ? `${nextRank.pts} pts goal` : 'Active Goal'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 my-3">
                    <div className="w-20 h-20 rounded-2xl bg-secondary-bg/50 border border-borders shadow-xs shrink-0 overflow-hidden relative">
                      <Image 
                        src={`/${(nextRank?.name || currentRankName).toLowerCase()}.png`} 
                        alt={nextRank?.name || currentRankName} 
                        fill 
                        className="object-contain p-2" 
                      />
                    </div>
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-primary-text">{nextRank?.name || currentRankData.name}</h3>
                      <p className="text-xs text-muted-text mt-1 line-clamp-2">{nextRank?.desc || currentRankData.desc}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-borders/50 mt-4">
                  <Link href="/tasks" className="block w-full">
                    <button className="w-full py-3 rounded-2xl bg-japan-red text-white font-bold hover:bg-japan-red/90 transition-all flex items-center justify-center gap-2 text-sm shadow-xs active:scale-[0.99]">
                      View Available Tasks ({data.tasksAvailable}) <ArrowRight className="w-4 h-4" />
                    </button>
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
              <p className="text-[10px] font-bold text-muted-text uppercase tracking-wider">Total Honor</p>
              <p className="text-2xl font-bold text-primary-text font-serif">{data.totalScore || 0}</p>
              <p className="text-[11px] text-secondary-text mt-0.5">Points accumulated</p>
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
              <p className="text-[10px] font-bold text-muted-text uppercase tracking-wider">Tasks Completed</p>
              <p className="text-2xl font-bold text-primary-text font-serif">{data.tasksCompleted || 0}</p>
              <p className="text-[11px] text-secondary-text mt-0.5">Approved solutions</p>
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
