import { test, expect } from "@playwright/test";

test.describe("Pipeline Velocity & Conversion Funnel Analytics Suite", () => {
  test.beforeEach(async ({ request }) => {
    // Reset database to ensure default sample dataset (5 jobs across all stages)
    await request.post("/api/jobs/reset");
  });

  test("renders executive KPI metrics and stage progression funnel", async ({ page }) => {
    await page.goto("/analytics");

    // 1. Verify container and header
    const container = page.getByTestId("analytics-view-container");
    await expect(container).toBeVisible();
    await expect(container).toContainText("Pipeline Velocity & Funnel");
    await expect(container).toContainText("5 Tracked Opportunities");

    // 2. Verify executive KPI cards
    await expect(page.getByText("Wishlist Conversion")).toBeVisible();
    await expect(page.getByText("Screen & Loop Rate")).toBeVisible();
    await expect(page.getByText("Offers Received")).toBeVisible();
    await expect(page.getByText("Overall Yield")).toBeVisible();

    // 3. Verify core stepped conversion funnel card
    const funnelCard = page.getByTestId("conversion-funnel-card");
    await expect(funnelCard).toBeVisible();
    await expect(funnelCard).toContainText("Wishlist (Saved)");
    await expect(funnelCard).toContainText("Applied (Submitted)");
    await expect(funnelCard).toContainText("Interviewing (Screens & Loops)");
    await expect(funnelCard).toContainText("Offer Received (Negotiations)");

    // 4. Verify conversion bridge indicators
    await expect(funnelCard.getByText(/progressed/i).first()).toBeVisible();

    // 5. Verify source attribution breakdown card
    const sourceCard = page.getByTestId("source-performance-card");
    await expect(sourceCard).toBeVisible();
    await expect(sourceCard).toContainText("Channel Yield by Platform");
    await expect(sourceCard.getByTestId("job-source-badge").first()).toBeVisible();
  });

  test("clicking funnel stage link navigates to filtered applications view", async ({ page }) => {
    await page.goto("/analytics");

    // Click filter link on Applied stage
    const funnelCard = page.getByTestId("conversion-funnel-card");
    const appliedFilterLink = funnelCard.locator('a[href*="/applications?stage=applied"]');
    await expect(appliedFilterLink).toBeVisible();
    await appliedFilterLink.click();

    // Verify URL and table view with applied stage filter
    await expect(page).toHaveURL(/\/applications\?stage=applied/);
    await expect(page.getByTestId("table-view-container")).toBeVisible();
    await expect(page.getByText("applied stage filtered")).toBeVisible();
  });
});
