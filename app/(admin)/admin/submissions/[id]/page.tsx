'use client';

import { useParams } from 'next/navigation';
import { useAdminSubmission, useOverrideReview } from '@/hooks/queries/useAdminDashboard';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import StatusBadge from '@/components/shared/StatusBadge';
import CommentThread from '@/components/shared/CommentThread';
import AssignJudgeDialog from '@/components/admin/AssignJudgeDialog';
import PreviousJudgedSection from '@/components/submission/PreviousJudgedSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ExternalLink, User, Star, UserPlus, Shield } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

export default function AdminSubmissionDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: submission, isLoading, isError, error, refetch } = useAdminSubmission(id);
  const overrideReview = useOverrideReview();
  const [overrideScores, setOverrideScores] = useState<Record<string, number>>({});
  const [overrideReason, setOverrideReason] = useState('');

  if (isLoading) return <LoadingSkeleton variant="detail" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  if (!submission) return null;

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/admin/submissions" className="inline-flex items-center gap-1 text-sm text-muted-text hover:text-primary-text transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Submissions
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-primary-text">{submission.taskTitle || 'Submission'}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-secondary-text">
            <span className="flex items-center gap-1"><User className="h-4 w-4" />{submission.userName}</span>
            <span>{new Date(submission.submittedAt).toLocaleDateString()}</span>
          </div>
        </div>
        <StatusBadge status={submission.status} />
      </div>

      <Card>
        <CardContent className="pt-6">
          <a href={submission.repoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-japan-red hover:text-dark-red font-medium">
            <ExternalLink className="h-4 w-4" />{submission.repoUrl.replace('https://github.com/', '')}
          </a>
        </CardContent>
      </Card>

      {/* Judge Assignment */}
      <Card>
        <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-text">Assigned Judge</p>
              {submission.autoAssigned && (
                <span className="text-[10px] font-medium bg-secondary-bg text-secondary-text px-1.5 py-0.5 rounded border border-borders">
                  Auto-Assigned
                </span>
              )}
            </div>
            <p className="text-base font-semibold text-primary-text">
              {submission.judgeName || 'Unassigned (Waiting in Queue)'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <AssignJudgeDialog
              submissionId={id}
              submissionAuthorId={submission.userId}
              currentJudgeId={submission.assignedJudgeId}
              currentJudgeName={submission.judgeName}
              onSuccess={refetch}
              trigger={
                <Button variant={submission.judgeName ? 'outline' : 'default'} size="sm" className="gap-1.5 font-medium">
                  <UserPlus className="h-3.5 w-3.5" />
                  {submission.judgeName ? 'Reassign Judge' : 'Assign Judge'}
                </Button>
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Current Review */}
      {submission.review && (
        <Card className="border-japan-red/30 shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 font-serif text-lg">
                <Star className="h-5 w-5 text-japan-red fill-japan-red" />
                Current Review — {submission.review.totalScore} pts
              </CardTitle>
              {submission.judgeName && (
                <span className="text-xs text-secondary-text">
                  Evaluated by <strong className="text-primary-text">{submission.judgeName}</strong>
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {submission.review.scores.map((s) => (
                <div key={s.criterionId} className="flex justify-between items-center text-sm">
                  <span className="text-secondary-text font-medium">{s.criterionName}</span>
                  <span className="font-semibold text-primary-text bg-secondary-bg/60 px-2.5 py-0.5 rounded border border-borders text-xs">
                    {s.score} / {s.maxScore}
                  </span>
                </div>
              ))}
            </div>
            {submission.review.feedback && (
              <>
                <Separator />
                <div className="p-3.5 rounded-lg bg-[#FAF7F2] border-l-4 border-l-japan-red border border-borders/70">
                  <p className="text-xs font-bold uppercase tracking-wider text-primary-text mb-1">Judge Feedback</p>
                  <p className="text-xs text-secondary-text whitespace-pre-wrap leading-relaxed">{submission.review.feedback}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Previous Judged Projects from this user / team */}
      <PreviousJudgedSection
        submissions={submission.previousJudgedSubmissions}
        currentTaskId={submission.taskId}
      />

      {/* Score Override */}
      {submission.review && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-japan-red" />Admin Override</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {submission.review.scores.map(s => (
                <div key={s.criterionId} className="space-y-2">
                  <Label>{s.criterionName} (Max: {s.maxScore})</Label>
                  <Input 
                    type="number" 
                    min={0}
                    max={s.maxScore}
                    value={overrideScores[s.criterionId] !== undefined ? overrideScores[s.criterionId] : s.score} 
                    onChange={(e) => setOverrideScores(prev => ({ ...prev, [s.criterionId]: Number(e.target.value) }))} 
                  />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea value={overrideReason} onChange={(e) => setOverrideReason(e.target.value)} placeholder="Reason for override..." />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                const newScores = submission.review!.scores.map(s => ({
                  criterionId: s.criterionId,
                  score: overrideScores[s.criterionId] !== undefined ? overrideScores[s.criterionId] : s.score
                }));
                const totalNewScore = newScores.reduce((sum, s) => sum + s.score, 0);

                overrideReview.mutate({ 
                  reviewId: submission.review!.id, 
                  totalScore: totalNewScore,
                  scores: newScores, 
                  feedback: overrideReason 
                }, {
                  onSuccess: () => { 
                    toast.success('Scores overridden'); 
                    refetch(); 
                    setOverrideScores({}); 
                    setOverrideReason(''); 
                  }
                });
              }}
              disabled={!overrideReason || overrideReview.isPending}
            >
              {overrideReview.isPending ? 'Overriding...' : 'Override Scores'}
            </Button>
          </CardContent>
        </Card>
      )}

      <Separator />
      <CommentThread submissionId={id} />
    </div>
  );
}
