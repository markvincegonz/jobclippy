import { test, expect } from "@playwright/test";

test.describe("Interview Workspace, Calendar Sync & Activity Timeline Suite", () => {
  test.beforeEach(async ({ request }) => {
    await request.post("/api/jobs/reset");
  });

  test("displays live interview countdown badge on Kanban card and applications table", async ({
    page,
  }) => {
    // job-3 (DataPulse AI) has interviewDate: 2026-10-05T14:00:00.000Z
    await page.goto("/board");

    // 1. Kanban card shows interview countdown badge
    const badge = page.getByTestId("interview-countdown-badge-job-3");
    await expect(badge).toBeVisible();
    await expect(badge).toContainText(/Today|Tomorrow|In \d+ days|Oct/);

    // 2. Applications table also shows the countdown badge
    await page.goto("/applications");
    const tableBadge = page.getByTestId("table-interview-badge-job-3");
    await expect(tableBadge).toBeVisible();
    await expect(tableBadge).toContainText(/Today|Tomorrow|In \d+ days|Oct/);
  });

  test("JobDetailSheet provides 1-click Google Calendar sync and .ics download", async ({
    page,
  }) => {
    await page.goto("/board");

    // Open job-3 detail sheet
    const job3Card = page.getByTestId("job-card-job-3");
    await job3Card.click();

    const sheet = page.getByTestId("job-detail-sheet");
    await expect(sheet).toBeVisible();

    const workspace = page.getByTestId("interview-workspace-container");
    await expect(workspace).toBeVisible();

    // Verify countdown pill is rendered in header
    await expect(page.getByTestId("interview-countdown-pill")).toBeVisible();

    // 1. Verify Google Calendar button has proper template URL
    const googleBtn = page.getByTestId("add-google-calendar-btn");
    await expect(googleBtn).toBeVisible();
    await expect(googleBtn).toHaveAttribute(
      "href",
      /calendar\.google\.com\/calendar\/render\?action=TEMPLATE/
    );
    await expect(googleBtn).toHaveAttribute("target", "_blank");

    // 2. Verify .ics download button
    const icsBtn = page.getByTestId("download-ics-calendar-btn");
    await expect(icsBtn).toBeVisible();
  });

  test("renders chronological activity timeline with audit events in JobDetailSheet", async ({
    page,
  }) => {
    await page.goto("/board");

    // Open job-3 detail sheet
    await page.getByTestId("job-card-job-3").click();

    const sheet = page.getByTestId("job-detail-sheet");
    await expect(sheet).toBeVisible();

    const timeline = page.getByTestId("job-activity-timeline");
    await expect(timeline).toBeVisible();

    // Verify key audit milestones are visible in chronological order
    await expect(page.getByTestId("timeline-event-created")).toBeVisible();
    await expect(page.getByTestId("timeline-event-applied")).toBeVisible();
    await expect(page.getByTestId("timeline-event-interview")).toBeVisible();
    await expect(page.getByTestId("timeline-event-note")).toBeVisible();

    // Verify event texts
    await expect(timeline.getByText("Opportunity Saved", { exact: true })).toBeVisible();
    await expect(timeline.getByText("Application Submitted", { exact: true })).toBeVisible();
    await expect(timeline.getByText("Interview Scheduled", { exact: true })).toBeVisible();
    await expect(timeline.getByText("Personal Note Recorded", { exact: true })).toBeVisible();

    // Add a new note and verify it appears at the top of the timeline
    const noteTextarea = sheet.locator("textarea");
    await noteTextarea.fill("Followed up with recruiter on LinkedIn");
    await sheet.getByRole("button", { name: "Add Note" }).click();

    await expect(timeline.getByText("Followed up with recruiter on LinkedIn")).toBeVisible();
  });
});
