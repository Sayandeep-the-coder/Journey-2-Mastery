'use client';

import { useState } from 'react';
import { useAuditLog } from '@/hooks/queries/useAuditLog';
import { useDebounce } from '@/hooks/useDebounce';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import EmptyState from '@/components/shared/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileBarChart, Search, Download } from 'lucide-react';
import { csvDownload } from '@/lib/api-client';
import { toast } from 'sonner';

export default function AdminReportsPage() {
  const [actor, setActor] = useState('');
  const debouncedActor = useDebounce(actor, 500);
  const [action, setAction] = useState('');
  const [exportingSubmissions, setExportingSubmissions] = useState(false);
  const [exportingUsers, setExportingUsers] = useState(false);
  const { data: logs, isLoading, isError, error, refetch } = useAuditLog({
    actor: debouncedActor || undefined,
    action: action || undefined,
  });

  if (isLoading) return <LoadingSkeleton variant="table" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const handleExportSubmissions = async () => {
    setExportingSubmissions(true);
    try {
      await csvDownload('/admin/reports/submissions', 'submissions.csv');
      toast.success('Submissions CSV exported');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExportingSubmissions(false);
    }
  };

  const handleExportUsers = async () => {
    setExportingUsers(true);
    try {
      await csvDownload('/admin/reports/users', 'users.csv');
      toast.success('Users CSV exported');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExportingUsers(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold text-primary-text flex items-center gap-3">
          <FileBarChart className="h-7 w-7 text-japan-red" />Reports & Audit Log
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportSubmissions} disabled={exportingSubmissions} className="cursor-pointer">
            <Download className="h-4 w-4 mr-1" />{exportingSubmissions ? 'Exporting...' : 'Submissions CSV'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportUsers} disabled={exportingUsers} className="cursor-pointer">
            <Download className="h-4 w-4 mr-1" />{exportingUsers ? 'Exporting...' : 'Users CSV'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-text" />
          <Input value={actor} onChange={(e) => setActor(e.target.value)} placeholder="Filter by actor..." className="pl-9" />
        </div>
        <Select value={action} onValueChange={(v) => setAction(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-48"><SelectValue placeholder="All Actions" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="create">Create</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
            <SelectItem value="role_change">Role Change</SelectItem>
            <SelectItem value="override">Override</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Audit Log Table */}
      {!logs || logs.length === 0 ? (
        <EmptyState icon="file" title="No activity" message="No audit log entries match the filter." />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-xs text-muted-text whitespace-nowrap">{new Date(entry.createdAt).toLocaleString()}</TableCell>
                    <TableCell className="text-sm font-medium">{entry.actorName}</TableCell>
                    <TableCell className="text-sm capitalize">{entry.action.replace('_', ' ')}</TableCell>
                    <TableCell className="text-sm text-muted-text">{entry.targetType} #{entry.targetId.slice(0, 8)}</TableCell>
                    <TableCell className="text-xs text-secondary-text max-w-xs truncate">{entry.details || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
