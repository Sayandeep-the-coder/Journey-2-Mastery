'use client';

import React, { useState } from 'react';
import {
  useInfiniteAdminTeams,
  useDisbandTeam,
  useRemoveTeamMember,
} from '@/hooks/queries/useAdminDashboard';
import type { AdminTeamItem, AdminTeamMember } from '@/types/api.types';
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
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Search,
  Trash2,
  Copy,
  Check,
  Crown,
  Eye,
  Shield,
  Users,
  UserPlus,
  Trophy,
  Loader2,
  Mail,
  Phone,
  GraduationCap,
  MessageSquare,
  UserMinus,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

export default function AdminTeamsPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [status, setStatus] = useState('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Selected team for details dialog
  const [selectedTeam, setSelectedTeam] = useState<AdminTeamItem | null>(null);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError,
    error,
    refetch,
  } = useInfiniteAdminTeams({
    search: debouncedSearch || undefined,
    status: status === 'all' ? undefined : status,
    limit: 20,
  });

  const disbandTeam = useDisbandTeam();
  const removeMember = useRemoveTeamMember();

  const teams: AdminTeamItem[] = data?.pages.flatMap((page) => page.data?.items || []) || [];
  const stats = data?.pages[0]?.data?.stats;
  const totalCount = data?.pages[0]?.meta?.total ?? teams.length;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Copied join code "${code}"`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDisband = async (teamId: string) => {
    await disbandTeam.mutateAsync(teamId);
    if (selectedTeam?.id === teamId) {
      setSelectedTeam(null);
    }
  };

  const handleRemoveMember = async (teamId: string, userId: string) => {
    await removeMember.mutateAsync({ teamId, userId });
    // Update local state for modal if open
    if (selectedTeam && selectedTeam.id === teamId) {
      const updatedMembers = selectedTeam.members.filter((m) => m.id !== userId);
      if (updatedMembers.length === 0) {
        setSelectedTeam(null);
      } else {
        setSelectedTeam({
          ...selectedTeam,
          memberCount: updatedMembers.length,
          status: 'incomplete',
          members: updatedMembers,
        });
      }
    }
  };

  if (isLoading) return <LoadingSkeleton variant="table" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary-text flex items-center gap-3">
            <Shield className="h-8 w-8 text-japan-red" />
            Clans & Teams
          </h1>
          <p className="text-sm text-secondary-text mt-1">
            Oversee all warrior clans, monitor duo formation, view secret join codes, and inspect member info.
          </p>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-fade">
        <Card className="border-borders bg-white/80 shadow-sm">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border flex items-center justify-center shrink-0 bg-sky-50 text-sky-600 border-sky-100 shadow-sm">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-text font-bold uppercase tracking-wider">Total Clans</p>
              <p className="text-2xl font-bold text-primary-text font-serif">
                {stats?.totalTeams ?? teams.length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-borders bg-white/80 shadow-sm">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-text font-bold uppercase tracking-wider">Active Clans (Eligible)</p>
              <p className="text-2xl font-bold text-primary-text font-serif">
                {stats?.activeTeams ?? teams.filter((t) => t?.status === 'active').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-borders bg-white/80 shadow-sm">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border flex items-center justify-center shrink-0 bg-amber-50 text-amber-600 border-amber-100 shadow-sm">
              <UserPlus className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-text font-bold uppercase tracking-wider">Incomplete (1/2)</p>
              <p className="text-2xl font-bold text-primary-text font-serif">
                {stats?.incompleteTeams ?? teams.filter((t) => t?.status === 'incomplete').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-borders bg-white/80 shadow-sm">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border flex items-center justify-center shrink-0 bg-rose-50 text-rose-600 border-rose-100 shadow-sm">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-text font-bold uppercase tracking-wider">Average Score</p>
              <p className="text-2xl font-bold text-primary-text font-serif">
                {stats?.avgScore ?? 0} pts
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-text" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by team name, join code, or warrior name..."
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active (2/2 Duo)</SelectItem>
            <SelectItem value="incomplete">Incomplete (1/2 Solo)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Teams Table */}
      {teams.length === 0 ? (
        <EmptyState
          icon="users"
          title="No clans found"
          message="Try adjusting your search query or status filter."
        />
      ) : (
        <div className="space-y-4">
          <div className="border border-borders rounded-xl overflow-hidden bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary-bg/50">
                  <TableHead className="w-[240px]">Clan / Team</TableHead>
                  <TableHead className="w-[140px]">Join Code</TableHead>
                  <TableHead>Warriors (Members)</TableHead>
                  <TableHead className="text-center w-[130px]">Status</TableHead>
                  <TableHead className="text-right w-[110px]">Score</TableHead>
                  <TableHead className="text-right w-[140px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.filter(Boolean).map((team) => (
                  <TableRow key={team.id} className="hover:bg-muted/30 transition-colors">
                    {/* Team Name */}
                    <TableCell>
                      <div className="font-medium text-primary-text font-serif text-base flex items-center gap-2">
                        <Shield className="h-4 w-4 text-japan-red shrink-0" />
                        <span>{team.name}</span>
                      </div>
                      <p className="text-xs text-muted-text mt-0.5 font-mono">
                        Created {new Date(team.createdAt).toLocaleDateString()}
                      </p>
                    </TableCell>

                    {/* Join Code */}
                    <TableCell>
                      <div className="inline-flex items-center gap-1.5 bg-secondary-bg px-2.5 py-1 rounded-md border border-borders font-mono text-sm font-semibold tracking-wider text-primary-text">
                        <span>{team.joinCode}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(team.joinCode)}
                          className="text-muted-text hover:text-japan-red transition-colors ml-1 p-0.5 rounded cursor-pointer"
                          title="Copy join code"
                        >
                          {copiedCode === team.joinCode ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </TableCell>

                    {/* Members */}
                    <TableCell>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2 overflow-hidden py-0.5">
                            {team.members.map((member) => (
                              <Avatar
                                key={member.id}
                                className="h-7 w-7 border-2 border-white ring-1 ring-borders"
                              >
                                <AvatarImage src={member.avatarUrl || ''} alt={member.username} />
                                <AvatarFallback className="text-[10px] bg-secondary-bg">
                                  {member.username.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                          <span className="text-xs font-medium text-secondary-text">
                            {team.members.length}/{Math.max(team.members.length, 2)} warriors
                          </span>
                        </div>

                        {/* Member names preview */}
                        <div className="flex flex-wrap gap-1.5 items-center text-xs">
                          {team.members.map((m) => (
                            <span
                              key={m.id}
                              className="inline-flex items-center gap-1 text-muted-text"
                            >
                              {m.teamRole === 'leader' && (
                                <Crown className="h-3 w-3 text-amber-500 shrink-0" />
                              )}
                              <span className="font-medium text-primary-text">
                                {m.fullName || m.username}
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="text-center">
                      {team.members.length >= 3 ? (
                        <Badge
                          variant="outline"
                          className="bg-purple-50 text-purple-700 border-purple-200 font-medium"
                        >
                          Active (3/3 Trio)
                        </Badge>
                      ) : team.status === 'active' ? (
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium"
                        >
                          Active (2/2 Duo)
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-amber-50 text-amber-700 border-amber-200 font-medium"
                        >
                          Solo (1/2)
                        </Badge>
                      )}
                    </TableCell>

                    {/* Score */}
                    <TableCell className="text-right font-serif font-bold text-base text-primary-text">
                      {team.score} pts
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTeam(team)}
                          className="h-8 px-2.5 text-xs gap-1.5 text-secondary-text hover:text-primary-text hover:bg-secondary-bg cursor-pointer"
                          title="View Clan Info"
                        >
                          <Eye className="h-3.5 w-3.5 text-japan-red" />
                          <span>Details</span>
                        </Button>

                        <ConfirmDialog
                          trigger={
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-text hover:text-red-600 hover:bg-red-50 cursor-pointer"
                              title="Disband Clan"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          }
                          title="Disband Clan"
                          description={`Are you sure you want to disband "${team.name}"? All members will be returned to solo mode, and the team will be permanently deleted.`}
                          confirmLabel="Disband Team"
                          variant="destructive"
                          onConfirm={() => handleDisband(team.id)}
                          isPending={disbandTeam.isPending}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Footer & Pagination */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-muted-text">
              Showing {teams.length} of {totalCount} clans
            </p>
            {hasNextPage && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="gap-2"
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading more...
                  </>
                ) : (
                  'Load More Clans'
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Team Details Dialog */}
      <Dialog open={!!selectedTeam} onOpenChange={(open) => !open && setSelectedTeam(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedTeam && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-japan-red/10 border border-japan-red/20 flex items-center justify-center font-serif font-bold text-xl text-japan-red shrink-0">
                      {selectedTeam.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <DialogTitle className="font-serif text-2xl font-bold text-primary-text flex items-center gap-2">
                        {selectedTeam.name}
                      </DialogTitle>
                      <DialogDescription className="text-xs text-muted-text font-mono mt-0.5">
                        Team ID: {selectedTeam.id}
                      </DialogDescription>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 pt-2">
                {/* Quick Info Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-secondary-bg/60 p-4 rounded-xl border border-borders">
                  <div>
                    <p className="text-[11px] font-bold uppercase text-muted-text tracking-wider">Status</p>
                    <div className="mt-1">
                      {selectedTeam.members.length >= 3 ? (
                        <Badge className="bg-purple-600 text-white font-medium text-xs">
                          Active Trio (3/3 — Eligible)
                        </Badge>
                      ) : selectedTeam.status === 'active' ? (
                        <Badge className="bg-emerald-600 text-white font-medium text-xs">
                          Active Duo (2/2 — Eligible)
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-600 text-white font-medium text-xs">
                          Solo (1/2)
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase text-muted-text tracking-wider">Join Code</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="font-mono font-bold text-sm text-primary-text">
                        {selectedTeam.joinCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(selectedTeam.joinCode)}
                        className="text-muted-text hover:text-japan-red transition-colors p-0.5 rounded cursor-pointer"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase text-muted-text tracking-wider">Total Score</p>
                    <p className="text-base font-serif font-bold text-japan-red mt-0.5">
                      {selectedTeam.score} pts
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase text-muted-text tracking-wider">Formed On</p>
                    <p className="text-xs font-medium text-primary-text mt-1">
                      {new Date(selectedTeam.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Members Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-bold text-lg text-primary-text flex items-center gap-2">
                      <Users className="h-4 w-4 text-japan-red" />
                      Clan Warriors ({selectedTeam.members.length}/{Math.max(selectedTeam.members.length, 2)})
                    </h3>
                  </div>

                  {selectedTeam.members.map((member: AdminTeamMember) => (
                    <div
                      key={member.id}
                      className="p-4 rounded-xl border border-borders bg-card shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      {/* Left info */}
                      <div className="flex items-start gap-3.5">
                        <Avatar className="h-11 w-11 border-2 border-borders shrink-0">
                          <AvatarImage src={member.avatarUrl || ''} alt={member.username} />
                          <AvatarFallback className="font-bold text-sm bg-secondary-bg">
                            {member.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-base text-primary-text">
                              {member.fullName || member.username}
                            </span>
                            <span className="text-xs text-muted-text font-mono">
                              @{member.username}
                            </span>
                            {member.teamRole === 'leader' ? (
                              <Badge className="bg-amber-500 text-white font-medium text-[10px] h-5 gap-1">
                                <Crown className="h-2.5 w-2.5" />
                                Leader
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-text text-[10px] h-5">
                                Member
                              </Badge>
                            )}
                            <RankBadge rank={member.rank} />
                          </div>

                          {/* Academic & Contact Details */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-secondary-text pt-1">
                            {member.email && (
                              <div className="flex items-center gap-1.5 text-muted-text">
                                <Mail className="h-3 w-3 shrink-0" />
                                <span className="truncate">{member.email}</span>
                              </div>
                            )}
                            {member.phone && (
                              <div className="flex items-center gap-1.5 text-muted-text">
                                <Phone className="h-3 w-3 shrink-0" />
                                <span>{member.phone}</span>
                              </div>
                            )}
                            {(member.collegeName || member.branch) && (
                              <div className="flex items-center gap-1.5 text-muted-text">
                                <GraduationCap className="h-3 w-3 shrink-0" />
                                <span className="truncate">
                                  {member.collegeName} {member.branch ? `(${member.branch})` : ''}
                                </span>
                              </div>
                            )}
                            {member.discord && (
                              <div className="flex items-center gap-1.5 text-muted-text">
                                <MessageSquare className="h-3 w-3 shrink-0" />
                                <span>Discord: {member.discord}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <Link
                          href={`https://github.com/${member.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-muted-text hover:text-primary-text border border-borders px-2.5 py-1.5 rounded-md hover:bg-secondary-bg transition-colors"
                        >
                          <GithubIcon className="h-3.5 w-3.5" />
                          <span>GitHub</span>
                        </Link>

                        <ConfirmDialog
                          trigger={
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2 gap-1 cursor-pointer"
                              title="Remove warrior from team"
                            >
                              <UserMinus className="h-3.5 w-3.5" />
                              <span>Remove</span>
                            </Button>
                          }
                          title="Remove Team Member"
                          description={`Are you sure you want to remove ${member.fullName || member.username} from this team? They will be returned to solo mode.`}
                          confirmLabel="Remove Member"
                          variant="destructive"
                          onConfirm={() => handleRemoveMember(selectedTeam.id, member.id)}
                          isPending={removeMember.isPending}
                        />
                      </div>
                    </div>
                  ))}
                </div>

              {/* Modal Actions Footer */}
              <div className="pt-4 border-t border-borders flex items-center justify-between">
                <ConfirmDialog
                  trigger={
                    <Button variant="destructive" size="sm" className="gap-1.5 cursor-pointer">
                      <Trash2 className="h-4 w-4" />
                      <span>Disband Entire Clan</span>
                    </Button>
                  }
                  title="Disband Clan"
                  description={`Are you sure you want to disband "${selectedTeam.name}"? All members will become solo and the team will be permanently deleted.`}
                  confirmLabel="Disband Clan"
                  variant="destructive"
                  onConfirm={() => handleDisband(selectedTeam.id)}
                  isPending={disbandTeam.isPending}
                />

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTeam(null)}
                  className="cursor-pointer"
                >
                  Close
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
    </div>
  );
}
