import nodemailer, { type Transporter } from "nodemailer";
import { eq, and, isNotNull, desc } from "drizzle-orm";
import { db } from "../db/client";
import { users, auditLog } from "../db/schema";
import { env } from "../config/env";
import { logger } from "../logger";

// ──────────────────────────────────────────────
// SMTP Transporter Singleton
// ──────────────────────────────────────────────

let transporter: Transporter | null = null;

function isDummyValue(val?: string): boolean {
  if (!val) return true;
  const trimmed = val.trim().toLowerCase();
  return (
    trimmed === "" ||
    trimmed.includes("your-email@") ||
    trimmed.includes("your-app-password") ||
    trimmed.includes("xxxx-xxxx")
  );
}

function getTransporter(): Transporter | null {
  if (isDummyValue(env.SMTP_USER) || isDummyValue(env.SMTP_PASS)) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  return transporter;
}

export function isEmailConfigured(): boolean {
  return !isDummyValue(env.SMTP_USER) && !isDummyValue(env.SMTP_PASS);
}

function getFromAddress(): string {
  if (env.EMAIL_FROM && !isDummyValue(env.EMAIL_FROM)) {
    return env.EMAIL_FROM;
  }
  if (env.SMTP_USER && !isDummyValue(env.SMTP_USER)) {
    return `Journey to Mastery <${env.SMTP_USER}>`;
  }
  return "Journey to Mastery <noreply@journey2mastery.com>";
}

// ──────────────────────────────────────────────
// Core Email Dispatch
// ──────────────────────────────────────────────

export interface EmailAttachment {
  filename?: string | false;
  content?: string | Buffer;
  path?: string;
  contentType?: string;
  cid?: string;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: EmailAttachment[];
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  attachments,
}: SendEmailOptions): Promise<{ success: boolean; simulated?: boolean; messageId?: string }> {
  const mailer = getTransporter();

  if (!mailer) {
    logger.info(
      { to, subject },
      "[EmailService] SMTP credentials not set or contain dummy text. Email delivery skipped (simulated)."
    );
    return { success: true, simulated: true };
  }

  try {
    const info = await mailer.sendMail({
      from: getFromAddress(),
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
      attachments,
    });

    logger.info({ messageId: info.messageId, to, subject }, "[EmailService] Email sent successfully");
    return { success: true, messageId: info.messageId };
  } catch (error) {
    // If sending with attachments failed (e.g. remote asset download error), fallback to sending without attachments
    if (attachments && attachments.length > 0) {
      try {
        const info = await mailer.sendMail({
          from: getFromAddress(),
          to,
          subject,
          html,
          text: text || html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
        });
        logger.info(
          { messageId: info.messageId, to, subject },
          "[EmailService] Email sent successfully on fallback (without attachments)"
        );
        return { success: true, messageId: info.messageId };
      } catch (fallbackError) {
        logger.error({ error: fallbackError, to, subject }, "[EmailService] Failed to send fallback email");
        throw fallbackError;
      }
    }
    logger.error({ error, to, subject }, "[EmailService] Failed to send email");
    throw error;
  }
}


// ──────────────────────────────────────────────
// Participant Retrieval
// ──────────────────────────────────────────────

export async function getParticipantUsers(): Promise<Array<{ id: string; email: string; fullName: string | null; username: string }>> {
  const participants = await db
    .select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      username: users.username,
    })
    .from(users)
    .where(
      and(
        eq(users.role, "user"),
        eq(users.isActive, true),
        isNotNull(users.email)
      )
    );

  return participants.filter(
    (p): p is { id: string; email: string; fullName: string | null; username: string } =>
      Boolean(p.email && p.email.includes("@"))
  );
}

// ──────────────────────────────────────────────
// Welcome Email Template
// ──────────────────────────────────────────────

