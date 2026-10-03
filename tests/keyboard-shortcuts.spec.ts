import { test, expect } from "@playwright/test";

test.describe("Global Keyboard Shortcuts Cheatsheet Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/board");
    await expect(page.getByTestId("column-wishlist")).toBeVisible();
    await page.locator("header").first().click({ position: { x: 10, y: 10 } });
  });

  test("pressing '?' key triggers the Keyboard Shortcuts modal", async ({ page }) => {
    // 1. Initially modal is closed
    const modal = page.getByTestId("keyboard-shortcuts-modal");
    await expect(modal).not.toBeVisible();

    // 2. Press '?' (Shift+/) key anywhere on the page
    await page.keyboard.press("Shift+/");

    // 3. Modal opens and displays title and categories
    await expect(modal).toBeVisible();
    await expect(modal).toContainText("Keyboard Shortcuts");
    await expect(modal).toContainText("Global Navigation & Control");
    await expect(modal).toContainText("Pipeline Board Accelerators");
    await expect(modal).toContainText("Applications Table & Bulk Triage");

    // 4. Verify keycaps are rendered
    await expect(modal.locator("kbd").filter({ hasText: "C" }).first()).toBeVisible();
    await expect(modal.locator("kbd").filter({ hasText: "/" }).first()).toBeVisible();
    await expect(modal.locator("kbd").filter({ hasText: "?" }).first()).toBeVisible();
    await expect(modal.locator("kbd").filter({ hasText: "J" }).first()).toBeVisible();
    await expect(modal.locator("kbd").filter({ hasText: "K" }).first()).toBeVisible();

    // 5. Pressing 'Escape' closes the modal
    await page.keyboard.press("Escape");
    await expect(modal).not.toBeVisible();
  });

  test("clicking topbar or sidebar shortcuts button opens the cheatsheet", async ({ page }) => {
    const modal = page.getByTestId("keyboard-shortcuts-modal");

    // 1. Click topbar shortcuts trigger
    const topbarBtn = page.getByTestId("topbar-shortcuts-btn");
    await expect(topbarBtn).toBeVisible();
    await topbarBtn.click();
    await expect(modal).toBeVisible();

    // 2. Close via "Got it" button
    const closeBtn = modal.getByRole("button", { name: "Got it" });
    await closeBtn.click();
    await expect(modal).not.toBeVisible();

    // 3. Click sidebar shortcuts trigger
    const sidebarBtn = page.getByTestId("sidebar-shortcuts-btn");
    await expect(sidebarBtn).toBeVisible();
    await sidebarBtn.click();
    await expect(modal).toBeVisible();
  });

  test("does not trigger '?' shortcut when typing in search or text input", async ({ page }) => {
    const searchInput = page.getByTestId("job-search-input");
    const modal = page.getByTestId("keyboard-shortcuts-modal");

    // Focus search input and type with '?'
    await searchInput.focus();
    await searchInput.fill("Senior?");

    // Modal should NOT open
    await expect(modal).not.toBeVisible();
    await expect(searchInput).toHaveValue("Senior?");
  });

  test("pressing 'C' key opens Quick Add modal, and pressing '/' focuses search", async ({ page }) => {
    // 1. Press 'C' key to trigger Quick Add modal
    await page.keyboard.press("c");
    const quickAddModal = page.getByTestId("quick-add-modal");
    await expect(quickAddModal).toBeVisible();

    // Dismiss with Escape
    await page.keyboard.press("Escape");
    await expect(quickAddModal).not.toBeVisible();

    // 2. Press '/' key to focus search input
    const searchInput = page.getByTestId("job-search-input");
    await page.keyboard.press("/");
    await expect(searchInput).toBeFocused();
  });
});
