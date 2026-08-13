'use client';

import { useState } from 'react';
import { useJudgeReviews } from '@/hooks/queries/useJudgeQueue';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import EmptyState from '@/components/shared/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Star, Clock, Mail, Search, X } from 'lucide-react';
import Link from 'next/link';

export default function JudgeReviewsPage() {
  const [searchEmail, setSearchEmail] = useState('');
  const { data: reviews, isLoading, isError, error, refetch } = useJudgeReviews(searchEmail);

  if (isLoading) return <LoadingSkeleton variant="table" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary-text">My Reviews</h1>
          <p className="text-secondary-text mt-1">All reviews you&apos;ve submitted.</p>
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

      {!reviews || reviews.length === 0 ? (
        searchEmail ? (
          <div className="py-8 text-center space-y-3">
            <EmptyState
              icon="list"
              title="No matching reviews"
              message={`No reviews found matching participant email "${searchEmail}".`}
            />
            <Button variant="outline" size="sm" onClick={() => setSearchEmail('')}>
              Clear search filter
            </Button>
          </div>
        ) : (
          <EmptyState icon="list" title="No reviews yet" message="Reviews will appear here once you've reviewed submissions." />
        )
      ) : (
        <div className="space-y-3 stagger-fade">
          {reviews.map((review) => (
            <Link key={review.id} href={`/judge/reviews/${review.id}`} className="block">
              <Card className="hover:shadow-md hover:border-japan-red/20 transition-all cursor-pointer">
                <CardContent className="pt-4 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-primary-text">
                      {review.taskTitle ? `${review.taskTitle} · Review #${review.id.slice(0, 8)}` : `Review #${review.id.slice(0, 8)}`}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap text-xs text-muted-text mt-1">
                      {review.userName && (
                        <span>by <span className="font-medium text-primary-text">{review.userName}</span></span>
                      )}
                      {review.userEmail && (
                        <span className="inline-flex items-center gap-1 text-secondary-text bg-off-white px-2 py-0.5 rounded border border-borders text-[11px]">
                          <Mail className="h-3 w-3 text-japan-red" />
                          {review.userEmail}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-text">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                      {review.canEdit && <span className="text-amber-600 font-medium">Editable</span>}
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-sm font-semibold text-japan-red ml-4">
                    <Star className="h-4 w-4" /> {review.totalScore}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
