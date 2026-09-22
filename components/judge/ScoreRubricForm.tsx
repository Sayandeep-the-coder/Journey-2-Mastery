'use client';

import { useState, useMemo } from 'react';
import { useJudgeCriteria } from '@/hooks/queries/useJudgeQueue';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

import type { ReviewCriterion } from '@/types/api.types';

interface ScoreRubricFormProps {
  taskId?: string;
  taskType?: string;
  passingScore?: number;
  initialCriteria?: ReviewCriterion[];
  onSubmit: (scores: { criterionId: string; score: number }[], feedback: string) => void;
  isPending?: boolean;
  initialScores?: { criterionId: string; score: number }[];
  initialFeedback?: string;
}

export default function ScoreRubricForm({
  taskId,
  taskType,
  passingScore,
  initialCriteria,
  onSubmit,
  isPending = false,
  initialScores,
  initialFeedback = '',
}: ScoreRubricFormProps) {
  const { data: fetchedCriteria, isLoading } = useJudgeCriteria(taskId || taskType);
  const criteria = initialCriteria && initialCriteria.length > 0 ? initialCriteria : fetchedCriteria;
  const [scores, setScores] = useState<Record<string, number>>(
    initialScores?.reduce((acc, s) => ({ ...acc, [s.criterionId]: s.score }), {} as Record<string, number>) || {}
  );
  const [feedback, setFeedback] = useState(initialFeedback);

  const totalScore = useMemo(() => {
    return Object.values(scores).reduce((sum, s) => sum + (s || 0), 0);
  }, [scores]);

  const maxTotal = useMemo(() => {
    return criteria?.reduce((sum, c) => sum + c.maxScore, 0) || 0;
  }, [criteria]);

  const handleScoreChange = (criterionId: string, value: string, maxScore: number) => {
    const num = Math.min(Math.max(0, parseInt(value) || 0), maxScore);
    setScores((prev) => ({ ...prev, [criterionId]: num }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const scoreEntries = Object.entries(scores).map(([criterionId, score]) => ({
      criterionId,
      score,
    }));
    onSubmit(scoreEntries, feedback);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex justify-between items-center">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {criteria?.map((criterion) => (
          <div key={criterion.id} className="flex items-start justify-between gap-4 p-4 rounded-lg border border-borders bg-card-bg">
            <div className="flex-1 min-w-0">
              <Label className="font-medium">{criterion.name}</Label>
              <p className="text-xs text-muted-text mt-0.5">{criterion.description}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Input
                type="number"
                min={0}
                max={criterion.maxScore}
                value={scores[criterion.id] ?? ''}
                onChange={(e) => handleScoreChange(criterion.id, e.target.value, criterion.maxScore)}
                className="w-20 text-center"
              />
              <span className="text-sm text-muted-text">/ {criterion.maxScore}</span>
            </div>
          </div>
        ))}
      </div>

      <Separator />

      {/* Live Total & Approval Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-lg bg-secondary-bg border border-borders">
        <div>
          <span className="font-serif font-semibold text-primary-text block">Total Score</span>
          {passingScore !== undefined && (
            <span className="text-xs text-muted-text">
              Min Approval Score: <span className="font-semibold text-primary-text">{passingScore}</span> / {maxTotal}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {passingScore !== undefined && (
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                totalScore >= passingScore
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-red-50 text-red-700 border-red-300'
              }`}
            >
              {totalScore >= passingScore ? 'Passing (Approved)' : 'Below Threshold (Rejected)'}
            </span>
          )}
          <span className="text-2xl font-bold text-japan-red">
            {totalScore} <span className="text-sm font-normal text-muted-text">/ {maxTotal}</span>
          </span>
        </div>
      </div>

      {/* Feedback */}
      <div className="space-y-2">
        <Label htmlFor="feedback">Feedback</Label>
        <Textarea
          id="feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Provide detailed feedback for the submission..."
          className="min-h-30"
        />
      </div>

      <Button type="submit" disabled={isPending || !feedback.trim()} className="w-full">
        {isPending ? 'Submitting Review...' : 'Submit Review'}
      </Button>
    </form>
  );
}
