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
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import type { Task, Difficulty, Rank, TaskCategory, ReviewCriterion, Track } from '@/types/api.types';
import { TASK_CATEGORIES, TRACKS, WEB3_TASK_TYPES } from '@/types/api.types';

function EditForm({ task, id }: { task: Task; id: string }) {
  const updateTask = useUpdateTask();
  const [title, setTitle] = useState(task.title);
  const [shortDescription, setShortDescription] = useState(task.shortDescription || '');
  const [description, setDescription] = useState(task.description);
  const [requirements, setRequirements] = useState(task.requirements || '');
  const [track, setTrack] = useState<Track | string>(task.track || 'main');
  const [taskType, setTaskType] = useState<string>(task.taskType || '');
  const [category, setCategory] = useState<TaskCategory | string>(task.category || 'Frontend');
  const [difficulty, setDifficulty] = useState<Difficulty>(task.difficulty || 'easy');
  const [rankRequired, setRankRequired] = useState<Rank>(task.rankRequired || 'Ronin');
  const [points, setPoints] = useState(task.points);
  const [bonusPoints, setBonusPoints] = useState(task.bonusPoints || 0);
  const [deadline, setDeadline] = useState(task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '');
  const [isActive, setIsActive] = useState(task.isActive ?? true);
  const [criteria, setCriteria] = useState<ReviewCriterion[]>(
    task.criteria && task.criteria.length > 0
      ? task.criteria
      : [
          { id: "codeQuality", name: "Code Quality", maxScore: 25, description: "Clean, readable, well-structured code" },
          { id: "functionality", name: "Functionality", maxScore: 25, description: "All requirements met and working" },
          { id: "documentation", name: "Documentation", maxScore: 15, description: "README, comments, and code documentation" },
          { id: "testing", name: "Testing", maxScore: 15, description: "Test coverage and test quality" },
          { id: "creativity", name: "Creativity", maxScore: 20, description: "Innovation, UX, and going above requirements" },
        ]
  );
  const [passingScore, setPassingScore] = useState<number>(task.passingScore ?? 50);

  const totalMaxCriteria = criteria.reduce((sum, c) => sum + (Number(c.maxScore) || 0), 0);

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

  const handleUpdateCriterion = (index: number, field: keyof ReviewCriterion, value: any) => {
    setCriteria((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };

  const handleAddCriterion = () => {
    setCriteria((prev) => [
      ...prev,
      {
        id: `criterion_${Date.now()}`,
        name: '',
        description: '',
        maxScore: 10,
      },
    ]);
  };

  const handleRemoveCriterion = (index: number) => {
    if (criteria.length <= 1) {
      toast.error('Task must have at least one judging criterion');
      return;
    }
    setCriteria((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (criteria.length === 0) {
      toast.error('At least one criterion is required');
      return;
    }
    if (criteria.some((c) => !c.name.trim())) {
      toast.error('All criteria must have a name');
      return;
    }
    if (passingScore <= 0 || passingScore > totalMaxCriteria) {
      toast.error(`Approval lowest score must be between 1 and ${totalMaxCriteria}`);
      return;
    }

    const formattedCriteria = criteria.map((c, idx) => ({
      ...c,
      id: c.id?.trim() ? c.id : (c.name.toLowerCase().replace(/[^a-z0-9]/g, '') || `criterion_${idx + 1}`),
      maxScore: Number(c.maxScore) || 1,
    }));

    updateTask.mutate(
      { 
        id, 
        title, 
        shortDescription, 
        description, 
        requirements, 
        track: track as Track,
        taskType: track === 'web3' ? (taskType || 'Smart Contract') : undefined,
        category: (track === 'web3' ? 'Web3' : category) as TaskCategory,
        difficulty,
        rankRequired,
        points, 
        bonusPoints, 
        deadline: deadline ? new Date(deadline).toISOString() : null, 
        isActive,
        criteria: formattedCriteria,
        passingScore: Number(passingScore),
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
            <Label>Track</Label>
            <Select 
              value={track} 
              onValueChange={(val) => {
                setTrack(val);
                if (val === 'web3') {
                  setCategory('Web3');
                  if (!taskType) setTaskType('Smart Contract');
                } else {
                  if (category === 'Web3') setCategory('Frontend');
                }
              }}
            >
              <SelectTrigger><SelectValue placeholder="Select Track" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="main">Main Track (Martial Journey)</SelectItem>
                <SelectItem value="web3">Web3 Track (Decentralized Path)</SelectItem>
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

        <div className="grid grid-cols-2 gap-4">
          {track === 'web3' ? (
            <div className="space-y-2">
              <Label>Web3 Task Type</Label>
              <Select value={taskType || 'Smart Contract'} onValueChange={setTaskType}>
                <SelectTrigger><SelectValue placeholder="Select Web3 Type" /></SelectTrigger>
                <SelectContent>
                  {WEB3_TASK_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                <SelectContent>
                  {TASK_CATEGORIES.filter(c => c !== 'Web3').map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
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
        {/* Judging Criteria & Rubric */}
        <div className="space-y-3 pt-3 border-t border-borders">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-semibold">Judging Criteria & Rubric</Label>
              <p className="text-xs text-muted-text">Customize scoring criteria and max points for evaluating submissions</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddCriterion}
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Criterion
            </Button>
          </div>

          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {criteria.map((crit, idx) => (
              <div key={idx} className="p-3 border border-borders rounded-lg bg-card-bg space-y-2 relative">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      value={crit.name}
                      onChange={(e) => handleUpdateCriterion(idx, 'name', e.target.value)}
                      placeholder="Criterion Name (e.g. Code Quality)"
                      className="h-8 text-xs font-medium"
                    />
                  </div>
                  <div className="w-28 flex items-center gap-1 shrink-0">
                    <Input
                      type="number"
                      min={1}
                      value={crit.maxScore}
                      onChange={(e) => handleUpdateCriterion(idx, 'maxScore', Math.max(1, parseInt(e.target.value) || 1))}
                      placeholder="Max"
                      className="h-8 text-xs text-center"
                    />
                    <span className="text-xs text-muted-text">pts</span>
                  </div>
                  {criteria.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-text hover:text-red-600 shrink-0"
                      onClick={() => handleRemoveCriterion(idx)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
                <Input
                  value={crit.description || ''}
                  onChange={(e) => handleUpdateCriterion(idx, 'description', e.target.value)}
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
                <Label className="text-xs font-semibold">Approval Lowest Score (Passing Score)</Label>
                <span className="text-[11px]">
                  {passingScore > 0 && passingScore <= totalMaxCriteria ? (
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
                  value={passingScore}
                  onChange={(e) => setPassingScore(parseInt(e.target.value) || 0)}
                  className="h-8 text-sm w-32"
                />
                <span className="text-xs text-muted-text">/ {totalMaxCriteria} points minimum required to approve</span>
              </div>
            </div>
          </div>
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
