'use client';

import { useAdminLeaderboard, useRecalculateLeaderboard } from '@/hooks/queries/useAdminDashboard';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import RankBadge from '@/components/shared/RankBadge';
import WarriorProfileDialog from '@/components/shared/WarriorProfileDialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, RefreshCw, Download, Shield, Eye, Users } from 'lucide-react';
import { csvDownload } from '@/lib/api-client';
import { toast } from 'sonner';
import { useState } from 'react';
import type { Rank } from '@/types/api.types';

function getPureMartialRank(score: number, rank?: string): Rank {
  if (rank && ['Ronin', 'Kenshi', 'Samurai', 'Shogun'].includes(rank)) {
    return rank as Rank;
  }
  if (score >= 300) return 'Shogun';
  if (score >= 200) return 'Samurai';
  if (score >= 100) return 'Kenshi';
  return 'Ronin';
}

export default function AdminLeaderboardPage() {
  const { data: entries, isLoading, isError, error, refetch } = useAdminLeaderboard();
  const recalculate = useRecalculateLeaderboard();
  const [exporting, setExporting] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<'warrior' | 'clan'>('clan');
  const [selectedPreview, setSelectedPreview] = useState<any>(null);
  const [selectedClanPreview, setSelectedClanPreview] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenClan = (team: any) => {
    setSelectedTeamId(team.teamId || team.userId || team.id);
    setSelectedUserId(null);
    setSelectedClanPreview(team);
    setDialogMode('clan');
    setDialogOpen(true);
  };

  const handleOpenWarrior = (member: any, teamContext?: any) => {
    const id = member.userId || member.id;
    if (id) {
      setSelectedUserId(id);
      setSelectedTeamId(teamContext?.teamId || teamContext?.userId || member.teamId || null);
      setSelectedPreview(member);
      setDialogMode('warrior');
      setDialogOpen(true);
    }
  };

  const handleOpenEntry = (e: any) => {
    if (e.teamType === 'solo' && (!e.teamId || e.userId === e.teamId)) {
      const member = e.teamMembers?.[0] || e;
      handleOpenWarrior(member, e);
    } else {
      handleOpenClan(e);
    }
  };

  if (isLoading) return <LoadingSkeleton variant="table" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const handleExport = async () => {
    setExporting(true);
    try {
      await csvDownload('/admin/leaderboard/export', 'leaderboard.csv');
      toast.success('Leaderboard CSV exported');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary-text flex items-center gap-3">
            <Trophy className="h-7 w-7 text-japan-red" />
            Leaderboard Management
          </h1>
          <p className="text-sm text-secondary-text mt-1">
            Real-time rankings for clans and solo warriors with format tracking and pure martial rank progression.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting} className="cursor-pointer">
            <Download className="h-4 w-4 mr-1" />{exporting ? 'Exporting...' : 'Export CSV'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => recalculate.mutate()} disabled={recalculate.isPending} className="cursor-pointer">
            <RefreshCw className="h-4 w-4 mr-1" />{recalculate.isPending ? 'Recalculating...' : 'Recalculate'}
          </Button>
        </div>
      </div>

      {entries && entries.length > 0 ? (
        <Card className="border-borders shadow-sm bg-card overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary-bg/50">
                  <TableHead className="w-16 text-center font-bold">Rank</TableHead>
                  <TableHead className="font-bold">Clan / Warrior</TableHead>
                  <TableHead className="font-bold">Warriors</TableHead>
                  <TableHead className="font-bold">Team Format</TableHead>
                  <TableHead className="font-bold">Martial Title</TableHead>
                  <TableHead className="text-right font-bold">Score</TableHead>
                  <TableHead className="text-right font-bold">Tasks</TableHead>
                  <TableHead className="text-right font-bold w-28">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((e) => {
                  const pureRank = getPureMartialRank(e.score, e.userRank as string);
                  const isTrio = e.teamType === 'trio' || (e.teamMembers && e.teamMembers.length >= 3);
                  const isDuo = e.teamType === 'duo' || (e.teamMembers && e.teamMembers.length === 2);
                  const isSolo = e.teamType === 'solo';

                  return (
                    <TableRow
                      key={e.teamId || e.userId}
                      className="hover:bg-muted/40 transition-colors cursor-pointer group"
                      onClick={() => handleOpenEntry(e)}
                    >
                      {/* Team Rank */}
                      <TableCell className="font-serif font-bold text-center text-secondary-text">
                        {e.score > 0 && e.rank > 0 ? (
                          e.rank <= 3 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-japan-red text-white text-xs font-bold">
                              {e.rank}
                            </span>
                          ) : (
                            `#${e.rank}`
                          )
                        ) : (
                          <span className="text-muted-text font-serif text-sm font-medium">—</span>
                        )}
                      </TableCell>

                      {/* Clan / Warrior Crest & Name */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 rounded-xl border border-borders shadow-2xs group-hover:border-japan-red transition-all">
                            {e.avatarUrl && <AvatarImage src={e.avatarUrl} alt={e.userName} className="rounded-xl object-cover" />}
                            <AvatarFallback className="font-serif font-black text-sm bg-secondary-bg text-primary-text rounded-xl">
                              {(e.teamName || e.userName)?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-primary-text group-hover:text-japan-red transition-colors">
                              {e.teamName || e.userName}
                            </span>
                            {isSolo && e.teamMembers?.[0]?.username && e.teamMembers[0].username !== (e.teamName || e.userName) && (
                              <span className="text-[11px] text-muted-text font-mono">
                                @{e.teamMembers[0].username}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Warriors Avatar Stack */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-1.5">
                            {e.teamMembers?.map((member, idx) => (
                              <button
                                key={member.userId || member.id || idx}
                                type="button"
                                title={`Inspect ${member.userName || member.username}`}
                                onClick={(evt) => {
                                  evt.stopPropagation();
                                  handleOpenWarrior(member, e);
                                }}
                                className="relative hover:z-20 hover:scale-125 transition-transform cursor-pointer rounded-full"
                              >
                                <Avatar className="h-7 w-7 border-2 border-white shadow-2xs ring-1 ring-borders/60">
                                  {member.avatarUrl && <AvatarImage src={member.avatarUrl} alt={member.userName} />}
                                  <AvatarFallback className="text-[10px] font-bold bg-secondary-bg">
                                    {(member.userName || member.username)?.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              </button>
                            ))}
                          </div>
                          <span className="text-xs font-medium text-muted-text">
                            {isSolo ? 'Solo' : `${e.teamMembers?.length || 1} warriors`}
                          </span>
                        </div>
                      </TableCell>

                      {/* Team Format Badge */}
                      <TableCell>
                        {isTrio ? (
                          <Badge
                            variant="outline"
                            className="bg-purple-50 text-purple-700 border-purple-200 font-semibold text-xs"
                          >
                            Active (3/3 Trio)
                          </Badge>
                        ) : isDuo ? (
                          <Badge
                            variant="outline"
                            className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold text-xs"
                          >
                            Active (2/2 Duo)
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-amber-50 text-amber-700 border-amber-200 font-semibold text-xs"
                          >
                            Solo Warrior
                          </Badge>
                        )}
                      </TableCell>

                      {/* Pure Martial Title */}
                      <TableCell>
                        <RankBadge rank={pureRank} size="sm" />
                      </TableCell>

                      {/* Score */}
                      <TableCell className="text-right font-serif font-bold text-sm text-primary-text">
                        {e.score} pts
                      </TableCell>

                      {/* Tasks */}
                      <TableCell className="text-right text-muted-text text-sm font-medium">
                        {e.tasksCompleted}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2.5 text-xs gap-1.5 text-secondary-text hover:text-japan-red hover:bg-secondary-bg cursor-pointer"
                          onClick={(evt) => {
                            evt.stopPropagation();
                            handleOpenEntry(e);
                          }}
                        >
                          {isSolo ? (
                            <>
                              <Eye className="h-3.5 w-3.5 text-japan-red" />
                              <span>Inspect</span>
                            </>
                          ) : (
                            <>
                              <Shield className="h-3.5 w-3.5 text-japan-red" />
                              <span>Inspect</span>
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <p className="text-muted-text text-center py-8">No leaderboard data.</p>
      )}

      {/* Interactive Warrior & Clan Profile Dialog */}
      <WarriorProfileDialog
        userId={selectedUserId}
        teamId={selectedTeamId}
        mode={dialogMode}
        isOpen={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedUserId(null);
          setSelectedTeamId(null);
          setSelectedPreview(null);
          setSelectedClanPreview(null);
        }}
        initialData={selectedPreview}
        initialClanData={selectedClanPreview}
      />
    </div>
  );
}
