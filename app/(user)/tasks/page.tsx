'use client';

import { useState } from 'react';
import { useTasks, useTaskCategories, useCompletedTasks, usePendingTasks } from '@/hooks/queries/useTasks';
import { useDebounce } from '@/hooks/useDebounce';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import EmptyState from '@/components/shared/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Clock, 
  Hourglass, 
  CheckCircle2, 
  Trophy, 
  Activity, 
  Globe, 
  GitBranch, 
  GitFork, 
  ChevronDown, 
  Check, 
  Layers 
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { Difficulty, Task, Submission } from '@/types/api.types';
import { WEB3_TASK_TYPES } from '@/types/api.types';

const difficultyColors: Record<Difficulty, string> = {
  easy: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  medium: 'bg-amber-50 text-amber-600 border-amber-200',
  hard: 'bg-red-50 text-red-600 border-red-200',
};

function NinjaStarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 1.5C12 1.5 13.5 8 17 10C19.5 11.5 22.5 12 22.5 12C22.5 12 19.5 12.5 17 14C13.5 16 12 22.5 12 22.5C12 22.5 10.5 16 7 14C4.5 12.5 1.5 12 1.5 12C1.5 12 4.5 11.5 7 10C10.5 8 12 1.5 12 1.5ZM12 15C13.6569 15 15 13.6569 15 12C15 10.3431 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" />
    </svg>
  );
}

const getAvatarForTask = (task: Task, index: number) => {
  const rankAvatars: Record<string, string> = {
    Ronin: '/ronin.png',
    Kenshi: '/kenshi.png',
    Samurai: '/samurai.png',
    Shogun: '/shogun.png',
  };
  
  if (task.rankRequired && rankAvatars[task.rankRequired]) {
    return rankAvatars[task.rankRequired];
  }
  
  const levelAvatars = ['/ronin.png', '/kenshi.png', '/samurai.png', '/shogun.png'];
  return levelAvatars[index % levelAvatars.length];
};

const landscapes = ['/images/landscape-torii.png', '/images/landscape-temple.png'];

