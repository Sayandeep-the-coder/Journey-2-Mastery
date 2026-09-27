'use client';

import { useState } from 'react';
import type { PreviousJudgedSubmission } from '@/types/api.types';
import StatusBadge from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  History,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MessageSquareQuote,
  AlertCircle,
  Award,
  Layers,
  Calendar,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface PreviousJudgedSectionProps {
  submissions?: PreviousJudgedSubmission[];
  currentTaskId?: string;
  title?: string;
  subtitle?: string;
}

export default function PreviousJudgedSection({
  submissions,
  currentTaskId,
  title = 'Previous Judged Projects',
  subtitle = 'Past evaluated projects and feedback from the judges for this user / team',
}: PreviousJudgedSectionProps) {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!submissions || submissions.length === 0) {
    return (
      <Card className="border-dashed border-borders/80 bg-white/40">
        <CardContent className="py-8 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-secondary-bg flex items-center justify-center mx-auto text-muted-text">
            <History className="h-5 w-5" />
          </div>
          <p className="font-medium text-sm text-primary-text">No previous judged projects found</p>
          <p className="text-xs text-muted-text max-w-sm mx-auto">
            This student / team has no prior evaluated tasks recorded in the scrolls.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Count approved vs rejected
  const approvedCount = submissions.filter((s) => s.status === 'approved').length;
  const rejectedCount = submissions.filter((s) => s.status === 'rejected').length;

  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-borders shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-japan-red/10 text-japan-red border border-japan-red/20">
            <History className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-primary-text flex items-center gap-2">
              {title}
              <Badge variant="secondary" className="font-sans text-xs font-semibold px-2 py-0.5 bg-secondary-bg">
                {submissions.length} {submissions.length === 1 ? 'Project' : 'Projects'}
              </Badge>
            </h3>
            <p className="text-xs text-secondary-text mt-0.5">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {approvedCount} Approved
          </span>
          <span className="flex items-center gap-1 font-medium text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
            <XCircle className="h-3.5 w-3.5" />
            {rejectedCount} Rejected
          </span>
        </div>
      </div>

      {/* List of Previous Judged Submissions */}
      <div className="space-y-3">
        {submissions.map((item) => {
          const isExpanded = !!expandedIds[item.id];
          const hasScores = item.scores && item.scores.length > 0;
          const isSameTask = item.isSameTask || (currentTaskId && item.taskId === currentTaskId);

          return (
            <Card
              key={item.id}
              className={`transition-all duration-200 border bg-white overflow-hidden shadow-2xs ${
                isSameTask ? 'border-amber-300 ring-1 ring-amber-200/60' : 'border-borders hover:border-japan-red/30'
              }`}
            >
              {/* Same Task Flag Banner */}
              {isSameTask && (
                <div className="bg-linear-to-r from-amber-50 to-orange-50 border-b border-amber-200 px-4 py-1.5 flex items-center justify-between text-xs font-semibold text-amber-800">
                  <span className="flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                    Previous Attempt for This Same Task
                  </span>
                  <span className="text-[11px] font-normal text-amber-700">
                    Reviewed on {item.reviewedAt ? new Date(item.reviewedAt).toLocaleDateString() : 'earlier date'}
                  </span>
                </div>
              )}

              <CardHeader className="py-4 px-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="font-serif text-base font-bold text-primary-text truncate">
                        {item.taskTitle}
                      </CardTitle>
                      {item.category && (
                        <Badge variant="outline" className="text-[11px] font-medium bg-secondary-bg/60 border-borders text-secondary-text">
                          {item.category}
                        </Badge>
                      )}
                      {item.difficulty && (
                        <Badge variant="outline" className="text-[10px] capitalize font-medium text-muted-text border-borders">
                          {item.difficulty}
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-text pt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Submitted: {new Date(item.submittedAt).toLocaleDateString()}
                      </span>
                      {item.reviewedAt && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Award className="h-3 w-3 text-japan-red" />
                            Judged: {new Date(item.reviewedAt).toLocaleDateString()}
                          </span>
                        </>
                      )}
                      {item.repoUrl && (
                        <>
                          <span>·</span>
                          <a
                            href={item.repoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-japan-red hover:text-dark-red transition-colors font-medium"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Repo
                          </a>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
                    {item.totalScore !== null && item.totalScore !== undefined && (
                      <div className="text-right">
                        <span className="inline-block px-3 py-1 font-bold text-sm text-japan-red bg-red-50 rounded-lg border border-red-100">
                          {item.totalScore} pts
                        </span>
                      </div>
                    )}
                    <StatusBadge status={item.status} />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0 pb-4 px-5 space-y-3">
                {/* Judge Info & Quick Summary */}
                <div className="flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-card-bg/60 border border-borders/60">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6 border border-borders">
                      <AvatarImage src={item.judgeAvatar || undefined} alt={item.judgeName || 'Judge'} />
                      <AvatarFallback className="text-[10px] bg-secondary-bg text-secondary-text font-bold">
                        {(item.judgeName || 'J').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-secondary-text">
                      Judged by <strong className="font-semibold text-primary-text">{item.judgeName || 'Assigned Judge'}</strong>
                    </span>
                  </div>

                  {hasScores && (
                    <button
                      type="button"
                      onClick={() => toggleExpand(item.id)}
                      className="text-japan-red hover:text-dark-red font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {isExpanded ? (
                        <>
                          Hide Breakdown <ChevronUp className="h-3.5 w-3.5" />
                        </>
                      ) : (
                        <>
                          View Score Breakdown ({item.scores?.length}) <ChevronDown className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Score Rubric Breakdown (Collapsible) */}
                {isExpanded && hasScores && (
                  <div className="p-3.5 rounded-lg bg-white border border-borders space-y-3 animate-in fade-in-50 duration-200">
                    <div className="flex items-center justify-between text-xs font-semibold text-primary-text border-b border-borders/60 pb-2">
                      <span className="flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5 text-japan-red" />
                        Criteria Evaluation Rubric
                      </span>
                      <span>Total: {item.totalScore} pts</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {item.scores?.map((score) => {
                        const pct = score.maxScore > 0 ? Math.round((score.score / score.maxScore) * 100) : 0;
                        return (
                          <div key={score.criterionId} className="space-y-1 bg-card-bg/40 p-2.5 rounded-md border border-borders/40">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-medium text-secondary-text truncate pr-2">{score.criterionName}</span>
                              <span className="font-bold text-primary-text shrink-0">
                                {score.score} <span className="text-muted-text font-normal">/ {score.maxScore}</span>
                              </span>
                            </div>
                            <Progress value={pct} className="h-1.5 bg-secondary-bg" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Judge Feedback Quote */}
                {item.feedback ? (
                  <div className="p-3.5 rounded-lg bg-[#FAF7F2] border-l-4 border-l-japan-red border border-borders/70 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-primary-text uppercase tracking-wider">
                      <MessageSquareQuote className="h-3.5 w-3.5 text-japan-red" />
                      Judge Feedback
                    </div>
                    <p className="text-xs text-secondary-text leading-relaxed whitespace-pre-wrap font-sans">
                      {item.feedback}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-text italic">No written commentary provided.</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
