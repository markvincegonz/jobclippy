import { test, expect } from "@playwright/test";

test.describe("URL Routing, Job Source Badges & Wider Detail Sheet Suite", () => {
  test.beforeEach(async ({ request }) => {
    await request.post("/api/jobs/reset");
  });

  test("root URL / redirects to /board", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/board/);
    await expect(page.getByTestId("column-wishlist")).toBeVisible();
    await expect(page.getByTestId("top-context-bar")).toContainText("Active Pipeline");
  });

  test("direct URL access loads distinct view and highlights sidebar link", async ({ page }) => {
    // 1. Direct to /applications
    await page.goto("/applications");
    await expect(page).toHaveURL(/\/applications/);
    await expect(page.getByTestId("table-view-container")).toBeVisible();
    const tableBtn = page.getByTestId("nav-table-btn");
    await expect(tableBtn).toHaveClass(/bg-surface-2/);

    // 2. Direct to /analytics
    await page.goto("/analytics");
    await expect(page).toHaveURL(/\/analytics/);
    await expect(page.getByTestId("analytics-view-container")).toBeVisible();
    const analyticsBtn = page.getByTestId("nav-analytics-btn");
    await expect(analyticsBtn).toHaveClass(/bg-surface-2/);

    // 3. Direct to /settings
    await page.goto("/settings");
    await expect(page).toHaveURL(/\/settings/);
    await expect(page.getByTestId("settings-view-container")).toBeVisible();
    const settingsBtn = page.getByTestId("nav-settings-btn");
    await expect(settingsBtn).toHaveClass(/bg-surface-2/);
  });

  test("client-side navigation via sidebar links updates URL and view", async ({ page }) => {
    await page.goto("/board");

    // Click All Applications link
    await page.getByTestId("nav-table-btn").click();
    await expect(page).toHaveURL(/\/applications/);
    await expect(page.getByTestId("table-view-container")).toBeVisible();

    // Click Analytics link
    await page.getByTestId("nav-analytics-btn").click();
    await expect(page).toHaveURL(/\/analytics/);
    await expect(page.getByTestId("analytics-view-container")).toBeVisible();

    // Browser back returns to /applications
    await page.goBack();
    await expect(page).toHaveURL(/\/applications/);
    await expect(page.getByTestId("table-view-container")).toBeVisible();

    // Browser back returns to /board
    await page.goBack();
    await expect(page).toHaveURL(/\/board/);
    await expect(page.getByTestId("column-wishlist")).toBeVisible();
  });

  test("persists search query and stage filter in URL search parameters", async ({ page }) => {
    await page.goto("/board");

    // 1. Type in search bar
    const searchInput = page.getByTestId("job-search-input");
    await searchInput.fill("Designer");
    await expect(page).toHaveURL(/q=Designer/);

    // 2. Click stage shortcut in sidebar
    await page.getByTestId("stage-shortcut-wishlist").click();
    await expect(page).toHaveURL(/stage=wishlist/);
    await expect(page).toHaveURL(/q=Designer/);

    // 3. Reload preserves URL and filters
    await page.reload();
    await expect(page).toHaveURL(/stage=wishlist/);
    await expect(page).toHaveURL(/q=Designer/);
    await expect(searchInput).toHaveValue("Designer");

    // Clear stage filter in breadcrumbs
    const clearStageBtn = page.getByRole("button", { name: "Clear stage filter" });
    await expect(clearStageBtn).toBeVisible();
    await clearStageBtn.click();
    await expect(page).not.toHaveURL(/stage=/);
  });

  test("renders minimalist source favicon and text label on board cards, table rows, and detail sheet", async ({
    page,
  }) => {
    await page.goto("/board");

    // 1. Kanban Card has JobSourceBadge
    const linearFlowCard = page.locator('[data-testid^="job-card-"]').filter({ hasText: "LinearFlow" }).first();
    await expect(linearFlowCard).toBeVisible();
    const cardBadge = linearFlowCard.getByTestId("job-source-badge");
    await expect(cardBadge).toBeVisible();
    await expect(cardBadge).toContainText("LinkedIn");
    await expect(cardBadge.locator("img")).toBeVisible();

    // 2. Applications Table has JobSourceBadge
    await page.getByTestId("nav-table-btn").click();
    await expect(page.getByTestId("table-view-container")).toBeVisible();
    const tableBadge = page.getByTestId("table-row-job-1").getByTestId("job-source-badge");
    await expect(tableBadge).toBeVisible();
    await expect(tableBadge).toContainText("LinkedIn");

    // 3. Detail sheet has JobSourceBadge in header
    await page.getByTestId("table-row-job-1").click();
    const sheet = page.getByTestId("job-detail-sheet");
    await expect(sheet).toBeVisible();
    const sheetBadge = sheet.getByTestId("job-source-badge").first();
    await expect(sheetBadge).toBeVisible();
    await expect(sheetBadge).toContainText("LinkedIn");

    // Close detail sheet
    const doneBtn = page.getByRole("button", { name: "Done" });
    await doneBtn.scrollIntoViewIfNeeded();
    await doneBtn.click();
  });

  test("detail drawer renders at wider 1.5x width (max-w-3xl)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/board");

    // Open detail sheet
    const card = page.locator('[data-testid^="job-card-"]').first();
    await card.click();

    const panelContainer = page.getByTestId("sheet-panel-container");
    await expect(panelContainer).toBeVisible();
    await expect(panelContainer).toHaveClass(/max-w-3xl/);

    // Measure bounding box width (768px for max-w-3xl in Tailwind)
    const box = await panelContainer.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(650); // Wider than original 576px (max-w-xl)
    expect(Math.round(box!.width)).toBeLessThanOrEqual(768);
  });

  test("kanban board enables horizontal scroll container at 1024px viewport to prevent card clipping", async ({
    page,
  }) => {
    // Exactly at 1024px desktop breakpoint where 240px sidebar mounts
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto("/board");

    const scrollContainer = page.getByTestId("kanban-board-scroll-container");
    await expect(scrollContainer).toBeVisible();

    // Verify horizontal scrolling capability: scrollWidth must exceed visible clientWidth
    const { scrollWidth, clientWidth } = await scrollContainer.evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    }));

    expect(scrollWidth).toBeGreaterThan(clientWidth);
    expect(scrollWidth).toBeGreaterThanOrEqual(1300);

    // Verify individual columns preserve healthy minimum width (>= 240px)
    const wishlistCol = page.getByTestId("column-wishlist");
    await expect(wishlistCol).toBeVisible();
    const colBox = await wishlistCol.boundingBox();
    expect(colBox).not.toBeNull();
    expect(colBox!.width).toBeGreaterThanOrEqual(240);

    // Verify cards do not overflow their column container
    const firstCard = wishlistCol.locator('[data-testid^="job-card-"]').first();
    await expect(firstCard).toBeVisible();
    const cardBox = await firstCard.boundingBox();
    expect(cardBox).not.toBeNull();
    expect(cardBox!.width).toBeLessThanOrEqual(colBox!.width);
  });
});

