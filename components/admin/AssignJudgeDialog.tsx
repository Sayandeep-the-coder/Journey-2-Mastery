'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  UserPlus,
  RefreshCw,
  Sparkles,
  Search,
  UserX,
  UserCheck,
  Briefcase,
  AlertTriangle,
} from 'lucide-react';
import { useAdminJudges, useAssignJudge } from '@/hooks/queries/useAdminDashboard';
import { toast } from 'sonner';

interface AssignJudgeDialogProps {
  submissionId: string;
  submissionAuthorId?: string;
  currentJudgeId?: string | null;
  currentJudgeName?: string | null;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export default function AssignJudgeDialog({
  submissionId,
  submissionAuthorId,
  currentJudgeId,
  currentJudgeName,
  trigger,
  onSuccess,
}: AssignJudgeDialogProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { data: judges, isLoading: isLoadingJudges } = useAdminJudges();
  const assignJudge = useAssignJudge();

  const isAssigned = !!currentJudgeName;

  const handleAutoAssign = () => {
    assignJudge.mutate(
      { submissionId, auto: true },
      {
        onSuccess: (res: unknown) => {
          const result = res as { data?: { judgeName?: string } };
          const name = result?.data?.judgeName || 'a judge';
          toast.success(`Auto-assigned to ${name}`);
          setOpen(false);
          onSuccess?.();
        },
        onError: (err: Error) => {
          toast.error(err.message || 'Failed to auto-assign judge');
        },
      }
    );
  };

  const handleManualAssign = (judgeId: string, judgeName: string) => {
    assignJudge.mutate(
      { submissionId, judgeId },
      {
        onSuccess: () => {
          toast.success(`Assigned to ${judgeName}`);
          setOpen(false);
          onSuccess?.();
        },
        onError: (err: Error) => {
          toast.error(err.message || 'Failed to assign judge');
        },
      }
    );
  };

  const handleUnassign = () => {
    assignJudge.mutate(
      { submissionId, unassign: true },
      {
        onSuccess: () => {
          toast.success('Judge unassigned');
          setOpen(false);
          onSuccess?.();
        },
        onError: (err: Error) => {
          toast.error(err.message || 'Failed to unassign judge');
        },
      }
    );
  };

  const filteredJudges = judges?.filter((judge) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    const nameMatch = judge.fullName?.toLowerCase().includes(term);
    const userMatch = judge.username?.toLowerCase().includes(term);
    const emailMatch = judge.email?.toLowerCase().includes(term);
    return nameMatch || userMatch || emailMatch;
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant={isAssigned ? 'outline' : 'default'} size="sm" className="gap-1.5 font-medium">
            {isAssigned ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 text-secondary-text" />
                Reassign Judge
              </>
            ) : (
              <>
                <UserPlus className="h-3.5 w-3.5" />
                Assign Judge
              </>
            )}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-xl max-h-[85vh] flex flex-col p-6 overflow-hidden">
        <DialogHeader className="pb-3 border-b border-borders/60">
          <DialogTitle className="font-serif text-xl flex items-center gap-2 text-primary-text">
            {isAssigned ? <RefreshCw className="h-5 w-5 text-japan-red" /> : <UserPlus className="h-5 w-5 text-japan-red" />}
            {isAssigned ? 'Reassign Judge' : 'Assign Judge to Submission'}
          </DialogTitle>
          <DialogDescription className="text-secondary-text text-sm">
            Select an active judge from the court or let the algorithm automatically distribute the workload.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-5 py-3 pr-1">
          {/* Current Status banner */}
          <div className="p-3.5 rounded-xl border border-borders bg-white/70 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isAssigned ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-secondary-bg text-muted-text'}`}>
                {isAssigned ? <UserCheck className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-text">Currently Assigned</p>
                <p className="font-medium text-sm text-primary-text">
                  {currentJudgeName || 'Unassigned (Waiting in Queue)'}
                </p>
              </div>
            </div>

            {isAssigned && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 gap-1 h-8"
                onClick={handleUnassign}
                disabled={assignJudge.isPending}
              >
                <UserX className="h-3.5 w-3.5" />
                Unassign
              </Button>
            )}
          </div>

          {/* Option 1: Smart Auto-Assign */}
          <div className="p-4 rounded-xl border border-japan-red/20 bg-linear-to-r from-red-50/40 via-orange-50/20 to-transparent shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-japan-red" />
                <span className="font-semibold text-sm text-primary-text">Smart Auto-Assign</span>
                <Badge variant="outline" className="text-[10px] bg-white border-japan-red/30 text-japan-red font-medium">
                  Load-Balanced
                </Badge>
              </div>
              <p className="text-xs text-secondary-text max-w-sm">
                Balances judge queues, accounts for review turnaround time, and prevents self-reviews automatically.
              </p>
            </div>
            <Button
              size="sm"
              className="bg-japan-red hover:bg-dark-red text-white gap-1.5 shrink-0 shadow-sm"
              onClick={handleAutoAssign}
              disabled={assignJudge.isPending}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {assignJudge.isPending ? 'Assigning...' : 'Auto-Assign'}
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-text">Or Choose Manually</span>
            <Separator className="flex-1" />
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-text" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search judge by name or username..."
              className="pl-9 h-10 bg-white"
            />
          </div>

          {/* Judges List */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {isLoadingJudges ? (
              <div className="text-center py-6 text-sm text-muted-text">Loading court judges...</div>
            ) : !filteredJudges || filteredJudges.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-text">No active judges found.</div>
            ) : (
              filteredJudges.map((judge) => {
                const isCurrent = judge.id === currentJudgeId || judge.username === currentJudgeName;
                const isAuthor = !!submissionAuthorId && judge.id === submissionAuthorId;
                const pendingCount = judge.workload?.pendingCount ?? judge.workload?.assignedCount ?? 0;
                const loadScore = judge.workload?.loadScore;

                return (
                  <div
                    key={judge.id}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      isCurrent
                        ? 'border-japan-red/40 bg-red-50/30'
                        : isAuthor
                        ? 'border-borders bg-secondary-bg/40 opacity-60'
                        : 'border-borders hover:border-japan-red/30 bg-white hover:shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-9 w-9 border border-borders">
                        <AvatarImage src={judge.avatarUrl} alt={judge.username} />
                        <AvatarFallback className="font-semibold text-xs bg-card-bg text-primary-text">
                          {(judge.fullName || judge.username || 'J').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm text-primary-text truncate">
                            {judge.fullName || judge.username}
                          </p>
                          {judge.fullName && (
                            <span className="text-xs text-muted-text truncate">@{judge.username}</span>
                          )}
                          {isCurrent && (
                            <Badge variant="outline" className="text-[10px] bg-red-100/60 text-japan-red border-red-200">
                              Assigned
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-0.5 text-xs text-secondary-text">
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3 text-muted-text" />
                            {pendingCount} active {pendingCount === 1 ? 'review' : 'reviews'}
                          </span>
                          {loadScore !== undefined && (
                            <>
                              <span>·</span>
                              <span className="text-muted-text">Load: {loadScore}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isAuthor ? (
                        <span className="text-[11px] text-amber-700 flex items-center gap-1 font-medium bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                          <AlertTriangle className="h-3 w-3" /> Author
                        </span>
                      ) : isCurrent ? (
                        <Button variant="ghost" size="sm" disabled className="text-xs font-medium text-muted-text">
                          Selected
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-japan-red hover:text-white transition-colors text-xs h-8"
                          onClick={() => handleManualAssign(judge.id, judge.fullName || judge.username)}
                          disabled={assignJudge.isPending}
                        >
                          Assign
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
