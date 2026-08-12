'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAdminUser, useChangeUserRole, useDeleteUser } from '@/hooks/queries/useAdminDashboard';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import RankBadge from '@/components/shared/RankBadge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AdminUserDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: user, isLoading, isError, error, refetch } = useAdminUser(id);
  const changeRole = useChangeUserRole();
  const deleteUser = useDeleteUser();
  const router = useRouter();

  if (isLoading) return <LoadingSkeleton variant="detail" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  if (!user) return null;

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/admin/users" className="inline-flex items-center gap-1 text-sm text-muted-text hover:text-primary-text transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Users
      </Link>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20">
              {user.avatarUrl && <AvatarImage src={user.avatarUrl} />}
              <AvatarFallback className="text-2xl">{(user.fullName || user.username)?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="font-serif text-2xl font-bold text-primary-text">{user.fullName || user.username}</h1>
                <RankBadge rank={user.rank} />
              </div>
              <p className="text-sm text-muted-text">@{user.username}</p>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-sm text-secondary-text">Role:</span>
                <Select
                  value={user.role}
                  onValueChange={(role) => changeRole.mutate({ id, role }, { onSuccess: () => { toast.success('Role updated'); refetch(); } })}
                >
                  <SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="judge">Judge</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-6">
            <div><p className="text-xs text-muted-text mb-1">Score</p><p className="text-lg font-bold text-japan-red">{user.score} pts</p></div>
            <div><p className="text-xs text-muted-text mb-1">Submissions</p><p className="text-lg font-bold">{user.submissionCount || 0}</p></div>
            {user.collegeName && <div><p className="text-xs text-muted-text mb-1">College</p><p className="text-sm">{user.collegeName}</p></div>}
            {user.email && <div><p className="text-xs text-muted-text mb-1">Email</p><p className="text-sm">{user.email}</p></div>}
            {user.phone && <div><p className="text-xs text-muted-text mb-1">Phone</p><p className="text-sm">{user.phone}</p></div>}
            {user.branch && <div><p className="text-xs text-muted-text mb-1">Branch</p><p className="text-sm">{user.branch}</p></div>}
          </div>
          {user.bio && (
            <>
              <Separator className="my-4" />
              <p className="text-sm text-secondary-text">{user.bio}</p>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-red-200 bg-red-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-red-600 flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
            <Trash2 className="h-4 w-4" /> Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-secondary-text mb-4 leading-relaxed">
            Permanently delete this user and all their data. This action cannot be undone.
          </p>
          <ConfirmDialog
            trigger={
              <Button variant="destructive" disabled={deleteUser.isPending} className="font-bold cursor-pointer">
                <Trash2 className="h-4 w-4 mr-2" />
                {deleteUser.isPending ? 'Deleting...' : 'Delete User'}
              </Button>
            }
            title="Delete user?"
            description={`This will permanently delete ${user.fullName || user.username} and all their data.`}
            confirmLabel="Delete"
            variant="destructive"
            onConfirm={() => deleteUser.mutate(id, { 
              onSuccess: () => { 
                toast.success('User deleted'); 
                router.push('/admin/users'); 
              } 
            })}
          />
        </CardContent>
      </Card>
    </div>
  );
}
