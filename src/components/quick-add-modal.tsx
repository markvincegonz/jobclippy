"use client";

import * as React from "react";
import { Sparkles, Check } from "lucide-react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { parseJobText } from "@/lib/extractor";
import { useJobStore, JobStage } from "@/lib/job-store";
import { useToast } from "@/components/ui/toast";

interface QuickAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickAddModal({ open, onOpenChange }: QuickAddModalProps) {
  const { addJob } = useJobStore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState<"smart" | "manual">("smart");

  // Smart tab state
  const [rawText, setRawText] = React.useState("");
  const [jobUrl, setJobUrl] = React.useState("");

  // Manual / preview state
  const [title, setTitle] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [location, setLocation] = React.useState("Remote");
  const [salary, setSalary] = React.useState("");
  const [skills, setSkills] = React.useState<string[]>([]);
  const [skillInput, setSkillInput] = React.useState("");
  const [stage, setStage] = React.useState<JobStage>("wishlist");

  // Run parser on smart text change
  const handleParse = () => {
    if (!rawText.trim()) return;
    const extracted = parseJobText(rawText, jobUrl);
    setTitle(extracted.title || "Software Engineer");
    setCompany(extracted.company || "Example Corp");
    setLocation(extracted.location || "Remote");
    setSalary(extracted.salary || "Salary not listed");
    setSkills(extracted.skills);
    setActiveTab("manual");
    toast({
      title: "Extracted job details",
      description: `Detected ${extracted.skills.length} skills. Please review before saving.`,
      type: "default",
      duration: 3500,
    });
  };

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      const sanitized = skillInput.trim().slice(0, 40);
      if (!skills.includes(sanitized)) {
        setSkills([...skills, sanitized]);
      }
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    const cleanCompany = company.trim();
    if (!cleanTitle || !cleanCompany) return;

    addJob({
      title: cleanTitle,
      company: cleanCompany,
      location: location.trim() || "Remote",
      salary: salary.trim() || "Salary not listed",
      skills,
      description: rawText || `Position for ${cleanTitle} at ${cleanCompany}.`,
      url: jobUrl.trim() || "https://linkedin.com",
      stage,
    });

    toast({
      title: "Opportunity saved",
      description: `Added to ${stage.charAt(0).toUpperCase() + stage.slice(1)} column`,
      type: "success",
      duration: 3500,
    });

    // Reset and close
    setRawText("");
    setJobUrl("");
    setTitle("");
    setCompany("");
    setSalary("");
    setSkills([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogClose onClick={() => onOpenChange(false)} />
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>Save New Opportunity</span>
        </DialogTitle>
        <DialogDescription>
          Clip a job posting using smart detection or fill in the details manually.
        </DialogDescription>
      </DialogHeader>

      {/* Tabs */}
      <div className="flex border-b border-hairline my-4">
        <button
          type="button"
          onClick={() => setActiveTab("smart")}
          className={`pb-2 px-4 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === "smart"
              ? "border-primary text-primary"
              : "border-transparent text-ink-subtle hover:text-ink"
          }`}
        >
          Smart Clipper
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("manual")}
          className={`pb-2 px-4 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === "manual"
              ? "border-primary text-primary"
              : "border-transparent text-ink-subtle hover:text-ink"
          }`}
        >
          Job Details
        </button>
      </div>

      {activeTab === "smart" ? (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-ink">
              Job URL (LinkedIn, Career page, etc.)
            </label>
            <Input
              placeholder="https://linkedin.com/jobs/view/..."
              value={jobUrl}
              maxLength={500}
              onChange={(e) => setJobUrl(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-ink">
              Paste Job Description or Highlighted Text
            </label>
            <Textarea
              placeholder="Paste raw job description here... (e.g. Senior Frontend Engineer at Acme. Compensation: $130k-$160k. Requirements: React, TypeScript, Next.js...)"
              value={rawText}
              maxLength={15000}
              onChange={(e) => setRawText(e.target.value)}
              className="text-xs h-32 resize-none"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              onClick={handleParse}
              disabled={!rawText.trim()}
              className="w-full sm:w-auto gap-1.5 text-xs font-medium"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Auto-Extract & Review
            </Button>
          </DialogFooter>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-ink">Job Title *</label>
              <Input
                required
                id="job-title-input"
                placeholder="Senior Product Designer"
                value={title}
                maxLength={100}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-ink">Company *</label>
              <Input
                required
                id="job-company-input"
                placeholder="Acme Corp"
                value={company}
                maxLength={100}
                onChange={(e) => setCompany(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-ink">Location</label>
              <Input
                placeholder="Remote, US or City"
                value={location}
                maxLength={100}
                onChange={(e) => setLocation(e.target.value)}
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-ink">Salary Range</label>
              <Input
                placeholder="$120K–$150K"
                value={salary}
                maxLength={60}
                onChange={(e) => setSalary(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-ink">Skills (press Enter to add)</label>
            <Input
              placeholder="Add skill tag..."
              value={skillInput}
              maxLength={40}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleAddSkill}
              className="text-xs"
            />
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {skills.map((s) => (
                  <Badge
                    key={s}
                    variant="skill"
                    onClick={() => handleRemoveSkill(s)}
                    className="cursor-pointer text-xs hover:bg-destructive/15 hover:text-destructive"
                  >
                    {s} ✕
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-ink">Initial Stage</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as JobStage)}
              className="w-full h-9 rounded-md border border-hairline bg-surface-1 text-ink px-3 py-1 text-xs outline-none focus:border-hairline-strong cursor-pointer"
            >
              <option value="wishlist">Wishlist</option>
              <option value="applied">Applied</option>
              <option value="interviewing">Interviewing</option>
              <option value="offer">Offer</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <DialogFooter>
            <Button type="submit" id="save-job-submit-btn" className="w-full sm:w-auto gap-1.5 text-xs font-medium">
              <Check className="h-3.5 w-3.5" />
              Save Opportunity
            </Button>
          </DialogFooter>
        </form>
      )}
    </Dialog>
  );
}
