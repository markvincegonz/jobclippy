import { test, expect } from "@playwright/test";

test.describe("Linear-Grade Command Palette (Cmd+K / Ctrl+K) Suite", () => {
  test.beforeEach(async ({ request }) => {
    await request.post("/api/jobs/reset");
  });

  test("opens command palette via topbar button and keyboard shortcut Cmd+K / Ctrl+K", async ({
    page,
  }) => {
    await page.goto("/board");

    const palette = page.getByTestId("command-palette-modal");
    await expect(palette).not.toBeVisible();

    // 1. Open via topbar button
    const topbarBtn = page.getByTestId("topbar-command-palette-btn");
    await expect(topbarBtn).toBeVisible();
    await topbarBtn.click();
    await expect(palette).toBeVisible();

    // Verify input is auto-focused
    const input = page.getByTestId("command-palette-input");
    await expect(input).toBeFocused();

    // Close via Esc
    await page.keyboard.press("Escape");
    await expect(palette).not.toBeVisible();

    // 2. Open via keyboard shortcut (Control+k / Meta+k)
    await page.keyboard.press("Control+k");
    await expect(palette).toBeVisible();
  });

  test("searches and filters navigation views and action items", async ({ page }) => {
    await page.goto("/board");

    // Open palette
    await page.getByTestId("topbar-command-palette-btn").click();
    const input = page.getByTestId("command-palette-input");

    // Type "Analytics"
    await input.fill("Analytics");

    const analyticsItem = page.getByTestId("command-item-nav-analytics");
    await expect(analyticsItem).toBeVisible();
    await expect(page.getByTestId("command-item-nav-board")).not.toBeVisible();

    // Select Analytics with Enter
    await page.keyboard.press("Enter");

    // Should navigate to /analytics
    await expect(page).toHaveURL(/\/analytics/);
    await expect(page.getByTestId("analytics-view-container")).toBeVisible();
  });

  test("searches tracked opportunities and opens JobDetailSheet on selection", async ({ page }) => {
    await page.goto("/board");

    // Open palette
    await page.locator("body").click();
    await page.keyboard.press("Control+k");
    const input = page.getByTestId("command-palette-input");
    await expect(input).toBeVisible();

    // Search for "Senior Product Designer"
    await input.fill("Designer");

    const designerItem = page.getByTestId("command-item-job-job-1");
    await expect(designerItem).toBeVisible();
    await expect(designerItem).toContainText("Senior Product Designer");
    await expect(designerItem).toContainText("LinearFlow");

    // Press Enter to open
    await page.keyboard.press("Enter");

    // Palette should close and JobDetailSheet should open
    await expect(page.getByTestId("command-palette-modal")).not.toBeVisible();
    const sheet = page.getByTestId("job-detail-sheet");
    await expect(sheet).toBeVisible();
    await expect(sheet.getByRole("heading", { name: "Senior Product Designer" })).toBeVisible();
  });

  test("navigates results with arrow keys and loops correctly", async ({ page }) => {
    await page.goto("/board");

    await page.locator("body").click();
    await page.keyboard.press("Control+k");
    await expect(page.getByTestId("command-palette-modal")).toBeVisible();

    const boardItem = page.getByTestId("command-item-nav-board");
    const tableItem = page.getByTestId("command-item-nav-applications");

    // Initially first item is selected
    await expect(boardItem).toHaveAttribute("data-selected", "true");

    // Press ArrowDown
    await page.keyboard.press("ArrowDown");
    await expect(tableItem).toHaveAttribute("data-selected", "true");
    await expect(boardItem).toHaveAttribute("data-selected", "false");

    // Press ArrowUp
    await page.keyboard.press("ArrowUp");
    await expect(boardItem).toHaveAttribute("data-selected", "true");
  });
});
