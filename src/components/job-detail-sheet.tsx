"use client";

import * as React from "react";
import {
  MapPin,
  DollarSign,
  ExternalLink,
  Calendar,
  Send,
  Trash2,
  Sparkles,
  Clock,
  Download,
  Inbox,
  Trophy,
  Archive,
  FileText,
  CalendarPlus,
  CheckCircle2,
} from "lucide-react";
import { Sheet, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useJobStore, JobStage } from "@/lib/job-store";
import { useToast } from "@/components/ui/toast";
import { JobSourceBadge } from "@/components/job-source-badge";
import { generateGoogleCalendarUrl, downloadICalFile } from "@/lib/calendar";
import {
  getJobActivityTimeline,
  formatTimelineTimestamp,
  formatInterviewCountdown,
} from "@/lib/timeline";
import { cn } from "@/lib/utils";

const STAGES: { id: JobStage; label: string }[] = [
  { id: "wishlist", label: "Wishlist" },
  { id: "applied", label: "Applied" },
  { id: "interviewing", label: "Interviewing" },
  { id: "offer", label: "Offer" },
  { id: "archived", label: "Archived" },
];

export function JobDetailSheet() {
  const {
    selectedJob,
    setSelectedJobId,
    moveStage,
    updateJob,
    addNote,
    deleteJob,
    restoreLastDeletedJob,
  } = useJobStore();
  const { toast } = useToast();
  const [noteInput, setNoteInput] = React.useState("");
  const [confirmingJobId, setConfirmingJobId] = React.useState<string | null>(null);
  const [isEditingSchedule, setIsEditingSchedule] = React.useState(false);
  const [scheduleDateTime, setScheduleDateTime] = React.useState("");

  const isConfirmingDelete = Boolean(selectedJob && confirmingJobId === selectedJob.id);

  // Sync scheduled datetime state when selected job changes
  React.useEffect(() => {
    if (selectedJob?.interviewDate) {
      try {
        const d = new Date(selectedJob.interviewDate);
        if (!isNaN(d.getTime())) {
          // Format as YYYY-MM-DDTHH:mm for datetime-local input
          const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
          setScheduleDateTime(localIso);
        } else {
          setScheduleDateTime("");
        }
      } catch {
        setScheduleDateTime("");
      }
    } else {
      setScheduleDateTime("");
    }
    setIsEditingSchedule(false);
  }, [selectedJob?.id, selectedJob?.interviewDate]);

  if (!selectedJob) return null;

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    addNote(selectedJob.id, noteInput.trim());
    setNoteInput("");
    toast({
      title: "Note added",
      description: "Recorded in opportunity timeline",
      type: "success",
      duration: 3000,
    });
  };

  const handleMoveStage = (stageId: JobStage) => {
    if (selectedJob.stage === stageId) return;
    moveStage(selectedJob.id, stageId);
    if (stageId === "offer") {
      window.dispatchEvent(new CustomEvent("jobclippy:offer-celebration"));
      toast({
        title: "🎉 Huge Milestone: Offer Received!",
        description: `Congratulations on ${selectedJob.title} at ${selectedJob.company}!`,
        type: "success",
        duration: 5000,
      });
    } else {
      toast({
        title: "Stage updated",
        description: `Moved "${selectedJob.title}" to ${STAGES.find((s) => s.id === stageId)?.label}`,
        type: "default",
        duration: 3000,
      });
    }
  };

  const handleSaveInterviewSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleDateTime) return;
    const isoDate = new Date(scheduleDateTime).toISOString();
    updateJob(selectedJob.id, { interviewDate: isoDate });
    setIsEditingSchedule(false);
    toast({
      title: "Interview Scheduled",
      description: `Added to timeline for ${selectedJob.company}`,
      type: "success",
      duration: 3500,
    });
  };

  const handleClearInterviewSchedule = () => {
    updateJob(selectedJob.id, { interviewDate: undefined });
    setScheduleDateTime("");
    setIsEditingSchedule(false);
    toast({
      title: "Interview Schedule Cleared",
      type: "default",
      duration: 2500,
    });
  };

  const handleDownloadICal = () => {
    if (!selectedJob.interviewDate) return;
    downloadICalFile({
      title: selectedJob.title,
      company: selectedJob.company,
      startDate: selectedJob.interviewDate,
      durationMinutes: 45,
      location: selectedJob.location,
      url: selectedJob.url,
      description: selectedJob.description,
    });
    toast({
      title: "Calendar File (.ics) Downloaded",
      description: "Ready to import into Google Calendar, Outlook, or Apple Calendar",
      type: "success",
      duration: 3500,
    });
  };

  const handleConfirmDelete = () => {
    const jobToDelete = selectedJob;
    deleteJob(jobToDelete.id);
    setConfirmingJobId(null);
    toast({
      title: "Opportunity removed",
      description: `Removed from pipeline`,
      type: "undo",
      duration: 6000,
      action: {
        label: "Undo",
        onClick: () => {
          restoreLastDeletedJob();
          toast({
            title: "Opportunity restored",
            type: "success",
            duration: 3000,
          });
        },
      },
    });
  };

  const googleCalUrl = selectedJob.interviewDate
    ? generateGoogleCalendarUrl({
        title: selectedJob.title,
        company: selectedJob.company,
        startDate: selectedJob.interviewDate,
        durationMinutes: 45,
        location: selectedJob.location,
        url: selectedJob.url,
        description: selectedJob.description,
      })
    : "";

  const countdown = selectedJob.interviewDate
    ? formatInterviewCountdown(selectedJob.interviewDate)
    : null;

  const timelineEvents = getJobActivityTimeline(selectedJob);

  return (
    <Sheet open={Boolean(selectedJob)} onOpenChange={(open) => !open && setSelectedJobId(null)}>
      <div data-testid="job-detail-sheet" className="space-y-6">
        {/* Header with Title and Company */}
        <SheetHeader className="relative pr-8 border-b border-hairline pb-4">
          <SheetClose onClick={() => setSelectedJobId(null)} />
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">
              {selectedJob.company}
            </span>
            {selectedJob.url && <JobSourceBadge url={selectedJob.url} />}
          </div>
          <SheetTitle id="job-detail-title" className="text-xl font-medium tracking-tight text-ink">
            {selectedJob.title}
          </SheetTitle>
          <SheetDescription className="flex flex-wrap items-center gap-3 pt-1 text-xs text-ink-muted">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-ink-subtle" />
              {selectedJob.location}
            </span>
            <span className="flex items-center gap-1 font-medium text-semantic-success">
              <DollarSign className="h-3.5 w-3.5" />
              {selectedJob.salary}
            </span>
          </SheetDescription>
        </SheetHeader>

        {/* Stage Selector Pills */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-ink-subtle uppercase tracking-wider">
            Pipeline Stage
          </label>
          <div className="flex flex-wrap gap-1.5">
            {STAGES.map((s) => (
              <Button
                key={s.id}
                variant={selectedJob.stage === s.id ? "default" : "secondary"}
                size="sm"
                onClick={() => handleMoveStage(s.id)}
                className="text-xs h-7 px-2.5 rounded-md font-medium cursor-pointer"
              >
                {s.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Live Interview Workspace & Calendar Sync */}
        <div
          data-testid="interview-workspace-container"
          className="rounded-lg border border-hairline bg-surface-1 p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-ink uppercase tracking-wider">
                Interview Loop & Calendar Sync
              </span>
            </div>
            {countdown && (
              <span
                data-testid="interview-countdown-pill"
                className={cn("px-2 py-0.5 rounded-full text-[11px] font-medium border", countdown.badgeStyle)}
              >
                {countdown.text}
              </span>
            )}
          </div>

          {selectedJob.interviewDate && !isEditingSchedule ? (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs p-2.5 rounded-md bg-surface-2 border border-hairline">
                <div className="space-y-0.5">
                  <div className="font-medium text-ink">
                    {new Date(selectedJob.interviewDate).toLocaleString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="text-[11px] text-ink-subtle">
                    45 min • {selectedJob.location || "Video Call"}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingSchedule(true)}
                  className="h-6 px-2 text-[11px] text-ink-muted hover:text-ink cursor-pointer"
                >
                  Reschedule
                </Button>
              </div>

              {/* 1-Click Calendar Sync Action Strip */}
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={googleCalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="add-google-calendar-btn"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-hairline bg-surface-2 hover:bg-surface-3 text-ink text-xs font-medium transition-colors cursor-pointer"
                >
                  <CalendarPlus className="h-3.5 w-3.5 text-primary" />
                  <span>Add to Google Calendar</span>
                  <ExternalLink className="h-3 w-3 text-ink-subtle ml-0.5" />
                </a>

                <button
                  type="button"
                  data-testid="download-ics-calendar-btn"
                  onClick={handleDownloadICal}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-hairline bg-surface-2 hover:bg-surface-3 text-ink text-xs font-medium transition-colors cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5 text-ink-muted" />
                  <span>Download .ics Calendar File</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveInterviewSchedule} className="space-y-2 pt-1">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="datetime-local"
                  data-testid="interview-datetime-input"
                  value={scheduleDateTime}
                  onChange={(e) => setScheduleDateTime(e.target.value)}
                  className="flex-1 h-8 px-2.5 text-xs rounded-md bg-surface-2 border border-hairline text-ink focus:outline-none focus:border-primary/50"
                  required
                />
                <div className="flex items-center gap-1.5">
                  <Button
                    type="submit"
                    size="sm"
                    data-testid="save-interview-schedule-btn"
                    className="h-8 px-3 text-xs font-medium cursor-pointer"
                  >
                    Save Schedule
                  </Button>
                  {selectedJob.interviewDate && (
                    <>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsEditingSchedule(false)}
                        className="h-8 px-2 text-xs cursor-pointer"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleClearInterviewSchedule}
                        className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
                      >
                        Clear
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-ink-subtle">
                Set screen or round date to generate calendar export and enable timeline countdowns.
              </p>
            </form>
          )}
        </div>

        {/* Smart Extracted Skills */}
        {selectedJob.skills && selectedJob.skills.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-ink-subtle uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Smart Extracted Skills</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selectedJob.skills.map((skill) => (
                <Badge key={skill} variant="skill" className="text-xs py-1 px-2.5">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Original Job Description */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-ink-subtle uppercase tracking-wider">
              Job Description
            </label>
            {selectedJob.url && (
              <div className="flex items-center gap-2">
                <JobSourceBadge url={selectedJob.url} />
                <a
                  href={selectedJob.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover hover:underline font-medium"
                >
                  <span>Open posting</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
          <div className="rounded-lg border border-hairline bg-surface-2 p-4 text-xs leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap text-ink font-normal custom-scrollbar">
            {selectedJob.description || "No description captured."}
          </div>
        </div>

        {/* Opportunity Activity Timeline & Audit Trail */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-ink-subtle uppercase tracking-wider">
              Personal Notes & Timeline
            </label>
            <span className="text-[11px] text-ink-subtle font-mono">
              {timelineEvents.length} Events Logged
            </span>
          </div>

          {/* Quick Note Input Form */}
          <form onSubmit={handleAddNote} className="space-y-2">
            <Textarea
              placeholder="Recruiter phone screen went well, notes, or follow-ups..."
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              className="text-xs resize-none"
              rows={2}
            />
            <div className="flex justify-end">
              <Button type="submit" size="sm" className="gap-1.5 text-xs font-medium cursor-pointer">
                <Send className="h-3 w-3" />
                Add Note
              </Button>
            </div>
          </form>

          {/* Chronological Vertical Timeline Axis */}
          <div
            data-testid="job-activity-timeline"
            className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-hairline max-h-64 overflow-y-auto pt-2 custom-scrollbar"
          >
            {timelineEvents.map((evt) => {
              const Icon = (() => {
                switch (evt.iconType) {
                  case "inbox":
                    return Inbox;
                  case "send":
                    return Send;
                  case "calendar":
                    return Calendar;
                  case "trophy":
                    return Trophy;
                  case "archive":
                    return Archive;
                  default:
                    return FileText;
                }
              })();

              return (
                <div
                  key={evt.id}
                  data-testid={`timeline-event-${evt.type}`}
                  className="relative group flex flex-col space-y-1"
                >
                  {/* Timeline Node Dot */}
                  <div
                    className={cn(
                      "absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full border shadow-2xs",
                      evt.colorClass
                    )}
                  >
                    <Icon className="h-2.5 w-2.5" />
                  </div>

                  {/* Event Details */}
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-medium text-ink">{evt.title}</span>
                    <span
                      title={new Date(evt.timestamp).toLocaleString()}
                      className="text-[10px] text-ink-subtle font-mono shrink-0"
                    >
                      {formatTimelineTimestamp(evt.timestamp)}
                    </span>
                  </div>

                  {evt.description && (
                    <p className="text-xs text-ink-muted leading-relaxed whitespace-pre-wrap rounded-md bg-surface-2/60 border border-hairline/60 p-2.5">
                      {evt.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Footer */}
        <div className="pt-4 border-t border-hairline flex items-center justify-between gap-3">
          {isConfirmingDelete ? (
            <div className="flex items-center gap-2 animate-in fade-in duration-150">
              <span className="text-xs text-destructive font-medium">Delete permanently?</span>
              <Button
                variant="destructive"
                size="sm"
                data-testid="confirm-delete-opportunity-btn"
                onClick={handleConfirmDelete}
                className="text-xs font-medium h-7 px-2.5 cursor-pointer"
              >
                Yes, Delete
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setConfirmingJobId(null)}
                className="text-xs font-medium h-7 px-2.5 cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmingJobId(selectedJob.id)}
              className="gap-1 text-xs font-medium cursor-pointer"
            >
              <Trash2 className="h-3 w-3" />
              <span>Delete Opportunity</span>
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSelectedJobId(null)}
            className="text-xs font-medium cursor-pointer"
          >
            Done
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
