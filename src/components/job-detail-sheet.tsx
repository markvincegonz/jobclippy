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
} from "lucide-react";
import { Sheet, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useJobStore, JobStage } from "@/lib/job-store";
import { useToast } from "@/components/ui/toast";

const STAGES: { id: JobStage; label: string }[] = [
  { id: "wishlist", label: "Wishlist" },
  { id: "applied", label: "Applied" },
  { id: "interviewing", label: "Interviewing" },
  { id: "offer", label: "Offer" },
  { id: "archived", label: "Archived" },
];

export function JobDetailSheet() {
  const { selectedJob, setSelectedJobId, moveStage, addNote, deleteJob, restoreLastDeletedJob } =
    useJobStore();
  const { toast } = useToast();
  const [noteInput, setNoteInput] = React.useState("");
  const [confirmingJobId, setConfirmingJobId] = React.useState<string | null>(null);
  const isConfirmingDelete = Boolean(selectedJob && confirmingJobId === selectedJob.id);

  if (!selectedJob) return null;

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    addNote(selectedJob.id, noteInput);
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
    toast({
      title: "Stage updated",
      description: `Moved to ${STAGES.find((s) => s.id === stageId)?.label}`,
      type: "default",
      duration: 3000,
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

  return (
    <Sheet open={Boolean(selectedJob)} onOpenChange={(open) => !open && setSelectedJobId(null)}>
      <div className="space-y-6">
        {/* Header with Title and Company */}
        <SheetHeader className="relative pr-8 border-b border-hairline pb-4">
          <SheetClose onClick={() => setSelectedJobId(null)} />
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">
              {selectedJob.company}
            </span>
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
                className="text-xs h-7 px-2.5 rounded-md font-medium"
              >
                {s.label}
              </Button>
            ))}
          </div>
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
              <a
                href={selectedJob.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover hover:underline font-medium"
              >
                <span>Open posting</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
          <div className="rounded-lg border border-hairline bg-surface-2 p-4 text-xs leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap text-ink font-normal">
            {selectedJob.description || "No description captured."}
          </div>
        </div>

        {/* Notes & Timeline Log */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-medium text-ink-subtle uppercase tracking-wider">
            Personal Notes & Timeline
          </label>

          <form onSubmit={handleAddNote} className="space-y-2">
            <Textarea
              placeholder="e.g. Recruiter phone screen scheduled for Tuesday 2pm..."
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              className="text-xs resize-none"
              rows={2}
            />
            <div className="flex justify-end">
              <Button type="submit" size="sm" className="gap-1.5 text-xs font-medium">
                <Send className="h-3 w-3" />
                Add Note
              </Button>
            </div>
          </form>

          {/* Notes list */}
          <div className="space-y-2 max-h-48 overflow-y-auto pt-1">
            {selectedJob.notes && selectedJob.notes.length > 0 ? (
              selectedJob.notes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-md border border-hairline bg-surface-2 p-3 text-xs space-y-1 shadow-none"
                >
                  <p className="text-ink leading-normal">{note.text}</p>
                  <div className="flex items-center gap-1 text-xs text-ink-subtle">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-ink-subtle italic">
                No notes added yet. Keep track of interview dates, recruiters, and follow-ups.
              </p>
            )}
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
                className="text-xs font-medium h-7 px-2.5"
              >
                Yes, Delete
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setConfirmingJobId(null)}
                className="text-xs font-medium h-7 px-2.5"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmingJobId(selectedJob.id)}
              className="gap-1 text-xs font-medium"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Opportunity
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSelectedJobId(null)}
            className="text-xs font-medium"
          >
            Done
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
