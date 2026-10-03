import { test, expect } from "@playwright/test";

test.describe("Interactive Applications Table Suite", () => {
  test.beforeEach(async ({ page, request }) => {
    await request.post("/api/jobs/reset");
    await page.goto("/");
    // Switch to Table view
    await page.getByTestId("nav-table-btn").click();
    await expect(page.getByTestId("table-view-container")).toBeVisible();
  });

  test("renders high-density table records with headers and metadata", async ({
    page,
  }) => {
    const desktopTable = page.getByTestId("desktop-applications-table");

    // Check table headers
    await expect(desktopTable.getByText("Role & Title")).toBeVisible();
    await expect(desktopTable.getByText("Company", { exact: true })).toBeVisible();
    await expect(desktopTable.getByText("Source", { exact: true })).toBeVisible();
    await expect(desktopTable.getByText("Stage", { exact: true })).toBeVisible();
    await expect(desktopTable.getByText("Compensation", { exact: true })).toBeVisible();

    // Check seed records present
    await expect(desktopTable.getByText("Senior Product Designer")).toBeVisible();
    await expect(desktopTable.getByText("LinearFlow")).toBeVisible();
    await expect(desktopTable.getByText("Senior Frontend Engineer")).toBeVisible();
    await expect(desktopTable.getByText("CloudVanguard", { exact: true })).toBeVisible();
  });

  test("sorts applications when clicking column headers", async ({ page }) => {
    const desktopTable = page.getByTestId("desktop-applications-table");

    // Click Company column header to sort alphabetically
    const companyHeader = desktopTable.getByText("Company", { exact: true });
    await companyHeader.click();

    // After ascending sort, Apex HyperScale or CloudVanguard should be first
    const rows = desktopTable.locator("tbody tr");
    const firstRowCompany = rows.first().locator("td").nth(2);
    await expect(firstRowCompany).toContainText("Apex HyperScale");

    // Click again for descending sort
    await companyHeader.click();
    await expect(rows.first().locator("td").nth(2)).toContainText("NextWave Studio");
  });

  test("transitions stage directly from in-row stage dropdown", async ({
    page,
  }) => {
    // Target Senior Product Designer (job-1) initially at wishlist
    const stageTrigger = page.getByTestId("stage-dropdown-trigger-job-1");
    await expect(stageTrigger).toContainText("wishlist");

    // Click dropdown trigger
    await stageTrigger.click();

    // Select "Interviewing"
    const dropdownMenu = page.getByTestId("stage-dropdown-menu-job-1");
    await expect(dropdownMenu).toBeVisible();
    await dropdownMenu.getByText("Interviewing").click();

    // Verify stage pill updates
    await expect(stageTrigger).toContainText("interviewing");

    // Verify toast appears
    await expect(page.getByText("Stage Updated")).toBeVisible();

    // Switch to Pipeline Board and verify job moved to Interviewing column
    await page.getByTestId("nav-board-btn").click();
    const interviewingCol = page.getByTestId("column-interviewing");
    await expect(interviewingCol.getByText("Senior Product Designer")).toBeVisible();
  });

  test("selects multiple rows and performs batch stage transition", async ({
    page,
  }) => {
    // Select first two rows
    const checkbox1 = page.getByTestId("row-checkbox-job-1");
    const checkbox2 = page.getByTestId("row-checkbox-job-2");

    await checkbox1.click();
    await checkbox2.click();

    // Verify floating batch action dock appears
    const batchDock = page.getByTestId("batch-action-dock");
    await expect(batchDock).toBeVisible();
    await expect(batchDock).toContainText("2 roles selected");

    // Click "Move to Stage" button in batch dock
    await batchDock.getByRole("button", { name: /Move to Stage/i }).click();

    // Select "Offer Received" in batch dropdown
    const batchMenu = page.getByTestId("batch-stage-menu");
    await expect(batchMenu).toBeVisible();
    await batchMenu.getByText("Offer Received").click();

    // Verify batch toast
    await expect(page.getByText("Batch Update Complete")).toBeVisible();

    // Batch dock should dismiss after action
    await expect(batchDock).not.toBeVisible();

    // Both jobs should now be in offer stage
    await expect(page.getByTestId("stage-dropdown-trigger-job-1")).toContainText("offer");
    await expect(page.getByTestId("stage-dropdown-trigger-job-2")).toContainText("offer");
  });

  test("selects multiple rows, prompts Linear confirmation dialog, and deletes with undo capability", async ({
    page,
  }) => {
    // Select first row
    const checkbox1 = page.getByTestId("row-checkbox-job-1");
    await checkbox1.click();

    // Verify batch dock
    const batchDock = page.getByTestId("batch-action-dock");
    await expect(batchDock).toBeVisible();

    // Click Delete button in batch dock
    await page.getByTestId("batch-delete-btn").click();

    // Verify styled dialog appears (not window.confirm)
    await expect(page.getByText("Delete 1 Opportunity?")).toBeVisible();
    await expect(page.getByText("You can undo this action immediately")).toBeVisible();

    // Confirm deletion
    await page.getByTestId("confirm-batch-delete-btn").click();

    // Verify Undo toast
    const undoToast = page.getByText("1 Opportunity Removed");
    await expect(undoToast).toBeVisible();
    const undoBtn = page.getByRole("button", { name: "Undo" });
    await expect(undoBtn).toBeVisible();

    // Job 1 should be gone from table
    await expect(page.getByTestId("table-row-job-1")).not.toBeVisible();

    // Click Undo to restore
    await undoBtn.click();
    await expect(page.getByText("Opportunities Restored")).toBeVisible();
    await expect(page.getByTestId("table-row-job-1")).toBeVisible();
  });

  test("clicking a table row opens the JobDetailSheet", async ({ page }) => {
    const desktopTable = page.getByTestId("desktop-applications-table");
    // Click on the row text (not the checkbox or dropdown)
    await desktopTable.getByText("Senior Product Designer").click();

    // Detail sheet should slide in
    const sheetTitle = page.locator("#job-detail-title");
    await expect(sheetTitle).toBeVisible();
    await expect(sheetTitle).toHaveText("Senior Product Designer");

    // Verify notes timeline is accessible
    await expect(page.getByText("Personal Notes & Timeline")).toBeVisible();

    // Close sheet
    const doneBtn = page.getByRole("button", { name: "Done" });
    await doneBtn.scrollIntoViewIfNeeded();
    await doneBtn.click();
    await expect(sheetTitle).not.toBeVisible();
  });

  test("adapts to compact card list on mobile viewports", async ({ page }) => {
    // Resize viewport to mobile size
    await page.setViewportSize({ width: 375, height: 812 });

    // Desktop table should be hidden, mobile cards visible
    await expect(page.getByTestId("desktop-applications-table")).not.toBeVisible();
    const mobileCard = page.getByTestId("mobile-card-job-1");
    await expect(mobileCard).toBeVisible();
    await expect(mobileCard).toContainText("Senior Product Designer");
    await expect(mobileCard).toContainText("LinearFlow");

    // Verify mobile stage dropdown is functional
    const mobileStageTrigger = mobileCard.locator("button").filter({ hasText: /wishlist/i });
    await expect(mobileStageTrigger).toBeVisible();
  });

  test("dropdown renders in body portal and does not cause table horizontal overflow", async ({
    page,
  }) => {
    const tableContainer = page.getByTestId("desktop-applications-table");

    // Check initial scroll width difference
    const initialDiff = await tableContainer.evaluate(
      (el) => el.scrollWidth - el.clientWidth
    );

    // Open in-row dropdown
    const stageTrigger = page.getByTestId("stage-dropdown-trigger-job-1");
    await stageTrigger.click();

    const dropdownMenu = page.getByTestId("stage-dropdown-menu-job-1");
    await expect(dropdownMenu).toBeVisible();

    // Verify dropdown is NOT inside the table DOM tree
    const isInsideTable = await tableContainer.evaluate((table) => {
      return Boolean(table.querySelector('[data-testid="stage-dropdown-menu-job-1"]'));
    });
    expect(isInsideTable).toBe(false);

    // Verify opening the dropdown does not increase horizontal scroll overflow
    const openDiff = await tableContainer.evaluate(
      (el) => el.scrollWidth - el.clientWidth
    );
    expect(openDiff).toBe(initialDiff);
  });

  test("navigates table rows with J and K keys and shows focus indicator", async ({
    page,
  }) => {
    const desktopTable = page.getByTestId("desktop-applications-table");
    const rows = desktopTable.locator("tbody tr");

    // Initially first row (index 0) has focused state
    await expect(rows.nth(0)).toHaveAttribute("data-focused", "true");
    await expect(rows.nth(0).getByTestId("row-focus-indicator")).toBeVisible();
    await expect(rows.nth(1)).toHaveAttribute("data-focused", "false");

    // Press 'j' to move down to row 1
    await page.keyboard.press("j");
    await expect(rows.nth(0)).toHaveAttribute("data-focused", "false");
    await expect(rows.nth(1)).toHaveAttribute("data-focused", "true");
    await expect(rows.nth(1).getByTestId("row-focus-indicator")).toBeVisible();

    // Press 'j' again to move down to row 2
    await page.keyboard.press("j");
    await expect(rows.nth(2)).toHaveAttribute("data-focused", "true");

    // Press 'k' to move back up to row 1
    await page.keyboard.press("k");
    await expect(rows.nth(1)).toHaveAttribute("data-focused", "true");
    await expect(rows.nth(2)).toHaveAttribute("data-focused", "false");
  });

  test("toggles row selection using X or Space and opens detail sheet with Enter", async ({
    page,
  }) => {
    const desktopTable = page.getByTestId("desktop-applications-table");
    const rows = desktopTable.locator("tbody tr");

    // Row 0 is focused by default
    await expect(rows.nth(0)).toHaveAttribute("data-focused", "true");

    // Press 'x' to select row 0
    await page.keyboard.press("x");
    const batchDock = page.getByTestId("batch-action-dock");
    await expect(batchDock).toBeVisible();
    await expect(batchDock).toContainText("1 role selected");

    // Move to row 1 with 'j' and select with Space
    await page.keyboard.press("j");
    await page.keyboard.press("Space");
    await expect(batchDock).toContainText("2 roles selected");

    // Unselect row 1 with Space
    await page.keyboard.press("Space");
    await expect(batchDock).toContainText("1 role selected");

    // Press Enter to open the detail sheet for the focused row (row 1)
    await page.keyboard.press("Enter");
    const sheetTitle = page.locator("#job-detail-title");
    await expect(sheetTitle).toBeVisible();

    // Close detail sheet with Esc
    await page.keyboard.press("Escape");
    await expect(sheetTitle).not.toBeVisible();
  });
});

