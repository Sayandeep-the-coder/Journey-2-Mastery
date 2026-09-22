'use client';

import { useState } from 'react';
import { useJudgeQueue } from '@/hooks/queries/useJudgeQueue';
import { useDebounce } from '@/hooks/useDebounce';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import EmptyState from '@/components/shared/EmptyState';
import StatusBadge from '@/components/shared/StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ExternalLink, Mail, Search, X } from 'lucide-react';
import Link from 'next/link';

export default function JudgeQueuePage() {
  const [searchEmail, setSearchEmail] = useState('');
  const debouncedSearchEmail = useDebounce(searchEmail, 500);
  const { data: submissions, isLoading, isError, error, refetch } = useJudgeQueue(undefined, debouncedSearchEmail);

  if (isLoading) return <LoadingSkeleton variant="table" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary-text">Review Queue</h1>
          <p className="text-secondary-text mt-1">Submissions assigned to you for review.</p>
        </div>

        {/* Search by Participant Email */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-text pointer-events-none" />
          <Input
            type="email"
            placeholder="Search by participant email..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchEmail && (
            <button
              type="button"
              onClick={() => setSearchEmail('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-text hover:text-primary-text p-0.5 rounded-full hover:bg-black/5 transition-colors"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {!submissions || submissions.length === 0 ? (
        searchEmail ? (
          <div className="py-8 text-center space-y-3">
            <EmptyState
              icon="inbox"
              title="No matching submissions"
              message={`No submissions found matching participant email "${searchEmail}".`}
            />
            <Button variant="outline" size="sm" onClick={() => setSearchEmail('')}>
              Clear search filter
            </Button>
          </div>
        ) : (
          <EmptyState icon="inbox" title="Queue empty" message="No submissions waiting for your review. Check back later!" />
        )
      ) : (
        <div className="space-y-3 stagger-fade">
          {submissions.map((sub) => (
            <Link key={sub.id} href={`/judge/submissions/${sub.id}`} className="block">
              <Card className="hover:shadow-md hover:border-japan-red/20 transition-all cursor-pointer">
                <CardContent className="pt-4 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-primary-text">{sub.taskTitle || 'Submission'}</p>
                      <ExternalLink className="h-3 w-3 text-muted-text" />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap text-xs text-muted-text">
                      <span>by <span className="font-medium text-primary-text">{sub.userName || 'Unknown'}</span></span>
                      {sub.userEmail && (
                        <span className="inline-flex items-center gap-1 text-secondary-text bg-off-white px-2 py-0.5 rounded border border-borders text-[11px]">
                          <Mail className="h-3 w-3 text-japan-red" />
                          {sub.userEmail}
                        </span>
                      )}
                      <span>· {sub.repoUrl.replace('https://github.com/', '')}</span>
                    </div>
                    <p className="text-xs text-muted-text mt-1">
                      Submitted {new Date(sub.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={sub.status} />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