export async function sendWelcomeEmail(user: {
  email: string;
  fullName?: string | null;
  username: string;
}) {
  const siteUrl = env.FRONTEND_URL.replace(/\/$/, "");
  const displayName = user.fullName || user.username || "Warrior";

  const subject = "⚔️ Welcome to Journey to Mastery — Your Quest Begins!";
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Journey to Mastery</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0c0a09; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .header { background: linear-gradient(135deg, #1c1917 0%, #292524 100%); padding: 36px 30px; text-align: center; border-bottom: 2px solid #BC002D; }
    .badge { display: inline-block; background-color: #BC002D; color: #ffffff; padding: 4px 14px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; }
    .title { margin: 0; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em; }
    .content { padding: 32px 30px; line-height: 1.6; }
    .greeting { font-size: 18px; font-weight: 600; color: #ffffff; margin-bottom: 16px; }
    .lead { font-size: 15px; color: #a1a1aa; margin-bottom: 24px; }
    .steps { background-color: #09090b; border: 1px solid #27272a; border-radius: 8px; padding: 20px; margin-bottom: 28px; }
    .step-item { display: flex; align-items: flex-start; margin-bottom: 14px; font-size: 14px; }
    .step-item:last-child { margin-bottom: 0; }
    .step-number { background-color: #BC002D; color: #ffffff; width: 22px; height: 22px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 11px; margin-right: 12px; flex-shrink: 0; }
    .step-text { color: #d4d4d8; }
    .step-text strong { color: #ffffff; }
    .cta-container { text-align: center; margin: 30px 0 10px; }
    .cta-btn { display: inline-block; background-color: #BC002D; color: #ffffff !important; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 15px; text-decoration: none; transition: background-color 0.2s; box-shadow: 0 4px 14px rgba(188, 0, 45, 0.4); }
    .footer { text-align: center; padding: 24px; font-size: 12px; color: #71717a; border-top: 1px solid #27272a; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="badge">Journey to Mastery</div>
        <h1 class="title">Welcome, Warrior</h1>
      </div>
      <div class="content">
        <div class="greeting">Greetings, ${displayName}! 🥋</div>
        <p class="lead">
          You have taken your first step into Journey to Mastery. Prepare yourself to sharpen your skills, tackle engineering challenges, and climb the ranks.
        </p>

        <div class="steps">
          <div class="step-item">
            <span class="step-number">1</span>
            <span class="step-text"><strong>Complete your profile:</strong> Fill out your warrior details so peers and judges can identify you.</span>
          </div>
          <div class="step-item">
            <span class="step-number">2</span>
            <span class="step-text"><strong>Join or forge a clan:</strong> Team up as a duo or conquer challenges solo.</span>
          </div>
          <div class="step-item">
            <span class="step-number">3</span>
            <span class="step-text"><strong>Conquer tasks:</strong> Submit solutions across Frontend, Backend, AI/ML, and DSA to score points.</span>
          </div>
        </div>

        <div class="cta-container">
          <a href="${siteUrl}/dashboard" class="cta-btn">Enter the Dojo</a>
        </div>
      </div>
      <div class="footer">
        <p>Journey to Mastery · Kalyani Government Engineering College</p>
        <p>You received this email because you signed in to Journey to Mastery via GitHub.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({ to: user.email, subject, html });
}

// ──────────────────────────────────────────────
// New Post Notification Template & Batch Dispatch
// ──────────────────────────────────────────────

export async function sendNewPostNotificationEmail(post: {
  id?: string;
  title: string;
  description: string;
  posterImageUrl?: string | null;
}) {
  const participants = await getParticipantUsers();
  if (participants.length === 0) {
    logger.info("[EmailService] No participants to notify for new post");
    return { total: 0, sent: 0, failed: 0 };
  }

  const siteUrl = env.FRONTEND_URL.replace(/\/$/, "");
  const postUrl = post.id ? `${siteUrl}/posts/${post.id}` : `${siteUrl}/posts`;

  const subject = `📢 New Announcement: ${post.title}`;

  // Clean description excerpt for email
  const cleanDescription = post.description.length > 300
    ? post.description.slice(0, 300) + "..."
    : post.description;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${post.title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0c0a09; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .banner { width: 100%; max-height: 240px; object-fit: cover; display: block; border-bottom: 1px solid #27272a; }
    .header { padding: 32px 30px 16px; }
    .badge { display: inline-block; background-color: #BC002D; color: #ffffff; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; }
    .title { margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; line-height: 1.3; }
    .content { padding: 0 30px 32px; line-height: 1.6; }
    .body-text { font-size: 15px; color: #d4d4d8; white-space: pre-line; background-color: #09090b; padding: 18px; border-radius: 8px; border: 1px solid #27272a; margin: 20px 0; }
    .cta-container { text-align: center; margin: 28px 0 10px; }
    .cta-btn { display: inline-block; background-color: #BC002D; color: #ffffff !important; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; text-decoration: none; box-shadow: 0 4px 14px rgba(188, 0, 45, 0.4); }
    .footer { text-align: center; padding: 24px; font-size: 12px; color: #71717a; border-top: 1px solid #27272a; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      ${post.posterImageUrl ? `<img src="${post.posterImageUrl}" alt="${post.title}" class="banner" />` : ""}
      <div class="header">
        <div class="badge">Announcement</div>
        <h1 class="title">${post.title}</h1>
      </div>
      <div class="content">
        <div class="body-text">${cleanDescription}</div>
        <div class="cta-container">
          <a href="${postUrl}" class="cta-btn">Read Full Post on Website</a>
        </div>
      </div>
      <div class="footer">
        <p>Journey to Mastery · Kalyani Government Engineering College</p>
        <p>You received this because you are an active participant in Journey to Mastery.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  return batchDispatchEmails(participants.map((p) => p.email), subject, html);
}

// ──────────────────────────────────────────────
// Custom Styled Email Broadcast (Admin)
// ──────────────────────────────────────────────

export interface BroadcastEmailOptions {
  subject: string;
  htmlContent: string;
  adminId: string;
}

export async function broadcastAdminEmail({
  subject,
  htmlContent,
  adminId,
}: BroadcastEmailOptions) {
  const participants = await getParticipantUsers();
  const recipientEmails = participants.map((p) => p.email);

  // Wrap content in base HTML skeleton if user passed a partial snippet
  const wrappedHtml = wrapWithEmailBoilerplate(htmlContent, subject);

  logger.info(
    { adminId, subject, recipientCount: recipientEmails.length },
    "[EmailService] Starting admin email broadcast"
  );

  const results = await batchDispatchEmails(recipientEmails, subject, wrappedHtml);

  // Log in audit log
  try {
    await db.insert(auditLog).values({
      actorId: adminId,
      action: "EMAIL_BROADCAST",
      targetType: "USERS",
      metadata: {
        subject,
        recipientCount: recipientEmails.length,
        sentCount: results.sent,
        failedCount: results.failed,
      },
    });
  } catch (err) {
    logger.error({ err }, "[EmailService] Failed to record audit log for email broadcast");
  }

  return {
    totalRecipients: recipientEmails.length,
    sentCount: results.sent,
    failedCount: results.failed,
  };
}

// ──────────────────────────────────────────────
// Send Test Email
// ──────────────────────────────────────────────

export async function sendTestEmail({
  to,
  subject,
  htmlContent,
}: {
  to: string;
  subject: string;
  htmlContent: string;
}) {
  const wrappedHtml = wrapWithEmailBoilerplate(htmlContent, `[TEST] ${subject}`);
  return sendEmail({
    to,
    subject: `[TEST PREVIEW] ${subject}`,
    html: wrappedHtml,
  });
}

// ──────────────────────────────────────────────
// Helper: Batch Dispatch with Chunking
// ──────────────────────────────────────────────

async function batchDispatchEmails(
  emails: string[],
  subject: string,
  html: string,
  chunkSize = 15
): Promise<{ total: number; sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < emails.length; i += chunkSize) {
    const chunk = emails.slice(i, i + chunkSize);
    const promises = chunk.map(async (email) => {
      try {
        await sendEmail({ to: email, subject, html });
        return true;
      } catch (err) {
        logger.error({ err, email }, "[EmailService] Failed to send email in batch");
        return false;
      }
    });

    const settled = await Promise.allSettled(promises);
    for (const res of settled) {
      if (res.status === "fulfilled" && res.value === true) {
        sent++;
      } else {
        failed++;
      }
    }

    // Small delay between chunks to avoid flooding SMTP rate limits
    if (i + chunkSize < emails.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return { total: emails.length, sent, failed };
}

// ──────────────────────────────────────────────
// Helper: Boilerplate HTML Wrapper
// ──────────────────────────────────────────────

function wrapWithEmailBoilerplate(content: string, title: string): string {
  // If the admin already provided a complete <!DOCTYPE html> document, don't double wrap
  if (content.toLowerCase().includes("<!doctype html>") || content.toLowerCase().includes("<html")) {
    return content;
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #18181b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f5; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; border: 1px solid #e4e4e7; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <tr>
            <td style="padding: 30px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="background-color: #fafafa; border-top: 1px solid #e4e4e7; padding: 18px; text-align: center; font-size: 12px; color: #71717a;">
              <p style="margin: 0 0 4px 0; font-weight: 600; color: #52525b;">Journey to Mastery</p>
              <p style="margin: 0;">You received this email as an active participant on Journey to Mastery.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// ──────────────────────────────────────────────
// Judge Review / Rank Promotion Emails
// ──────────────────────────────────────────────

export const KENSHI_IMAGE_URL =
  "https://res.cloudinary.com/dkxskaege/image/upload/v1790538583/ChatGPT_Image_Sep_28_2026_01_19_26_AM_yceuhr.png";

export const RONIN_IMAGE_URL =
  "https://res.cloudinary.com/dkxskaege/image/upload/v1789626509/Ronin_n4pov3.png";

export interface ReviewScoreItem {
  criterionName: string;
  score: number;
  maxScore: number;
}

export interface KenshiPromotionEmailOptions {
  user: {
    email: string;
    fullName?: string | null;
    username: string;
  };
  taskTitle: string;
  totalScore: number;
  passingScore?: number;
  feedback?: string | null;
  scores?: ReviewScoreItem[];
  submissionId?: string;
}

export async function sendKenshiPromotionEmail({
  user,
  taskTitle,
  totalScore,
  feedback,
  scores,
  submissionId,
}: KenshiPromotionEmailOptions) {
  const siteUrl = env.FRONTEND_URL.replace(/\/$/, "");
  const displayName = user.fullName || user.username || "Warrior";
  const targetUrl = submissionId
    ? `${siteUrl}/submissions/${submissionId}`
    : `${siteUrl}/dashboard`;

  const subject = "⚔️ Rank Promoted: You are now a Kenshi! — Journey to Mastery";

  const scoresRows =
    scores && scores.length > 0
      ? scores
          .map(
            (s) => `
        <tr style="border-bottom: 1px solid #27272a;">
          <td style="padding: 10px 14px; color: #d4d4d8; font-size: 14px;">${s.criterionName}</td>
          <td style="padding: 10px 14px; color: #ffffff; font-weight: 700; text-align: right; font-size: 14px;">
            ${s.score} <span style="color: #71717a; font-weight: 400; font-size: 12px;">/ ${s.maxScore}</span>
          </td>
        </tr>`
          )
          .join("")
      : "";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rank Promoted to Kenshi</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0c0a09; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 32px 16px; }
    .card { background-color: #18181b; border: 1px solid #27272a; border-radius: 14px; overflow: hidden; box-shadow: 0 16px 36px rgba(0,0,0,0.6); }
    .banner { width: 100%; max-height: 280px; object-fit: cover; display: block; border-bottom: 2px solid #BC002D; }
    .header { padding: 32px 30px 20px; text-align: center; }
    .badge { display: inline-block; background: linear-gradient(135deg, #BC002D 0%, #dc2626 100%); color: #ffffff; padding: 6px 16px; border-radius: 9999px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 14px; box-shadow: 0 2px 10px rgba(188, 0, 45, 0.4); }
    .title { margin: 0; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em; }
    .content { padding: 0 30px 32px; line-height: 1.6; }
    .greeting { font-size: 18px; font-weight: 700; color: #ffffff; margin-bottom: 14px; }
    .lead { font-size: 15px; color: #d4d4d8; margin-bottom: 22px; }
    .kenshi-box { background: linear-gradient(145deg, #1c1917 0%, #292524 100%); border-left: 4px solid #BC002D; border-radius: 8px; padding: 20px; margin: 24px 0; border: 1px solid #3f3f46; border-left-width: 4px; }
    .kenshi-box-title { color: #facc15; font-size: 16px; font-weight: 800; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.05em; }
    .kenshi-box-text { color: #e4e4e7; font-size: 14px; margin: 0; line-height: 1.6; }
    .stats-card { background-color: #09090b; border: 1px solid #27272a; border-radius: 10px; padding: 20px; margin-bottom: 24px; }
    .stats-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #27272a; padding-bottom: 12px; margin-bottom: 14px; }
    .stats-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #a1a1aa; margin: 0; }
    .score-pill { background-color: #15803d; color: #ffffff; padding: 4px 12px; border-radius: 6px; font-weight: 800; font-size: 14px; }
    .scores-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    .feedback-box { background-color: #09090b; border: 1px solid #27272a; border-left: 3px solid #BC002D; border-radius: 6px; padding: 18px; margin: 20px 0; }
    .feedback-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #BC002D; margin: 0 0 6px 0; }
    .feedback-text { font-size: 14px; color: #e4e4e7; font-style: italic; margin: 0; white-space: pre-line; line-height: 1.5; }
    .cta-container { text-align: center; margin: 32px 0 12px; }
    .cta-btn { display: inline-block; background-color: #BC002D; color: #ffffff !important; padding: 14px 34px; border-radius: 8px; font-weight: 800; font-size: 15px; text-decoration: none; box-shadow: 0 6px 18px rgba(188, 0, 45, 0.45); }
    .footer { text-align: center; padding: 24px; font-size: 12px; color: #71717a; border-top: 1px solid #27272a; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <img src="${KENSHI_IMAGE_URL}" alt="Promoted to Kenshi" class="banner" />
      <div class="header">
        <div class="badge">⚔️ Rank Ascension · Approved</div>
        <h1 class="title">You are Promoted to Kenshi!</h1>
      </div>
      <div class="content">
        <div class="greeting">Salute, Warrior ${displayName}! 🥋</div>
        <p class="lead">
          Honorable news! The judges have reviewed your submission for <strong>${taskTitle}</strong> and marked it as <strong style="color: #22c55e;">APPROVED</strong>.
        </p>

        <div class="kenshi-box">
          <div class="kenshi-box-title">⚔️ Your Kenshi Journey Starts Now</div>
          <p class="kenshi-box-text">
            By proving your discipline and skill in the trials of Ronin, you have officially ascended to the rank of <strong>KENSHI (剣士)</strong>!
            Your Kenshi journey officially begins now. As a Kenshi, the trials ahead will demand deeper precision, sharper logic, and higher architecture standards. Prepare yourself for the upcoming <strong>Week 2 challenges</strong>, where you will face tougher opponents and forge higher-level solutions.
          </p>
        </div>

        <div class="stats-card">
          <div class="stats-header">
            <span class="stats-title">Task Evaluation</span>
            <span class="score-pill">${totalScore} Marks Awarded</span>
          </div>
          <div style="font-size: 14px; color: #a1a1aa; margin-bottom: 12px;">
            Task: <strong style="color: #ffffff;">${taskTitle}</strong> &bull; Status: <strong style="color: #22c55e;">Approved</strong>
          </div>
          ${
            scoresRows
              ? `<table class="scores-table"><tbody>${scoresRows}</tbody></table>`
              : ""
          }
        </div>

        ${
          feedback
            ? `<div class="feedback-box">
                <div class="feedback-title">Judge Feedback</div>
                <div class="feedback-text">&ldquo;${feedback}&rdquo;</div>
              </div>`
            : ""
        }

        <div class="cta-container">
          <a href="${targetUrl}" class="cta-btn">Enter the Dojo as a Kenshi &rarr;</a>
        </div>
      </div>
      <div class="footer">
        <p>Journey to Mastery · Kalyani Government Engineering College</p>
        <p>You received this email because your submission was evaluated by a judge on the portal.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  return sendEmail({
    to: user.email,
    subject,
    html,
    attachments: [
      {
        filename: "kenshi-promotion.png",
        path: KENSHI_IMAGE_URL,
      },
    ],
  });
}

export interface RoninRemainingEmailOptions {
  user: {
    email: string;
    fullName?: string | null;
    username: string;
  };
  taskTitle: string;
  totalScore: number;
  passingScore?: number;
  feedback?: string | null;
  scores?: ReviewScoreItem[];
  submissionId?: string;
  taskId?: string;
}

export async function sendRoninRemainingEmail({
  user,
  taskTitle,
  totalScore,
  passingScore = 50,
  feedback,
  scores,
  submissionId,
  taskId,
}: RoninRemainingEmailOptions) {
  const siteUrl = env.FRONTEND_URL.replace(/\/$/, "");
  const displayName = user.fullName || user.username || "Warrior";
  const targetUrl = submissionId
    ? `${siteUrl}/submissions/${submissionId}`
    : taskId
      ? `${siteUrl}/tasks/${taskId}`
      : `${siteUrl}/dashboard`;

  const subject = "🗡️ Ronin Trials Update: Stand Tall, Warrior — Your Path to Week 2";

  const scoresRows =
    scores && scores.length > 0
      ? scores
          .map(
            (s) => `
        <tr style="border-bottom: 1px solid #27272a;">
          <td style="padding: 10px 14px; color: #d4d4d8; font-size: 14px;">${s.criterionName}</td>
          <td style="padding: 10px 14px; color: #ffffff; font-weight: 700; text-align: right; font-size: 14px;">
            ${s.score} <span style="color: #71717a; font-weight: 400; font-size: 12px;">/ ${s.maxScore}</span>
          </td>
        </tr>`
          )
          .join("")
      : "";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ronin Trials Update</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0c0a09; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 32px 16px; }
    .card { background-color: #18181b; border: 1px solid #27272a; border-radius: 14px; overflow: hidden; box-shadow: 0 16px 36px rgba(0,0,0,0.6); }
    .banner { width: 100%; max-height: 280px; object-fit: cover; display: block; border-bottom: 2px solid #BC002D; }
    .header { padding: 32px 30px 20px; text-align: center; }
    .badge { display: inline-block; background-color: #3f3f46; color: #f4f4f5; padding: 6px 16px; border-radius: 9999px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 14px; border: 1px solid #52525b; }
    .title { margin: 0; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em; }
    .content { padding: 0 30px 32px; line-height: 1.6; }
    .greeting { font-size: 18px; font-weight: 700; color: #ffffff; margin-bottom: 14px; }
    .lead { font-size: 15px; color: #d4d4d8; margin-bottom: 22px; }
    .motivation-box { background: linear-gradient(145deg, #18181b 0%, #27272a 100%); border-left: 4px solid #BC002D; border-radius: 8px; padding: 22px; margin: 24px 0; border: 1px solid #3f3f46; border-left-width: 4px; }
    .motivation-title { color: #f87171; font-size: 16px; font-weight: 800; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.05em; }
    .motivation-quote { color: #ffffff; font-style: italic; font-weight: 600; margin: 0 0 12px 0; font-size: 14px; border-bottom: 1px solid #3f3f46; padding-bottom: 10px; }
    .strategy-intro { color: #e4e4e7; font-size: 14px; font-weight: 700; margin: 0 0 10px 0; }
    .steps-list { margin: 0; padding-left: 20px; color: #d4d4d8; font-size: 14px; line-height: 1.7; }
    .steps-list li { margin-bottom: 8px; }
    .steps-list strong { color: #ffffff; }
    .stats-card { background-color: #09090b; border: 1px solid #27272a; border-radius: 10px; padding: 20px; margin-bottom: 24px; }
    .stats-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #27272a; padding-bottom: 12px; margin-bottom: 14px; }
    .stats-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #a1a1aa; margin: 0; }
    .score-pill { background-color: #b91c1c; color: #ffffff; padding: 4px 12px; border-radius: 6px; font-weight: 800; font-size: 14px; }
    .scores-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    .feedback-box { background-color: #09090b; border: 1px solid #27272a; border-left: 3px solid #f87171; border-radius: 6px; padding: 18px; margin: 20px 0; }
    .feedback-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #f87171; margin: 0 0 8px 0; }
    .feedback-text { font-size: 14px; color: #e4e4e7; font-style: italic; margin: 0; white-space: pre-line; line-height: 1.5; }
    .cta-container { text-align: center; margin: 32px 0 12px; }
    .cta-btn { display: inline-block; background-color: #BC002D; color: #ffffff !important; padding: 14px 34px; border-radius: 8px; font-weight: 800; font-size: 15px; text-decoration: none; box-shadow: 0 6px 18px rgba(188, 0, 45, 0.45); }
    .footer { text-align: center; padding: 24px; font-size: 12px; color: #71717a; border-top: 1px solid #27272a; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <img src="${RONIN_IMAGE_URL}" alt="Ronin Warrior" class="banner" />
      <div class="header">
        <div class="badge">🗡️ Ronin Trials · Review Completed</div>
        <h1 class="title">Stand Tall, Warrior</h1>
      </div>
      <div class="content">
        <div class="greeting">Greetings, Warrior ${displayName}! 🥋</div>
        <p class="lead">
          The judges have completed reviewing your submission for <strong>${taskTitle}</strong>.
          Your solution received <strong>${totalScore} marks</strong> (passing threshold: ${passingScore} marks) and was not approved at this stage. You currently <strong>remain in the rank of Ronin</strong>.
        </p>

        <div class="motivation-box">
          <div class="motivation-title">🔥 True Mastery is Forged in Resistance</div>
          <div class="motivation-quote">&ldquo;A true warrior is not defined by stumbling, but by the relentless hunger to rise, sharpen their blade, and strike again.&rdquo;</div>
          <div class="strategy-intro">Your Battle Plan for Week 2:</div>
          <ol class="steps-list">
            <li><strong>First, conquer your Ronin challenge:</strong> Study the judge's feedback below, resolve the issues, and refine your code to meet the standard.</li>
            <li><strong>Earn your approval:</strong> Once your updated Ronin submission is approved, you will immediately ascend to the rank of <strong>Kenshi</strong>.</li>
            <li><strong>Complete Kenshi challenge too in Week 2:</strong> Charge straight ahead to tackle the <strong>Week 2 Kenshi challenge</strong> side-by-side with your Ronin triumph and surge forward on the leaderboard!</li>
          </ol>
        </div>

        <div class="stats-card">
          <div class="stats-header">
            <span class="stats-title">Evaluation Summary</span>
            <span class="score-pill">${totalScore} Marks (Needs Revision)</span>
          </div>
          <div style="font-size: 14px; color: #a1a1aa; margin-bottom: 12px;">
            Task: <strong style="color: #ffffff;">${taskTitle}</strong> &bull; Current Rank: <strong style="color: #fca5a5;">Ronin</strong>
          </div>
          ${
            scoresRows
              ? `<table class="scores-table"><tbody>${scoresRows}</tbody></table>`
              : ""
          }
        </div>

        ${
          feedback
            ? `<div class="feedback-box">
                <div class="feedback-title">Judge Feedback & Suggestions</div>
                <div class="feedback-text">&ldquo;${feedback}&rdquo;</div>
              </div>`
            : ""
        }

        <div class="cta-container">
          <a href="${targetUrl}" class="cta-btn">Review Feedback &amp; Refine Code &rarr;</a>
        </div>
      </div>
      <div class="footer">
        <p>Journey to Mastery · Kalyani Government Engineering College</p>
        <p>You received this email because your submission was evaluated by a judge on the portal.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  return sendEmail({
    to: user.email,
    subject,
    html,
    attachments: [
      {
        filename: "ronin-quest.png",
        path: RONIN_IMAGE_URL,
      },
    ],
  });
}

