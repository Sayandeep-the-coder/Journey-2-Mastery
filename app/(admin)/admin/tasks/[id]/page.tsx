'use client';

import { useParams } from 'next/navigation';
import { useAdminTasks, useUpdateTask } from '@/hooks/queries/useAdminDashboard';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import type { Task, Difficulty, Rank, TaskCategory } from '@/types/api.types';
import { TASK_CATEGORIES } from '@/types/api.types';

function EditForm({ task, id }: { task: Task; id: string }) {
  const updateTask = useUpdateTask();
  const [title, setTitle] = useState(task.title);
  const [shortDescription, setShortDescription] = useState(task.shortDescription || '');
  const [description, setDescription] = useState(task.description);
  const [requirements, setRequirements] = useState(task.requirements || '');
  const [category, setCategory] = useState<TaskCategory | string>(task.category || 'Frontend');
  const [difficulty, setDifficulty] = useState<Difficulty>(task.difficulty || 'easy');
  const [rankRequired, setRankRequired] = useState<Rank>(task.rankRequired || 'Ronin');
  const [points, setPoints] = useState(task.points);
  const [bonusPoints, setBonusPoints] = useState(task.bonusPoints || 0);
  const [deadline, setDeadline] = useState(task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '');
  const [isActive, setIsActive] = useState(task.isActive ?? true);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'description' | 'requirements') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        if (fieldName === 'description') setDescription(text);
        else setRequirements(text);
      }
    };
    reader.readAsText(file);
  };

  const handleSave = () => {
    updateTask.mutate(
      { 
        id, 
        title, 
        shortDescription, 
        description, 
        requirements, 
        category: category as TaskCategory,
        difficulty,
        rankRequired,
        points, 
        bonusPoints, 
        deadline: deadline ? new Date(deadline).toISOString() : null, 
        isActive 
      },
      { 
        onSuccess: () => toast.success('Task updated'),
        onError: (err) => toast.error(err.message || 'Failed to update task'),
      }
    );
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <div className="space-y-2"><Label>Short Description</Label><Input value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} placeholder="A quick summary..." /></div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Task Details (Markdown)</Label>
            <label className="text-xs text-japan-red cursor-pointer font-bold hover:underline">
              Upload .md
              <input type="file" accept=".md" className="hidden" onChange={(e) => handleFileUpload(e, 'description')} />
            </label>
          </div>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-30 font-mono text-sm" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Requirements (Markdown)</Label>
            <label className="text-xs text-japan-red cursor-pointer font-bold hover:underline">
              Upload .md
              <input type="file" accept=".md" className="hidden" onChange={(e) => handleFileUpload(e, 'requirements')} />
            </label>
          </div>
          <Textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} className="min-h-30 font-mono text-sm" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
              <SelectContent>
                {TASK_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Difficulty</Label>
            <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
              <SelectTrigger><SelectValue placeholder="Select Difficulty" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Rank Required</Label>
          <Select value={rankRequired} onValueChange={(v) => setRankRequired(v as Rank)}>
            <SelectTrigger><SelectValue placeholder="Select Rank" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Ronin">Ronin</SelectItem>
              <SelectItem value="Kenshi">Kenshi</SelectItem>
              <SelectItem value="Samurai">Samurai</SelectItem>
              <SelectItem value="Shogun">Shogun</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Points</Label><Input type="number" value={points} onChange={(e) => setPoints(Number(e.target.value))} /></div>
          <div className="space-y-2"><Label>Bonus Points</Label><Input type="number" value={bonusPoints} onChange={(e) => setBonusPoints(Number(e.target.value))} /></div>
        </div>

        <div className="space-y-2"><Label>Deadline</Label><Input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} /></div>

        <div className="flex items-center justify-between rounded-lg border border-borders p-4">
          <div><Label>Active</Label><p className="text-xs text-muted-text">Allow new submissions</p></div>
          <Switch checked={isActive} onCheckedChange={setIsActive} />
        </div>
        <Button onClick={handleSave} disabled={updateTask.isPending} className="w-full">
          <Save className="h-4 w-4 mr-2" />{updateTask.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function AdminTaskDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: tasks, isLoading, isError, error, refetch } = useAdminTasks();
  const task = tasks?.find((t) => t.id === id);

  if (isLoading) return <LoadingSkeleton variant="form" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  if (!task) return <ErrorState error="Task not found" />;

  return (
    <div className="max-w-2xl space-y-6">
      <Link href="/admin/tasks" className="inline-flex items-center gap-1 text-sm text-muted-text hover:text-primary-text transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Tasks
      </Link>

      <h1 className="font-serif text-2xl font-bold text-primary-text">Edit Task</h1>

      <EditForm key={task.id} task={task} id={id} />
    </div>
  );
}
