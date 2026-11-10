import { test, expect } from "@playwright/test";

test.describe("Job Hunt Command Center Lifecycle & Component Suite", () => {
  test.beforeAll(async ({ request }) => {
    await request.post("http://localhost:3000/api/jobs/reset");
  });

  test("displays Kanban board with 5 columns, metrics, and seed jobs in Linear design", async ({
    page,
  }) => {
    await page.goto("/");

    // Verify 56px Linear header & branding
    await expect(page.getByRole("heading", { name: "JobClippy" })).toBeVisible();
    await expect(page.locator('img[alt="JobClippy Logo"]').first()).toBeVisible();

    // Verify 5 pipeline columns
    await expect(page.getByTestId("column-wishlist")).toBeVisible();
    await expect(page.getByTestId("column-applied")).toBeVisible();
    await expect(page.getByTestId("column-interviewing")).toBeVisible();
    await expect(page.getByTestId("column-offer")).toBeVisible();
    await expect(page.getByTestId("column-archived")).toBeVisible();

    // Verify metric cards
    await expect(page.getByText("Active Opportunities")).toBeVisible();
    await expect(page.getByText("Applications Sent")).toBeVisible();
    await expect(page.getByText("Live Interviews")).toBeVisible();
    await expect(page.getByText("Offers Received")).toBeVisible();

    // Verify seed job card and its metadata
    const seedCard = page.getByText("Senior Product Designer");
    await expect(seedCard).toBeVisible();
    await expect(page.getByText("LinearFlow")).toBeVisible();
  });

  test("smart clipper extracts job details, adds job, transitions stages, and manages notes", async ({
    page,
  }) => {
    await page.goto("/");

    // 1. Open Quick Add Modal
    const quickAddBtn = page.getByTestId("quick-add-btn");
    await quickAddBtn.click();

    // 2. Test Smart Clipper Tab
    const rawTextarea = page.locator('textarea[placeholder*="Paste raw job description here"]');
    await rawTextarea.fill(
      "Staff Frontend Infrastructure Engineer at Vercel.\nRemote — US.\nCompensation: $190,000 - $240,000 / year.\nRequirements: Next.js, TypeScript, React, Turbopack, Tailwind CSS."
    );
    await page.locator('input[placeholder*="jobs/view"]').fill("https://vercel.com/careers/staff-frontend");

    // Click Auto-Extract
    await page.getByRole("button", { name: "Auto-Extract & Review" }).click();

    // Verify fields populated on the details tab
    const titleInput = page.locator("#job-title-input");
    await expect(titleInput).toHaveValue("Staff Frontend Infrastructure Engineer");

    // Save Opportunity
    await page.locator("#save-job-submit-btn").click();

    // Verify card is added to Wishlist column
    const wishlistColumn = page.getByTestId("column-wishlist");
    const newCard = wishlistColumn.getByText("Staff Frontend Infrastructure Engineer").first();
    await expect(newCard).toBeVisible();

    // 3. Open Slide-Over Detail Sheet by clicking the card
    await newCard.click();
    await expect(page.locator("#job-detail-title")).toHaveText("Staff Frontend Infrastructure Engineer");

    // Verify salary detection in sheet
    await expect(page.getByText("$190K–$240K").first()).toBeVisible();

    // 4. Add Personal Note to Timeline
    const noteTextarea = page.locator('textarea[placeholder*="Recruiter phone screen"]');
    await noteTextarea.fill("Submitted portfolio and scheduled technical intro call for Thursday.");
    await page.getByRole("button", { name: "Add Note" }).click();
    await expect(page.getByText("Submitted portfolio and scheduled technical intro call for Thursday.")).toBeVisible();

    // 5. Move Stage to Interviewing via Sheet pill
    await page.getByRole("button", { name: "Interviewing" }).click();

    // Close panel
    await page.getByRole("button", { name: "Done" }).click();

    // Verify card moved to Interviewing column
    const interviewingColumn = page.getByTestId("column-interviewing");
    await expect(interviewingColumn.getByText("Staff Frontend Infrastructure Engineer")).toBeVisible();

    // 6. Test Search Filtering
    const searchInput = page.getByTestId("job-search-input");
    await searchInput.fill("Vercel");
    await expect(page.getByRole("heading", { name: "Staff Frontend Infrastructure Engineer" })).toBeVisible();
    await expect(page.getByText("Senior Product Designer")).not.toBeVisible();

    // Clear search
    await searchInput.fill("");
    await expect(page.getByText("Senior Product Designer")).toBeVisible();

    // 7. Delete Job via Card Dropdown
    const actionsBtn = interviewingColumn.locator('button[aria-label="Job actions"]').first();
    await actionsBtn.click();
    await page.getByText("Delete Job").click();

    // Verify card is removed
    await expect(interviewingColumn.getByText("Staff Frontend Infrastructure Engineer")).not.toBeVisible();
  });
});
