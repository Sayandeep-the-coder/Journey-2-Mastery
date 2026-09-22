'use client';

import { useState } from 'react';
import { useAdminTasks, useCreateTask, useDeleteTask, useToggleAllTasks } from '@/hooks/queries/useAdminDashboard';
import { useTaskCategories } from '@/hooks/queries/useTasks';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import EmptyState from '@/components/shared/EmptyState';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskSchema, type TaskForm } from '@/lib/validators/schemas';
import { TASK_CATEGORIES } from '@/types/api.types';

const defaultCriteria = [
  { id: "codeQuality", name: "Code Quality", maxScore: 25, description: "Clean, readable, well-structured code" },
  { id: "functionality", name: "Functionality", maxScore: 25, description: "All requirements met and working" },
  { id: "documentation", name: "Documentation", maxScore: 15, description: "README, comments, and code documentation" },
  { id: "testing", name: "Testing", maxScore: 15, description: "Test coverage and test quality" },
  { id: "creativity", name: "Creativity", maxScore: 20, description: "Innovation, UX, and going above requirements" },
];

export default function AdminTasksPage() {
  const { data: tasks, isLoading, isError, error, refetch } = useAdminTasks();
  const { data: categories } = useTaskCategories();
  const categoryOptions = Array.from(
    new Set([
      ...TASK_CATEGORIES,
      ...(categories?.map((c) => c.name) || []),
    ])
  );
  const createTask = useCreateTask();
  const deleteTask = useDeleteTask();
  const toggleAllTasks = useToggleAllTasks();
  const [dialogOpen, setDialogOpen] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<TaskForm>({
    resolver: zodResolver(taskSchema) as any,
    defaultValues: {
      bonusPoints: 0,
      criteria: defaultCriteria,
      passingScore: 50,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "criteria",
  });

  const watchedCriteria = form.watch('criteria') || [];
  const totalMaxCriteria = watchedCriteria.reduce((sum, c) => sum + (Number(c.maxScore) || 0), 0);
  const watchedPassingScore = form.watch('passingScore') || 0;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'description' | 'requirements') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) form.setValue(fieldName, text, { shouldValidate: true, shouldDirty: true });
    };
    reader.readAsText(file);
  };

  const handleCreate = (data: TaskForm) => {
    const formattedData = {
      ...data,
      criteria: data.criteria.map((c, i) => ({
        ...c,
        id: c.id?.trim() ? c.id : (c.name.toLowerCase().replace(/[^a-z0-9]/g, '') || `criterion_${i + 1}`),
        maxScore: Number(c.maxScore) || 0,
      })),
      passingScore: Number(data.passingScore),
    };

    createTask.mutate(formattedData as any, {
      onSuccess: () => {
        toast.success('Task created');
        setDialogOpen(false);
        form.reset({
          bonusPoints: 0,
          criteria: defaultCriteria,
          passingScore: 50,
        });
      },
      onError: (err) => toast.error(err.message),
    });
  };

  if (isLoading) return <LoadingSkeleton variant="table" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const diffColors: Record<string, string> = { easy: 'bg-emerald-100 text-emerald-700', medium: 'bg-amber-100 text-amber-700', hard: 'bg-red-100 text-red-700' };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="font-serif text-3xl font-bold text-primary-text">Tasks</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-md shadow-sm border border-border">
            <EyeOff className="h-4 w-4 text-muted-text" />
            <Label htmlFor="hide-tasks-switch" className="text-sm font-medium cursor-pointer">Hide All Tasks</Label>
            <Switch 
              id="hide-tasks-switch"
              checked={tasks?.every(t => !t.isActive) ?? false}
              onCheckedChange={(checked) => {
                toggleAllTasks.mutate(!checked, {
                  onSuccess: () => toast.success(checked ? 'All tasks are now hidden' : 'All tasks are now visible')
                });
              }}
              disabled={toggleAllTasks.isPending || !tasks || tasks.length === 0}
            />
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Create Task</Button>
            </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>New Task</DialogTitle></DialogHeader>
            <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input {...form.register('title')} />
                {form.formState.errors.title && <p className="text-xs text-red-600">{form.formState.errors.title.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Short Description</Label>
                <Input {...form.register('shortDescription')} placeholder="A quick summary of the task..." />
                {form.formState.errors.shortDescription && <p className="text-xs text-red-600">{form.formState.errors.shortDescription.message}</p>}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Task Details (Markdown)</Label>
                  <label className="text-xs text-japan-red cursor-pointer font-bold hover:underline">
                    Upload .md
                    <input type="file" accept=".md" className="hidden" onChange={(e) => handleFileUpload(e, 'description')} />
                  </label>
                </div>
                <Textarea {...form.register('description')} className="min-h-[150px] font-mono text-xs" placeholder="# Overview&#10;Write markdown here..." />
                {form.formState.errors.description && <p className="text-xs text-red-600">{form.formState.errors.description.message}</p>}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Requirements & Rubric (Markdown)</Label>
                  <label className="text-xs text-japan-red cursor-pointer font-bold hover:underline">
                    Upload .md
                    <input type="file" accept=".md" className="hidden" onChange={(e) => handleFileUpload(e, 'requirements')} />
                  </label>
                </div>
                <Textarea {...form.register('requirements')} className="min-h-[100px] font-mono text-xs" placeholder="- Must be responsive&#10;- Smooth animations" />
                {form.formState.errors.requirements && <p className="text-xs text-red-600">{form.formState.errors.requirements.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Controller name="category" control={form.control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )} />
                  {form.formState.errors.category && <p className="text-xs text-red-600">{form.formState.errors.category.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Controller name="difficulty" control={form.control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="easy">Easy</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="hard">Hard</SelectItem></SelectContent></Select>
                  )} />
                  {form.formState.errors.difficulty && <p className="text-xs text-red-600">{form.formState.errors.difficulty.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Points</Label><Input type="number" {...form.register('points')} />
                  {form.formState.errors.points && <p className="text-xs text-red-600">{form.formState.errors.points.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Bonus Points</Label><Input type="number" {...form.register('bonusPoints')} />
                  {form.formState.errors.bonusPoints && <p className="text-xs text-red-600">{form.formState.errors.bonusPoints.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Rank Required</Label>
                  <Controller name="rankRequired" control={form.control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue placeholder="None" /></SelectTrigger><SelectContent><SelectItem value="Ronin">Ronin</SelectItem><SelectItem value="Kenshi">Kenshi</SelectItem><SelectItem value="Samurai">Samurai</SelectItem><SelectItem value="Shogun">Shogun</SelectItem></SelectContent></Select>
                  )} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Deadline</Label>
                <Input type="datetime-local" {...form.register('deadline')} />
              </div>

              {/* Judging Criteria & Rubric */}
              <div className="space-y-3 pt-3 border-t border-borders">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold">Judging Criteria & Rubric *</Label>
                    <p className="text-xs text-muted-text">Define scoring criteria and max points for evaluating submissions</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ id: `criterion_${Date.now()}`, name: '', description: '', maxScore: 10 })}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Criterion
                  </Button>
                </div>

                {form.formState.errors.criteria?.message && (
                  <p className="text-xs text-red-600 font-medium">{form.formState.errors.criteria.message}</p>
                )}

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {fields.map((field, idx) => (
                    <div key={field.id} className="p-3 border border-borders rounded-lg bg-card-bg space-y-2 relative">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <Input
                            {...form.register(`criteria.${idx}.name` as const)}
                            placeholder="Criterion Name (e.g. Code Quality)"
                            className="h-8 text-xs font-medium"
                          />
                          {form.formState.errors.criteria?.[idx]?.name && (
                            <p className="text-[11px] text-red-600 mt-0.5">{form.formState.errors.criteria[idx]?.name?.message}</p>
                          )}
                        </div>
                        <div className="w-28 flex items-center gap-1 shrink-0">
                          <Input
                            type="number"
                            min={1}
                            {...form.register(`criteria.${idx}.maxScore` as const, { valueAsNumber: true })}
                            placeholder="Max"
                            className="h-8 text-xs text-center"
                          />
                          <span className="text-xs text-muted-text">pts</span>
                        </div>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-text hover:text-red-600 shrink-0"
                            onClick={() => remove(idx)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                      <Input
                        {...form.register(`criteria.${idx}.description` as const)}
                        placeholder="Evaluation description (e.g. Clean, readable code)"
                        className="h-7 text-[11px] text-muted-text"
                      />
                    </div>
                  ))}
                </div>

                {/* Criteria Summary & Passing Threshold */}
                <div className="p-3 bg-secondary-bg rounded-lg border border-borders space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-secondary-text font-medium">Total Maximum Score:</span>
                    <span className="font-bold text-sm text-japan-red">{totalMaxCriteria} pts</span>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-borders">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold">Approval Lowest Score (Passing Score) *</Label>
                      <span className="text-[11px]">
                        {watchedPassingScore > 0 && watchedPassingScore <= totalMaxCriteria ? (
                          <span className="text-emerald-600 font-medium">Valid threshold</span>
                        ) : (
                          <span className="text-red-600 font-medium">Must be 1 – {totalMaxCriteria} pts</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={1}
                        max={totalMaxCriteria || 1000}
                        {...form.register('passingScore', { valueAsNumber: true })}
                        className="h-8 text-sm w-32"
                      />
                      <span className="text-xs text-muted-text">/ {totalMaxCriteria} points minimum required to approve</span>
                    </div>
                    {form.formState.errors.passingScore && (
                      <p className="text-xs text-red-600 font-medium">{form.formState.errors.passingScore.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full mt-4" disabled={createTask.isPending}>{createTask.isPending ? 'Creating...' : 'Create Task'}</Button>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {!tasks || tasks.length === 0 ? (
        <EmptyState icon="list" title="No tasks" message="Create your first task to get started." />
      ) : (
        <div className="border border-borders rounded-lg overflow-hidden">
          <Table>
            <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Difficulty</TableHead><TableHead>Points</TableHead><TableHead>Status</TableHead><TableHead>Deadline</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {tasks.map((t) => (
                <TableRow key={t.id}>
                  <TableCell><Link href={`/admin/tasks/${t.id}`} className="text-sm font-medium text-primary-text hover:text-japan-red">{t.title}</Link></TableCell>
                  <TableCell><Badge variant="outline" className={diffColors[t.difficulty]}>{t.difficulty}</Badge></TableCell>
                  <TableCell className="font-semibold text-japan-red">{t.points}</TableCell>
                  <TableCell>
                    {t.isActive ? <Badge variant="default" className="bg-green-600 hover:bg-green-700">Visible</Badge> : <Badge variant="secondary" className="text-muted-foreground">Hidden</Badge>}
                  </TableCell>
                  <TableCell>
                    {t.deadline ? <Badge variant="outline">{new Date(t.deadline).toLocaleDateString()}</Badge> : <Badge variant="secondary">No deadline</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <ConfirmDialog trigger={<Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-red-500" /></Button>} title="Delete task?" description={`This will permanently delete "${t.title}".`} confirmLabel="Delete" variant="destructive" onConfirm={() => deleteTask.mutate(t.id, { onSuccess: () => toast.success('Task deleted') })} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
