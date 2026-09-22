'use client';

import { useState, useMemo } from 'react';
import { useEmailStats, useSendBroadcastEmail, useSendTestEmail } from '@/hooks/queries/useAdminEmails';
import { useSession } from '@/hooks/useSession';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Mail,
  Send,
  Eye,
  Code2,
  Users,
  Smartphone,
  Monitor,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';

// ──────────────────────────────────────────────
// Pre-built Starter Templates
// ──────────────────────────────────────────────

const TEMPLATES: Record<string, { label: string; subject: string; html: string }> = {
  announcement: {
    label: '📢 Platform Announcement',
    subject: '📢 Important Update: Journey to Mastery',
    html: `<style>
  .email-header { background: linear-gradient(135deg, #18181b 0%, #27272a 100%); padding: 32px 24px; text-align: center; border-radius: 8px 8px 0 0; }
  .tag { display: inline-block; background-color: #BC002D; color: #ffffff; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px; }
  .headline { margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em; }
  .email-body { padding: 28px 24px; background-color: #ffffff; color: #27272a; line-height: 1.6; font-size: 15px; }
  .callout-box { background-color: #f4f4f5; border-left: 4px solid #BC002D; padding: 16px; border-radius: 4px; margin: 20px 0; }
  .btn-wrapper { text-align: center; margin: 28px 0 10px; }
  .action-btn { display: inline-block; background-color: #BC002D; color: #ffffff !important; padding: 12px 28px; border-radius: 6px; font-weight: 700; text-decoration: none; font-size: 14px; box-shadow: 0 4px 12px rgba(188, 0, 45, 0.3); }
</style>

<div class="email-header">
  <span class="tag">Announcement</span>
  <h1 class="headline">New Challenges Await in the Dojo</h1>
</div>

<div class="email-body">
  <p>Greetings Warriors,</p>
  <p>We are excited to announce a series of fresh challenges and updates now live on the Journey to Mastery platform.</p>
  
  <div class="callout-box">
    <strong>Key Highlights:</strong>
    <ul style="margin: 8px 0 0 0; padding-left: 20px;">
      <li>New Web and System Design problem tracks are now active.</li>
      <li>Team submissions are now live for clan leaders.</li>
      <li>Leaderboard updates occur automatically every hour.</li>
    </ul>
  </div>

  <p>Ensure your team is formed and your solutions are submitted before the upcoming checkpoint.</p>

  <div class="btn-wrapper">
    <a href="https://journey-2-mastery.vercel.app/tasks" class="action-btn">View New Tasks</a>
  </div>
</div>`,
  },
  reminder: {
    label: '⏳ Deadline Reminder',
    subject: '⏳ Reminder: Submission Deadline Approaching',
    html: `<style>
  .header-box { background-color: #7f1d1d; padding: 28px 24px; text-align: center; border-radius: 8px 8px 0 0; color: #ffffff; }
  .title { margin: 0; font-size: 22px; font-weight: bold; }
  .body-box { padding: 28px 24px; background-color: #ffffff; color: #18181b; line-height: 1.6; font-size: 15px; }
  .countdown-card { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 18px; text-align: center; margin: 20px 0; }
  .timer-text { font-size: 24px; font-weight: 800; color: #b91c1c; }
  .button-box { text-align: center; margin-top: 24px; }
  .submit-btn { display: inline-block; background-color: #b91c1c; color: #ffffff !important; padding: 12px 30px; border-radius: 6px; font-weight: bold; text-decoration: none; }
</style>

<div class="header-box">
  <h1 class="title">Submission Deadline Notice</h1>
</div>

<div class="body-box">
  <p>Hello Warriors,</p>
  <p>This is a formal reminder that the deadline for current task submissions is rapidly approaching.</p>

  <div class="countdown-card">
    <p style="margin: 0 0 4px 0; color: #7f1d1d; font-size: 13px; font-weight: 600; text-transform: uppercase;">Time Remaining</p>
    <div class="timer-text">Check Your Dashboard</div>
    <p style="margin: 4px 0 0 0; color: #991b1b; font-size: 13px;">Late submissions will not be reviewed by judges.</p>
  </div>

  <p>Please double-check your repository branch, commit history, and writeups before pressing submit.</p>

  <div class="button-box">
    <a href="https://journey-2-mastery.vercel.app/submissions" class="submit-btn">Go to Submissions</a>
  </div>
</div>`,
  },
  newsletter: {
    label: '📰 Newsletter / Digest',
    subject: '⚔️ Journey to Mastery Weekly Digest',
    html: `<style>
  .digest-header { background-color: #18181b; padding: 36px 20px; text-align: center; color: white; border-bottom: 3px solid #BC002D; }
  .digest-title { font-size: 26px; font-weight: 900; margin: 0 0 6px 0; letter-spacing: -0.02em; }
  .digest-subtitle { font-size: 13px; color: #a1a1aa; margin: 0; text-transform: uppercase; letter-spacing: 0.1em; }
  .digest-body { padding: 30px 24px; background-color: #ffffff; color: #27272a; font-size: 15px; line-height: 1.6; }
  .section-card { border: 1px solid #e4e4e7; border-radius: 8px; padding: 18px; margin-bottom: 20px; }
  .section-heading { margin: 0 0 8px 0; font-size: 16px; font-weight: 700; color: #18181b; }
  .btn-center { text-align: center; margin-top: 24px; }
  .btn-primary { display: inline-block; background-color: #18181b; color: #ffffff !important; padding: 12px 26px; border-radius: 6px; font-weight: 600; text-decoration: none; }
</style>

<div class="digest-header">
  <h1 class="digest-title">Journey to Mastery</h1>
  <p class="digest-subtitle">Weekly Warrior Dispatch</p>
</div>

<div class="digest-body">
  <p>Greetings Participants,</p>
  <p>Here is your weekly recap of activity, leaderboard standings, and upcoming milestones.</p>

  <div class="section-card">
    <h3 class="section-heading">🏆 Clan Leaderboard Standings</h3>
    <p style="margin: 0;">Top clans are battling neck and neck. View the leaderboard to see where your team stands.</p>
  </div>

  <div class="section-card">
    <h3 class="section-heading">💡 Mentorship & Guidance</h3>
    <p style="margin: 0;">Judges have begun reviewing completed tasks. Feedback will appear directly on your submission cards.</p>
  </div>

  <div class="btn-center">
    <a href="https://journey-2-mastery.vercel.app/leaderboard" class="btn-primary">Explore Leaderboard</a>
  </div>
</div>`,
  },
};