export default function TasksPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [track, setTrack] = useState<'all' | 'main' | 'web3'>('all');
  const [taskType, setTaskType] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [tab, setTab] = useState('all');

  const { data: categories } = useTaskCategories();
  const { data: availableTasks, isLoading: isAvailLoading, isError, error, refetch } = useTasks({
    track: track === 'all' ? undefined : track,
    taskType: taskType || undefined,
    search: debouncedSearch || undefined,
    category: category || undefined,
    difficulty: difficulty || undefined,
  });

  const { data: completedSubmissions, isLoading: isCompLoading } = useCompletedTasks();
  const { data: pendingSubmissions, isLoading: isPendLoading } = usePendingTasks();

  const isLoading = isAvailLoading || isCompLoading || isPendLoading;

  const completedTasks = completedSubmissions?.map((s) => s.task as Task) || [];
  const pendingTasks = pendingSubmissions?.map((s) => s.task as Task) || [];

  const filterTasks = (taskList: Task[]) => {
    return taskList.filter((t) => {
      if (track !== 'all' && (t.track || 'main') !== track) return false;
      if (taskType && t.taskType !== taskType) return false;
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (category && t.category !== category) return false;
      if (difficulty && t.difficulty !== difficulty) return false;
      return true;
    });
  };

  let tasks: Task[] = [];
  if (tab === 'all') {
    tasks = availableTasks || [];
  } else if (tab === 'pending') {
    tasks = filterTasks(pendingTasks);
  } else if (tab === 'completed') {
    tasks = filterTasks(completedTasks);
  }

  if (isLoading) return <LoadingSkeleton variant="card-grid" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-in">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-card-bg border border-borders px-8 py-10 md:py-16 shadow-sm">
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" style={{ maskImage: 'linear-gradient(to bottom, black 60%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent)' }}>
          <Image src="/images/dashboard-header.png" alt="Landscape" fill className="object-cover mix-blend-multiply scale-105 grayscale contrast-125 brightness-110" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary-text drop-shadow-sm flex items-center gap-3">
              <NinjaStarIcon className="h-10 w-10 text-japan-red" />
              The Training Grounds
            </h1>
            <p className="text-secondary-text mt-4 font-medium text-lg">Browse challenges across the Martial Journey and the Web3 Track to earn honor points.</p>
          </div>
        </div>
      </div>

      {/* Unified Filters & Track Control Center */}
      <div className="bg-card-bg/95 backdrop-blur-sm border border-borders rounded-2xl p-5 shadow-sm space-y-4 font-sans">
        {/* Row 1: Track Switcher & Navigation */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3.5 border-b border-borders/60">
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 h-10 px-3.5 rounded-lg border border-borders bg-white hover:bg-secondary-bg/80 text-primary-text font-sans text-sm font-semibold shadow-xs transition-colors cursor-pointer group focus:outline-none focus:ring-1 focus:ring-japan-red/40"
                >
                  <GitBranch className="w-4 h-4 text-japan-red" />
                  <span className="text-secondary-text font-normal">Track:</span>
                  <span className="text-primary-text font-bold">
                    {track === 'main' ? 'Main Line' : track === 'web3' ? 'Web3 Track' : 'All Tracks'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted-text ml-0.5 group-hover:text-primary-text transition-colors" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-80 p-1.5 bg-white border border-borders shadow-lg rounded-xl z-50 font-sans">
                <div className="px-3 py-2 border-b border-borders/60 text-xs font-semibold text-secondary-text flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <GitBranch className="w-3.5 h-3.5 text-japan-red" />
                    <span>Switch Track</span>
                  </div>
                  <span className="text-xs text-muted-text font-normal">2 active tracks</span>
                </div>

                <div className="py-1 space-y-1">
                  {/* main */}
                  <DropdownMenuItem
                    onClick={() => {
                      setTrack('main');
                      setTaskType('');
                    }}
                    className={cn(
                      "flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-colors outline-none",
                      track === 'main' ? "bg-secondary-bg/80 text-primary-text" : "hover:bg-secondary-bg/50 text-secondary-text"
                    )}
                  >
                    <div className="w-4 h-4 mt-0.5 shrink-0 flex items-center justify-center">
                      {track === 'main' ? <Check className="w-4 h-4 text-japan-red" /> : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-primary-text">Main Line</span>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-secondary-bg text-secondary-text border border-borders/60">
                          Martial
                        </span>
                      </div>
                      <p className="text-xs text-muted-text mt-0.5">
                        Core rank journey: Ronin → Kenshi → Samurai → Shogun
                      </p>
                    </div>
                  </DropdownMenuItem>

                  {/* web3 */}
                  <DropdownMenuItem
                    onClick={() => {
                      setTrack('web3');
                      setCategory('');
                    }}
                    className={cn(
                      "flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-colors outline-none",
                      track === 'web3' ? "bg-secondary-bg/80 text-primary-text" : "hover:bg-secondary-bg/50 text-secondary-text"
                    )}
                  >
                    <div className="w-4 h-4 mt-0.5 shrink-0 flex items-center justify-center">
                      {track === 'web3' ? <Check className="w-4 h-4 text-japan-red" /> : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-primary-text">Web3 Track</span>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-secondary-bg text-secondary-text border border-borders/60">
                          Side Quest
                        </span>
                      </div>
                      <p className="text-xs text-muted-text mt-0.5">
                        Smart contracts, DeFi, Rust & bounties (open to all ranks)
                      </p>
                    </div>
                  </DropdownMenuItem>

                  {/* all */}
                  <DropdownMenuItem
                    onClick={() => {
                      setTrack('all');
                      setTaskType('');
                    }}
                    className={cn(
                      "flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-colors outline-none",
                      track === 'all' ? "bg-secondary-bg/80 text-primary-text" : "hover:bg-secondary-bg/50 text-secondary-text"
                    )}
                  >
                    <div className="w-4 h-4 mt-0.5 shrink-0 flex items-center justify-center">
                      {track === 'all' ? <Check className="w-4 h-4 text-japan-red" /> : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-primary-text">All Tracks</span>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-secondary-bg text-secondary-text border border-borders/60">
                          Combined
                        </span>
                      </div>
                      <p className="text-xs text-muted-text mt-0.5">
                        Unified view showing challenges across all tracks
                      </p>
                    </div>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-text">
              <GitFork className="w-3.5 h-3.5" />
              <span>2 tracks</span>
            </div>
          </div>

          {/* Quick Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-secondary-bg rounded-lg border border-borders/60 self-start sm:self-auto font-sans">
            <button
              type="button"
              onClick={() => {
                setTrack('main');
                setTaskType('');
              }}
              className={cn(
                "px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer",
                track === 'main'
                  ? "bg-japan-red text-white shadow-xs"
                  : "text-secondary-text hover:text-primary-text"
              )}
            >
              Main Line
            </button>
            <button
              type="button"
              onClick={() => {
                setTrack('web3');
                setCategory('');
              }}
              className={cn(
                "px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer",
                track === 'web3'
                  ? "bg-primary-text text-white shadow-xs"
                  : "text-secondary-text hover:text-primary-text"
              )}
            >
              Web3 Track
            </button>
            <button
              type="button"
              onClick={() => {
                setTrack('all');
                setTaskType('');
              }}
              className={cn(
                "px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer",
                track === 'all'
                  ? "bg-primary-text text-white shadow-xs"
                  : "text-secondary-text hover:text-primary-text"
              )}
            >
              All Tracks
            </button>
          </div>
        </div>

        {/* Row 2: Search and Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-text" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={track === 'web3' ? "Search Web3 challenges..." : "Search challenges..."}
              className="pl-9 h-11 bg-white border-borders shadow-xs rounded-lg text-sm font-sans"
            />
          </div>

          {track === 'web3' ? (
            <Select value={taskType} onValueChange={(v) => setTaskType(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-full md:w-56 h-11 bg-white border-borders rounded-lg shadow-xs text-sm font-sans">
                <SelectValue placeholder="All Web3 Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Web3 Types</SelectItem>
                {WEB3_TASK_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Select value={category} onValueChange={(v) => setCategory(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-full md:w-56 h-11 bg-white border-borders rounded-lg shadow-xs text-sm font-sans">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.filter(c => c.name !== 'Web3').map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select value={difficulty} onValueChange={(v) => setDifficulty(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-full md:w-48 h-11 bg-white border-borders rounded-lg shadow-xs text-sm font-sans">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Row 3: Track Context Subtitle */}
        <div className="flex items-center justify-between text-xs text-secondary-text pt-0.5">
          <div className="flex items-center gap-2">
            {track === 'web3' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-japan-red animate-pulse"></span>
                <span className="font-semibold text-primary-text">Web3 Track:</span>
                <span className="text-secondary-text">Side quest challenges unlocked for all warriors — does not affect martial rank gating</span>
              </>
            ) : track === 'main' ? (
              <>
                <NinjaStarIcon className="w-3.5 h-3.5 text-japan-red" />
                <span className="font-semibold text-primary-text">Main Martial Line:</span>
                <span className="text-secondary-text">Core path progression (Ronin → Kenshi → Samurai → Shogun)</span>
              </>
            ) : (
              <>
                <Layers className="w-3.5 h-3.5 text-muted-text" />
                <span className="font-semibold text-primary-text">Unified Backlog:</span>
                <span className="text-secondary-text">Showing all challenges across both Martial Line and Web3</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Custom Tabs */}
      <div className="flex items-center gap-8 mt-8 mb-6 px-4 border-b border-borders pb-4">
        <button 
          onClick={() => setTab('all')} 
          className={cn('font-bold text-sm px-5 py-1.5 rounded-full transition-colors', tab === 'all' ? 'bg-zinc-800 text-white shadow-sm' : 'text-primary-text hover:text-japan-red')}
        >
          <span>All Tasks</span>
        </button>
        <button 
          onClick={() => setTab('pending')} 
          className={cn('font-semibold text-sm flex items-center gap-2 transition-colors', tab === 'pending' ? 'text-primary-text' : 'text-secondary-text hover:text-primary-text')}
        >
          <Hourglass className="w-4 h-4" /> Pending
        </button>
        <button 
          onClick={() => setTab('completed')} 
          className={cn('font-semibold text-sm flex items-center gap-2 transition-colors', tab === 'completed' ? 'text-primary-text' : 'text-secondary-text hover:text-primary-text')}
        >
          <CheckCircle2 className="w-4 h-4" /> Completed
        </button>
      </div>

      {/* Task List */}
      {!tasks || tasks.length === 0 ? (
        <EmptyState icon="list" title="No tasks found" message="Try adjusting your filters." />
      ) : (
        <div className="space-y-4 mt-6">
          {tasks.map((task, index) => {
            const avatar = getAvatarForTask(task, index);
            const landscape = landscapes[index % landscapes.length];
            const isBlackBrush = index % 2 === 1;

            return (
              <Card key={task.id} className={cn(
                "relative overflow-hidden bg-white/80 backdrop-blur-sm shadow-sm rounded-xl hover:shadow-md transition-shadow group border-y border-r border-borders",
                task.track === 'web3' ? "border-l-8 border-l-zinc-800" : isBlackBrush ? "border-l-8 border-l-zinc-800" : "border-l-8 border-l-japan-red"
              )}>
                {/* Right Landscape Decor with Smooth Fade */}
                <div 
                  className="absolute -right-8 top-0 bottom-0 w-3/4 md:w-1/2 z-0 opacity-40 pointer-events-none"
                  style={{ maskImage: 'linear-gradient(to right, transparent, black 40%)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 40%)' }}
                >
                  <Image src={landscape} alt="bg" fill className="object-cover object-right mix-blend-multiply scale-110 translate-x-[5%]" />
                </div>

                <CardContent className="p-6 md:pl-10 flex flex-col md:flex-row items-center justify-between relative z-20 gap-6">
                  {/* Left: Avatar + Details */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-7 max-w-3xl flex-1">
                    <div className="w-40 h-40 rounded-full bg-white border border-borders shadow-sm shrink-0 overflow-hidden relative">
                      <Image src={avatar} alt={task.title} fill className="object-contain p-2" />
                    </div>
                    
                    <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                      <h3 className="font-serif text-2xl font-bold text-primary-text flex items-center gap-2">
                        {task.track === 'web3' ? (
                          <GitBranch className="w-5 h-5 text-secondary-text" />
                        ) : (
                          <NinjaStarIcon className="w-5 h-5 text-japan-red" />
                        )}
                        {task.title}
                      </h3>
                      
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                        {task.track === 'web3' ? (
                          <Badge className="bg-secondary-bg border border-borders text-secondary-text font-medium px-2.5 py-0.5 rounded text-[11px] shadow-sm flex items-center gap-1.5">
                            <GitBranch className="w-3 h-3 text-japan-red" />
                            <span>Web3 • {task.taskType || 'Challenge'}</span>
                          </Badge>
                        ) : (
                          <Badge className="bg-[#FAF7F2] border-borders text-secondary-text font-medium px-2.5 py-0.5 rounded text-[11px] shadow-sm">
                            {task.rankRequired || 'Ronin'} • {task.category || 'General'}
                          </Badge>
                        )}
                        <Badge variant="outline" className={cn("rounded-full px-3 py-0.5 text-[11px] capitalize", difficultyColors[task.difficulty])}>
                          {task.difficulty}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-secondary-text mt-3 line-clamp-2 leading-relaxed max-w-xl">
                        {task.description}
                      </p>
                      
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6 mt-4 text-xs font-semibold text-muted-text">
                        {task.deadline && (
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" /> 
                            Deadline: {new Date(task.deadline).toLocaleDateString()}
                          </span>
                        )}
                        {task.status && (
                          <span className="flex items-center gap-1.5 text-japan-red">
                            <Activity className="w-4 h-4" />
                            Status: <span className="capitalize">{task.status.replace('_', ' ')}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Trophy className="w-4 h-4" />
                          Reward: {task.points} pts {task.bonusPoints ? `(+${task.bonusPoints} bonus)` : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right: Points + Button */}
                  <div className="flex flex-col items-center justify-center gap-4 min-w-30 shrink-0">
                    <div className="text-center">
                      <div className="font-serif text-3xl font-bold drop-shadow-sm text-japan-red">
                        {task.points} pts
                      </div>
                      <div className="text-xs font-bold text-secondary-text mt-1 uppercase tracking-wider">Total Points</div>
                    </div>
                    <Button asChild variant="outline" className="bg-white/80 backdrop-blur-sm rounded-full px-6 py-4 font-semibold shadow-sm transition-colors w-full border-borders text-primary-text hover:border-japan-red hover:bg-japan-red hover:text-white">
                      <Link href={`/tasks/${task.id}`}>
                        View Challenge &rarr;
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
