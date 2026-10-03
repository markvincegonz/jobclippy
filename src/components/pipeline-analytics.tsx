"use client";

import * as React from "react";
import Link from "next/link";
import {
  TrendingUp,
  Inbox,
  Send,
  Calendar,
  CheckCircle2,
  Archive,
  ArrowDown,
  ArrowUpRight,
  Target,
  Sparkles,
  Layers,
  Clock,
  Briefcase,
} from "lucide-react";
import { useJobStore, JobStage } from "@/lib/job-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JobSourceBadge } from "@/components/job-source-badge";
import { getJobSource } from "@/lib/job-source";
import { cn } from "@/lib/utils";

interface FunnelStep {
  id: JobStage;
  label: string;
  count: number;
  color: string;
  barColor: string;
  borderColor: string;
  textColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function PipelineAnalytics() {
  const { jobs } = useJobStore();

  const total = jobs.length;
  const wishlistJobs = jobs.filter((j) => j.stage === "wishlist");
  const appliedJobs = jobs.filter((j) => j.stage === "applied");
  const interviewingJobs = jobs.filter((j) => j.stage === "interviewing");
  const offerJobs = jobs.filter((j) => j.stage === "offer");
  const archivedJobs = jobs.filter((j) => j.stage === "archived");

  // Calculated conversions
  const applicationsTotal = appliedJobs.length + interviewingJobs.length + offerJobs.length;
  const wishlistConversionRate = total > 0 ? Math.round((applicationsTotal / total) * 100) : 0;

  const interviewRate =
    applicationsTotal > 0
      ? Math.round(((interviewingJobs.length + offerJobs.length) / applicationsTotal) * 100)
      : 0;

  const offerConversionRate =
    interviewingJobs.length + offerJobs.length > 0
      ? Math.round((offerJobs.length / (interviewingJobs.length + offerJobs.length)) * 100)
      : 0;

  const overallYield = applicationsTotal > 0 ? Math.round((offerJobs.length / applicationsTotal) * 100) : 0;

  const funnelSteps: FunnelStep[] = [
    {
      id: "wishlist",
      label: "Wishlist (Saved)",
      count: wishlistJobs.length,
      color: "bg-amber-400",
      barColor: "bg-amber-400",
      borderColor: "border-amber-400/40",
      textColor: "text-amber-400",
      icon: Inbox,
    },
    {
      id: "applied",
      label: "Applied (Submitted)",
      count: appliedJobs.length,
      color: "bg-sky-400",
      barColor: "bg-sky-400",
      borderColor: "border-sky-400/40",
      textColor: "text-sky-400",
      icon: Send,
    },
    {
      id: "interviewing",
      label: "Interviewing (Screens & Loops)",
      count: interviewingJobs.length,
      color: "bg-purple-400",
      barColor: "bg-purple-400",
      borderColor: "border-purple-400/40",
      textColor: "text-purple-400",
      icon: Calendar,
    },
    {
      id: "offer",
      label: "Offer Received (Negotiations)",
      count: offerJobs.length,
      color: "bg-emerald-400",
      barColor: "bg-emerald-400",
      borderColor: "border-emerald-400/40",
      textColor: "text-emerald-400",
      icon: CheckCircle2,
    },
  ];

  // Group by job source
  const sourceBreakdown = React.useMemo(() => {
    const map = new Map<string, { brand: string; url: string; count: number; offers: number; interviewing: number }>();
    jobs.forEach((job) => {
      const source = getJobSource(job.url);
      const brand = source?.brand || "Direct / Career Portal";
      const existing = map.get(brand) || {
        brand,
        url: job.url || "",
        count: 0,
        offers: 0,
        interviewing: 0,
      };
      existing.count += 1;
      if (job.stage === "offer") existing.offers += 1;
      if (job.stage === "interviewing") existing.interviewing += 1;
      map.set(brand, existing);
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [jobs]);

  // Max count for scaling bars relative to total
  const maxFunnelCount = Math.max(...funnelSteps.map((s) => s.count), 1);

  return (
    <div data-testid="analytics-view-container" className="p-4 sm:p-6 w-full space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-hairline gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-medium tracking-tight text-ink">Pipeline Velocity & Funnel</h1>
            <Badge variant="outline" className="text-xs font-mono">
              {total} Tracked Opportunities
            </Badge>
          </div>
          <p className="text-xs text-ink-muted">
            Conversion diagnostics, stage drop-offs, and channel response velocity
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/board">
            <Button variant="secondary" size="sm" className="text-xs gap-1.5 border-hairline cursor-pointer">
              <span>View Pipeline Board</span>
              <ArrowUpRight className="h-3 w-3 text-ink-subtle" />
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-hairline bg-surface-1 surface-lift space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink-muted">Wishlist Conversion</span>
            <Inbox className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-medium tracking-tight text-ink">{wishlistConversionRate}%</div>
          <div className="text-[11px] text-ink-subtle">
            {applicationsTotal} of {total} saved roles turned into applications
          </div>
        </div>

        <div className="p-4 rounded-lg border border-hairline bg-surface-1 surface-lift space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink-muted">Screen & Loop Rate</span>
            <Calendar className="h-3.5 w-3.5 text-purple-400" />
          </div>
          <div className="text-2xl font-medium tracking-tight text-ink">{interviewRate}%</div>
          <div className="text-[11px] text-ink-subtle">
            {interviewingJobs.length + offerJobs.length} roles advancing past initial screen
          </div>
        </div>

        <div className="p-4 rounded-lg border border-hairline bg-surface-1 surface-lift space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink-muted">Offers Received</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-medium tracking-tight text-semantic-success">{offerJobs.length}</div>
          <div className="text-[11px] text-ink-subtle">
            {offerConversionRate}% interview-to-offer closure rate
          </div>
        </div>

        <div className="p-4 rounded-lg border border-hairline bg-surface-1 surface-lift space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink-muted">Overall Yield</span>
            <Target className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="text-2xl font-medium tracking-tight text-ink">{overallYield}%</div>
          <div className="text-[11px] text-ink-subtle">
            Total offer rate per submitted application
          </div>
        </div>
      </div>

      {/* Core Stepped Conversion Funnel */}
      <div
        data-testid="conversion-funnel-card"
        className="p-5 sm:p-6 rounded-lg border border-hairline bg-surface-1 surface-lift space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-hairline gap-2">
          <div>
            <h2 className="text-sm font-medium text-ink flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span>Pipeline Stage Progression & Drop-off Funnel</span>
            </h2>
            <p className="text-xs text-ink-muted">
              Through-rates and drop-off diagnosis from discovery to confirmed offer
            </p>
          </div>
          <div className="text-xs text-ink-subtle">
            {total ? `${Math.round(((total - archivedJobs.length) / total) * 100)}% active pipeline velocity` : "No data"}
          </div>
        </div>

        <div className="space-y-4">
          {funnelSteps.map((step, idx) => {
            const Icon = step.icon;
            const barWidthPercent = total > 0 ? Math.max(Math.round((step.count / total) * 100), 6) : 6;
            const nextStep = funnelSteps[idx + 1];

            // Transition calculations to the next step
            let stepConversion = 0;
            let stepDropOff = 0;
            if (nextStep) {
              if (step.id === "wishlist") {
                stepConversion = wishlistConversionRate;
                stepDropOff = 100 - wishlistConversionRate;
              } else if (step.id === "applied") {
                stepConversion = interviewRate;
                stepDropOff = 100 - interviewRate;
              } else if (step.id === "interviewing") {
                stepConversion = offerConversionRate;
                stepDropOff = 100 - offerConversionRate;
              }
            }

            return (
              <div key={step.id} className="space-y-2">
                {/* Stage Header Info */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full", step.color)} />
                    <span className="font-medium text-ink">{step.label}</span>
                    <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0">
                      {step.count} {step.count === 1 ? "role" : "roles"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-ink-subtle text-[11px]">
                      {total > 0 ? `${Math.round((step.count / total) * 100)}% of total` : "0%"}
                    </span>
                    <Link
                      href={`/applications?stage=${step.id}`}
                      className="text-primary hover:text-primary-hover text-[11px] font-medium flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Filter</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>

                {/* Horizontal Funnel Bar */}
                <div className="relative h-6 w-full rounded-md bg-surface-2 border border-hairline overflow-hidden p-0.5">
                  <div
                    style={{ width: `${barWidthPercent}%` }}
                    className={cn(
                      "h-full rounded-xs transition-all duration-500 ease-out flex items-center justify-end px-2 opacity-90 hover:opacity-100",
                      step.barColor
                    )}
                  >
                    <span className="text-[10px] font-mono font-medium text-black/90 dark:text-white select-none">
                      {step.count}
                    </span>
                  </div>
                </div>

                {/* Conversion Bridge between stages */}
                {nextStep && (
                  <div className="pl-4 py-1 flex items-center gap-3 text-[11px] text-ink-subtle">
                    <div className="flex items-center gap-1.5 text-primary font-medium">
                      <ArrowDown className="h-3.5 w-3.5 text-primary" />
                      <span>{stepConversion}% progressed</span>
                    </div>
                    {stepDropOff > 0 && (
                      <span className="text-ink-subtle">
                        • {stepDropOff}% dropped / inactive
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Lower Grid: Source Attribution & Channel Yield */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Source Attribution Card */}
        <div
          data-testid="source-performance-card"
          className="p-5 rounded-lg border border-hairline bg-surface-1 surface-lift space-y-4"
        >
          <div className="pb-2 border-b border-hairline flex items-center justify-between">
            <h3 className="text-sm font-medium text-ink flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-ink-muted" />
              <span>Channel Yield by Platform</span>
            </h3>
            <span className="text-xs text-ink-subtle font-mono">{sourceBreakdown.length} Sources</span>
          </div>

          <div className="space-y-3">
            {sourceBreakdown.map((item) => {
              const share = total > 0 ? Math.round((item.count / total) * 100) : 0;
              return (
                <div key={item.brand} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <JobSourceBadge url={item.url} />
                      <span className="font-mono text-ink-subtle text-[11px]">({item.count})</span>
                    </div>
                    <div className="flex items-center gap-2 text-ink-muted font-mono text-[11px]">
                      {item.offers > 0 && (
                        <span className="text-semantic-success font-medium">
                          {item.offers} {item.offers === 1 ? "Offer" : "Offers"}
                        </span>
                      )}
                      <span>{share}% share</span>
                    </div>
                  </div>
                  {/* Distribution bar */}
                  <div className="h-2 w-full rounded-full bg-surface-2 border border-hairline overflow-hidden">
                    <div
                      style={{ width: `${Math.max(share, 4)}%` }}
                      className="h-full bg-primary/70 rounded-full transition-all duration-300"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pipeline Health & Triage Checklist */}
        <div className="p-5 rounded-lg border border-hairline bg-surface-1 surface-lift space-y-4">
          <div className="pb-2 border-b border-hairline flex items-center justify-between">
            <h3 className="text-sm font-medium text-ink flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Pipeline Health & Active Momentum</span>
            </h3>
            <span className="text-xs text-ink-subtle">Candidate Checklist</span>
          </div>

          <div className="space-y-2.5 text-xs text-ink-muted">
            <div className="p-3 rounded-md bg-surface-2/60 border border-hairline flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-medium text-ink">Active Offer Stage</div>
                <p className="text-[11px] text-ink-subtle">
                  {offerJobs.length > 0
                    ? `You have ${offerJobs.length} active offer(s) to evaluate. Check compensation and prepare counter-proposals.`
                    : "No offers yet. Continue advancing interview loops."}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-md bg-surface-2/60 border border-hairline flex items-start gap-2.5">
              <Clock className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-medium text-ink">Applications in Review</div>
                <p className="text-[11px] text-ink-subtle">
                  {appliedJobs.length} opportunities submitted. Track follow-up timing and maintain active outreach.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-md bg-surface-2/60 border border-hairline flex items-start gap-2.5">
              <Inbox className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-medium text-ink">Saved Target Wishlist</div>
                <p className="text-[11px] text-ink-subtle">
                  {wishlistJobs.length} positions ready for application. Aim to convert 2-3 into formal submissions this week.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