export default function AdminEmailsPage() {
  const { data: user } = useSession();
  const { data: stats, isLoading, isError, error, refetch } = useEmailStats();
  const sendBroadcast = useSendBroadcastEmail();
  const sendTest = useSendTestEmail();

  const [subject, setSubject] = useState(TEMPLATES.announcement.subject);
  const [htmlContent, setHtmlContent] = useState(TEMPLATES.announcement.html);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [testEmailOpen, setTestEmailOpen] = useState(false);
  const [testRecipient, setTestRecipient] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Generate full HTML preview string for iframe
  const previewDoc = useMemo(() => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 20px 10px; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e4e4e7; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    .footer-block { background-color: #fafafa; border-top: 1px solid #e4e4e7; padding: 18px; text-align: center; font-size: 12px; color: #71717a; }
  </style>
</head>
<body>
  <div class="email-container">
    <div style="padding: 24px;">
      ${htmlContent}
    </div>
    <div class="footer-block">
      <p style="margin: 0 0 4px 0; font-weight: 600; color: #52525b;">Journey to Mastery</p>
      <p style="margin: 0;">You received this email as an active participant in Journey to Mastery.</p>
    </div>
  </div>
</body>
</html>`;
  }, [htmlContent]);

  const handleSelectTemplate = (key: string) => {
    const t = TEMPLATES[key];
    if (t) {
      setSubject(t.subject);
      setHtmlContent(t.html);
      toast.info(`Loaded "${t.label}" template`);
    }
  };

  const handleSendTest = async () => {
    const recipient = testRecipient.trim() || user?.email;
    if (!recipient) {
      toast.error('Please enter an email address to send the test email to.');
      return;
    }
    if (!subject.trim()) {
      toast.error('Please provide a subject line.');
      return;
    }

    try {
      await sendTest.mutateAsync({
        to: recipient,
        subject,
        htmlContent,
      });
      toast.success(`Test email dispatched to ${recipient}!`);
      setTestEmailOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to send test email');
    }
  };

  const handleSendBroadcast = async () => {
    if (!subject.trim()) {
      toast.error('Please enter a subject line.');
      return;
    }
    if (!htmlContent.trim()) {
      toast.error('Email content cannot be empty.');
      return;
    }

    try {
      const res = await sendBroadcast.mutateAsync({
        subject,
        htmlContent,
      });

      toast.success(
        `Broadcast sent! ${res.sentCount} delivered${res.failedCount > 0 ? `, ${res.failedCount} failed` : ''}.`
      );
      setConfirmOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err.message || 'Failed to dispatch email broadcast');
    }
  };

  if (isLoading) return <LoadingSkeleton variant="table" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const participantCount = stats?.recipientCount ?? 0;
  const isConfigured = stats?.isConfigured ?? false;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-3xl font-bold text-primary-text">Email Broadcast</h1>
            <Badge variant="outline" className="gap-1 border-japan-red/30 text-japan-red bg-japan-red/5">
              <Users className="h-3 w-3" />
              {participantCount} {participantCount === 1 ? 'Participant' : 'Participants'}
            </Badge>
          </div>
          <p className="text-secondary-text mt-1">
            Write custom HTML and CSS styled announcements and broadcast them to all users with role <span className="font-mono text-xs font-semibold text-primary-text bg-black/5 px-1 py-0.5 rounded">user</span>.
          </p>
        </div>

        {/* Template Selector dropdown */}
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-text whitespace-nowrap">Load Preset:</Label>
          <div className="flex items-center gap-1.5 flex-wrap">
            {Object.entries(TEMPLATES).map(([key, t]) => (
              <Button
                key={key}
                variant="outline"
                size="sm"
                onClick={() => handleSelectTemplate(key)}
                className="text-xs h-8"
              >
                {t.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* SMTP Notice Banner if not configured */}
      {!isConfigured && (
        <Card className="border-amber-500/30 bg-amber-500/10">
          <CardContent className="pt-4 flex items-start gap-3 text-sm text-amber-900 dark:text-amber-200">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">SMTP Credentials Not Set in .env</p>
              <p className="text-xs mt-0.5 opacity-90">
                You can still test and send emails in simulation mode. To dispatch live emails to real inboxes, update <code className="font-mono bg-amber-500/20 px-1 rounded">SMTP_USER</code> and <code className="font-mono bg-amber-500/20 px-1 rounded">SMTP_PASS</code> in your <code className="font-mono bg-amber-500/20 px-1 rounded">.env</code> file.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Composer Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Code Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center justify-between">
                <span>Email Details</span>
                <span className="text-xs text-muted-text font-normal font-mono">
                  {htmlContent.length} chars
                </span>
              </CardTitle>
              <CardDescription>
                Provide the subject line and styled HTML markup for the broadcast.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="subject" className="text-xs font-semibold">Subject Line</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. 📢 Important Notice: Upcoming Checkpoint"
                  className="font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="htmlContent" className="text-xs font-semibold flex items-center gap-1.5">
                    <Code2 className="h-3.5 w-3.5 text-japan-red" />
                    HTML Markup & Embedded CSS Styling
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[11px] text-muted-text hover:text-primary-text"
                    onClick={() => {
                      setSubject('');
                      setHtmlContent('');
                    }}
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                </div>
                <Textarea
                  id="htmlContent"
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  placeholder="Write your HTML here with <style> tags or inline styles..."
                  rows={16}
                  className="font-mono text-xs leading-relaxed bg-black/[0.02] dark:bg-white/[0.02]"
                />
                <p className="text-[11px] text-muted-text">
                  Tip: You can include <code className="bg-black/5 px-1 py-0.5 rounded">&lt;style&gt;</code> tags, custom colors, fonts, tables, and CTA buttons.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-borders">
                {/* Send Test Email Dialog */}
                <Dialog open={testEmailOpen} onOpenChange={setTestEmailOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      Send Test Email
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Send Test Preview</DialogTitle>
                      <DialogDescription>
                        Send a preview of this email to your personal inbox before broadcasting to all participants.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-2">
                      <div className="space-y-1">
                        <Label htmlFor="testEmail">Recipient Email Address</Label>
                        <Input
                          id="testEmail"
                          type="email"
                          placeholder={user?.email || 'admin@example.com'}
                          value={testRecipient}
                          onChange={(e) => setTestRecipient(e.target.value)}
                        />
                      </div>
                      <p className="text-xs text-muted-text">
                        Subject: <span className="font-semibold text-primary-text">[TEST PREVIEW] {subject}</span>
                      </p>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setTestEmailOpen(false)}>Cancel</Button>
                      <Button onClick={handleSendTest} disabled={sendTest.isPending}>
                        {sendTest.isPending ? 'Sending...' : 'Send Test'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Send Broadcast Alert Dialog */}
                <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      className="bg-japan-red hover:bg-japan-red/90 text-white gap-1.5 font-semibold"
                      disabled={sendBroadcast.isPending || !subject.trim() || !htmlContent.trim()}
                    >
                      <Send className="h-3.5 w-3.5" />
                      {sendBroadcast.isPending ? 'Broadcasting...' : `Send to ${participantCount} Participants`}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-japan-red" />
                        Confirm Email Broadcast
                      </AlertDialogTitle>
                      <AlertDialogDescription className="space-y-2 pt-2">
                        <p>
                          Are you sure you want to send this broadcast? This action will deliver the styled email to all <strong className="text-primary-text">{participantCount} active participants</strong> with the <code className="font-mono bg-black/5 px-1 rounded">user</code> role.
                        </p>
                        <div className="p-3 bg-muted rounded-md text-xs space-y-1 mt-2">
                          <p><strong>Subject:</strong> {subject}</p>
                          <p><strong>Recipients:</strong> {participantCount} participants</p>
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleSendBroadcast}
                        className="bg-japan-red hover:bg-japan-red/90 text-white"
                      >
                        Yes, Send Broadcast
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Visual Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Eye className="h-4 w-4 text-japan-red" />
                  Live Preview
                </CardTitle>
                <CardDescription>
                  Exact rendering of custom HTML & CSS styles.
                </CardDescription>
              </div>

              {/* Viewport Toggles */}
              <div className="flex items-center gap-1 border border-borders rounded-lg p-0.5 bg-black/[0.02]">
                <Button
                  variant={previewMode === 'desktop' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setPreviewMode('desktop')}
                  title="Desktop View"
                >
                  <Monitor className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant={previewMode === 'mobile' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setPreviewMode('mobile')}
                  title="Mobile View"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col pt-0">
              <div className="p-2 border border-borders rounded-t-md bg-muted/40 text-[11px] text-muted-text flex items-center justify-between">
                <span className="truncate"><strong>Subject:</strong> {subject || '(No subject)'}</span>
                <span className="uppercase text-[10px] tracking-wider px-1.5 py-0.5 rounded bg-black/5 font-mono">{previewMode}</span>
              </div>
              <div className="flex-1 min-h-[460px] border border-t-0 border-borders rounded-b-md bg-zinc-100 dark:bg-zinc-900 flex justify-center p-2 overflow-auto">
                <iframe
                  title="Email Live Preview"
                  srcDoc={previewDoc}
                  className={`w-full h-full min-h-[440px] border-0 transition-all rounded shadow-sm bg-white ${
                    previewMode === 'mobile' ? 'max-w-[375px]' : 'max-w-full'
                  }`}
                  sandbox="allow-same-origin"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Broadcast History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-text" />
            Recent Broadcast History
          </CardTitle>
          <CardDescription>
            Audit trail of broadcast announcements sent to participants.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!stats?.recentBroadcasts || stats.recentBroadcasts.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-text">
              No email broadcasts sent yet.
            </div>
          ) : (
            <div className="border border-borders rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Delivered</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentBroadcasts.map((log) => {
                    const details = (log.metadata || log.details || {}) as any;
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs text-muted-text whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-medium text-primary-text max-w-xs truncate">
                          {details.subject || 'Untitled Broadcast'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {details.recipientCount ?? 0}
                        </TableCell>
                        <TableCell className="text-sm">
                          <span className="text-emerald-600 font-semibold">{details.sentCount ?? 0}</span>
                          {details.failedCount && details.failedCount > 0 ? (
                            <span className="text-red-500 ml-1">({details.failedCount} failed)</span>
                          ) : null}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="text-emerald-600 border-emerald-600/30 bg-emerald-500/5">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Sent
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
