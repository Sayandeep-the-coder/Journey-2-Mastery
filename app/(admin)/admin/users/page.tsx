'use client';

import React, { useState } from 'react';
import { useInfiniteAdminUsers, useChangeUserRole, useDeleteUser } from '@/hooks/queries/useAdminDashboard';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import EmptyState from '@/components/shared/EmptyState';
import RankBadge from '@/components/shared/RankBadge';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Search, Trash2, CheckCircle2, XCircle, ChevronDown, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [role, setRole] = useState('');

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError,
    error,
    refetch,
  } = useInfiniteAdminUsers({
    search: debouncedSearch || undefined,
    role: role || undefined,
    limit: 15,
  });

  const changeRole = useChangeUserRole();
  const deleteUser = useDeleteUser();

  const users = data?.pages.flatMap((page) => page.data) || [];
  const totalCount = data?.pages[0]?.meta?.total ?? users.length;

  if (isLoading) return <LoadingSkeleton variant="table" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary-text">Users</h1>
          <p className="text-sm text-muted-text mt-1">
            Manage user accounts, roles, and view profile statuses
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-text" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="pl-9"
          />
        </div>
        <Select value={role} onValueChange={(v) => setRole(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="judge">Judge</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {users.length === 0 ? (
        <EmptyState icon="users" title="No users found" message="Try adjusting your search or filters." />
      ) : (
        <div className="space-y-4">
          <div className="border border-borders rounded-lg overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-center">Profile</TableHead>
                  <TableHead>Rank</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <Link href={`/admin/users/${u.id}`} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          {u.avatarUrl && <AvatarImage src={u.avatarUrl} />}
                          <AvatarFallback className="text-xs">
                            {(u.fullName || u.username)?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-primary-text">{u.fullName || u.username}</p>
                          <p className="text-xs text-muted-text">@{u.username}</p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={u.role}
                        onValueChange={(newRole) => {
                          changeRole.mutate(
                            { id: u.id, role: newRole },
                            {
                              onSuccess: () => toast.success(`Role changed to ${newRole}`),
                            }
                          );
                        }}
                      >
                        <SelectTrigger className="w-24 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="judge">Judge</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-center">
                      {u.isProfileComplete ? (
                        <span title="Profile Completed" className="inline-flex justify-center">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </span>
                      ) : (
                        <span title="Profile Incomplete" className="inline-flex justify-center">
                          <XCircle className="h-5 w-5 text-red-500" />
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <RankBadge rank={u.rank} size="sm" />
                    </TableCell>
                    <TableCell className="text-right font-semibold">{u.score}</TableCell>
                    <TableCell className="text-right">
                      <ConfirmDialog
                        trigger={
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        }
                        title="Delete user?"
                        description={`This will permanently delete ${u.fullName || u.username} and all their data.`}
                        confirmLabel="Delete"
                        variant="destructive"
                        onConfirm={() =>
                          deleteUser.mutate(u.id, { onSuccess: () => toast.success('User deleted') })
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Load More Button & Stats Footer */}
          <div className="flex flex-col items-center justify-center gap-2 pt-2">
            <p className="text-xs text-muted-text">
              Showing {users.length} of {totalCount} users
            </p>
            {hasNextPage && (
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="gap-2 px-6 py-2 border-primary/30 hover:border-primary hover:bg-primary/5 transition-all text-sm font-medium"
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span>Fetching more users...</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 text-primary" />
                    <span>Load More Users ({Math.max(0, totalCount - users.length)} remaining)</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
