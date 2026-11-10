import { test, expect } from "@playwright/test";

test.describe("Admin Sidebar Navigation & App Shell Suite", () => {
  test("renders desktop sidebar with brand, navigation views, and stage counts", async ({
    page,
  }) => {
    await page.goto("/");

    const sidebar = page.getByTestId("admin-sidebar");
    await expect(sidebar).toBeVisible();

    // Verify Brand Header
    await expect(sidebar.getByRole("heading", { name: "JobClippy" })).toBeVisible();
    await expect(sidebar.locator('img[alt="JobClippy Logo"]')).toBeVisible();

    // Verify Primary View Navigation Buttons
    await expect(page.getByTestId("nav-board-btn")).toBeVisible();
    await expect(page.getByTestId("nav-table-btn")).toBeVisible();
    await expect(page.getByTestId("nav-analytics-btn")).toBeVisible();
    await expect(page.getByTestId("nav-settings-btn")).toBeVisible();

    // Verify Stage Shortcuts and Counts
    const wishlistShortcut = page.getByTestId("stage-shortcut-wishlist");
    await expect(wishlistShortcut).toBeVisible();
    await expect(page.getByTestId("stage-shortcut-applied")).toBeVisible();
    await expect(page.getByTestId("stage-shortcut-interviewing")).toBeVisible();
    await expect(page.getByTestId("stage-shortcut-offer")).toBeVisible();
    await expect(page.getByTestId("stage-shortcut-archived")).toBeVisible();
  });

  test("toggles sidebar collapse via button and keyboard shortcut '['", async ({
    page,
  }) => {
    await page.goto("/");

    const sidebar = page.getByTestId("admin-sidebar");
    await expect(sidebar).toBeVisible();

    // Initially expanded (w-60 min-w-[240px])
    await expect(sidebar).toHaveClass(/w-60/);

    // Click collapse button
    const collapseBtn = sidebar.getByRole("button", { name: /Collapse sidebar/i });
    await collapseBtn.click();

    // Verify collapsed state (w-14 min-w-[56px])
    await expect(sidebar).toHaveClass(/w-14/);

    // Expand via keyboard shortcut '['
    await page.keyboard.press("[");
    await expect(sidebar).toHaveClass(/w-60/);

    // Collapse via keyboard shortcut '['
    await page.keyboard.press("[");
    await expect(sidebar).toHaveClass(/w-14/);
  });

  test("switches between views and updates breadcrumb context", async ({
    page,
  }) => {
    await page.goto("/");

    // 1. Initial view is Board
    await expect(page.getByTestId("column-wishlist")).toBeVisible();
    await expect(page.getByTestId("top-context-bar")).toContainText("Active Pipeline");

    // 2. Switch to Table view
    await page.getByTestId("nav-table-btn").click();
    await expect(page.getByTestId("table-view-container")).toBeVisible();
    await expect(page.getByTestId("top-context-bar")).toContainText("Tabular Directory");
    await expect(page.getByTestId("column-wishlist")).not.toBeVisible();

    // 3. Switch to Analytics view
    await page.getByTestId("nav-analytics-btn").click();
    await expect(page.getByTestId("analytics-view-container")).toBeVisible();
    await expect(page.getByTestId("top-context-bar")).toContainText("Funnel Analytics");

    // 4. Switch to Settings view
    await page.getByTestId("nav-settings-btn").click();
    await expect(page.getByTestId("settings-view-container")).toBeVisible();
    await expect(page.getByTestId("top-context-bar")).toContainText("Command Center Settings");

    // 5. Return to Board view
    await page.getByTestId("nav-board-btn").click();
    await expect(page.getByTestId("column-wishlist")).toBeVisible();
    await expect(page.getByTestId("top-context-bar")).toContainText("Active Pipeline");
  });

  test("spotlights stage column via sidebar stage shortcut", async ({ page }) => {
    await page.goto("/");

    // Click Interviewing stage shortcut
    const interviewingShortcut = page.getByTestId("stage-shortcut-interviewing");
    await interviewingShortcut.click();

    // Interviewing column is spotlighted while keeping all columns visible
    const interviewingCol = page.getByTestId("column-interviewing");
    await expect(interviewingCol).toBeVisible();
    await expect(interviewingCol).toHaveAttribute("data-spotlight", "true");

    // Verify clear stage filter button in breadcrumbs
    const clearBtn = page.getByRole("button", { name: "Clear stage filter" });
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();

    // Spotlight cleared
    await expect(interviewingCol).not.toHaveAttribute("data-spotlight", "true");
  });

  test("mobile viewport toggles slide-over drawer navigation", async ({
    page,
  }) => {
    // Set viewport to mobile size (< 1024px)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    // Desktop sidebar is hidden
    await expect(page.locator(".hidden.lg\\:block [data-testid='admin-sidebar']")).not.toBeVisible();

    // Open mobile drawer
    const hamburgerBtn = page.getByTestId("mobile-sidebar-toggle-btn");
    await expect(hamburgerBtn).toBeVisible();
    await hamburgerBtn.click();

    // Drawer should be open with sidebar content
    const drawer = page.locator(".fixed.inset-0.z-50");
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole("heading", { name: "JobClippy" })).toBeVisible();

    // Click Table view in drawer
    await drawer.getByTestId("nav-table-btn").click();

    // Drawer should close and Table view should be visible
    await expect(drawer).not.toBeVisible();
    await expect(page.getByTestId("table-view-container")).toBeVisible();
  });
});
