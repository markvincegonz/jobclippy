import { Job, JobStage } from "./job-store";
import { getJobSource } from "./job-source";

export type ActivityEventType =
  | "created"
  | "applied"
  | "interview"
  | "note"
  | "offer"
  | "archived";

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  title: string;
  description?: string;
  timestamp: string; // ISO date string
  iconType: "inbox" | "send" | "calendar" | "note" | "trophy" | "archive";
  colorClass: string;
}

/**
 * Derives a chronological, sorted list of audit timeline events for an opportunity.
 */
export function getJobActivityTimeline(job: Job): ActivityEvent[] {
  const events: ActivityEvent[] = [];
  const source = getJobSource(job.url);
  const sourceLabel = source ? `via ${source.brand}` : "manually";

  // 1. Creation / Clipper Event
  events.push({
    id: `event-created-${job.id}`,
    type: "created",
    title: "Opportunity Saved",
    description: `Tracked ${sourceLabel}`,
    timestamp: job.createdAt,
    iconType: "inbox",
    colorClass: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  });

  // 2. Application Submitted Event
  if (job.appliedAt) {
    events.push({
      id: `event-applied-${job.id}`,
      type: "applied",
      title: "Application Submitted",
      description: `Formal application sent to ${job.company}`,
      timestamp: job.appliedAt,
      iconType: "send",
      colorClass: "text-sky-400 bg-sky-400/10 border-sky-400/20",
    });
  }

  // 3. Interview Scheduled Event
  if (job.interviewDate) {
    events.push({
      id: `event-interview-${job.id}`,
      type: "interview",
      title: "Interview Scheduled",
      description: `Screen or interview loop scheduled`,
      timestamp: job.interviewDate,
      iconType: "calendar",
      colorClass: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    });
  }

  // 4. Notes Added
  if (Array.isArray(job.notes)) {
    job.notes.forEach((note) => {
      events.push({
        id: `event-note-${note.id}`,
        type: "note",
        title: "Personal Note Recorded",
        description: note.text,
        timestamp: note.createdAt,
        iconType: "note",
        colorClass: "text-ink-muted bg-surface-2 border-hairline",
      });
    });
  }

  // 5. Offer Milestone Event (if current stage is offer)
  if (job.stage === "offer") {
    events.push({
      id: `event-offer-${job.id}`,
      type: "offer",
      title: "🎉 Offer Received!",
      description: `Formal proposal & compensation negotiations open`,
      timestamp: job.notes?.[0]?.createdAt || job.createdAt,
      iconType: "trophy",
      colorClass: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    });
  }

  // 6. Archived Milestone Event
  if (job.stage === "archived") {
    events.push({
      id: `event-archived-${job.id}`,
      type: "archived",
      title: "Opportunity Closed",
      description: `Position closed or archived`,
      timestamp: job.notes?.[0]?.createdAt || job.createdAt,
      iconType: "archive",
      colorClass: "text-ink-subtle bg-surface-2 border-hairline",
    });
  }

  // Sort chronologically descending (newest first)
  return events.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

/**
 * Format relative time or standard date for timeline
 */
export function formatTimelineTimestamp(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

/**
 * Format interview countdown badge text & urgency indicator
 */
export function formatInterviewCountdown(interviewIsoString: string): {
  text: string;
  isUpcoming: boolean;
  isToday: boolean;
  badgeStyle: string;
} {
  try {
    const target = new Date(interviewIsoString);
    if (isNaN(target.getTime())) {
      return { text: "Interview Scheduled", isUpcoming: false, isToday: false, badgeStyle: "" };
    }

    const now = new Date();
    const diffMs = target.getTime() - now.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    const isToday =
      target.getFullYear() === now.getFullYear() &&
      target.getMonth() === now.getMonth() &&
      target.getDate() === now.getDate();

    const timeFormatted = target.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

    if (diffMs < 0) {
      return {
        text: `Interviewed ${target.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
        isUpcoming: false,
        isToday: false,
        badgeStyle: "bg-surface-2 text-ink-subtle border-hairline",
      };
    }

    if (isToday) {
      return {
        text: `Today at ${timeFormatted}`,
        isUpcoming: true,
        isToday: true,
        badgeStyle: "bg-purple-500/15 text-purple-300 border-purple-500/30 animate-pulse",
      };
    }

    if (diffDays === 1 || diffHours <= 36) {
      return {
        text: `Tomorrow at ${timeFormatted}`,
        isUpcoming: true,
        isToday: false,
        badgeStyle: "bg-purple-500/10 text-purple-300 border-purple-500/25",
      };
    }

    if (diffDays <= 7) {
      return {
        text: `In ${diffDays} days (${target.toLocaleDateString("en-US", { weekday: "short" })})`,
        isUpcoming: true,
        isToday: false,
        badgeStyle: "bg-surface-2 text-ink-muted border-hairline",
      };
    }

    return {
      text: target.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      isUpcoming: true,
      isToday: false,
      badgeStyle: "bg-surface-2 text-ink-muted border-hairline",
    };
  } catch {
    return { text: "Interview", isUpcoming: false, isToday: false, badgeStyle: "" };
  }
}
