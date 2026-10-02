import { test, expect } from "@playwright/test";

test.describe("Interactive Applications Table Suite", () => {
  test.beforeEach(async ({ page }) => {
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
    await expect(desktopTable.getByText("Stage", { exact: true })).toBeVisible();
    await expect(desktopTable.getByText("Compensation", { exact: true })).toBeVisible();

    // Check seed records present
    await expect(desktopTable.getByText("Senior Product Designer")).toBeVisible();
    await expect(desktopTable.getByText("LinearFlow")).toBeVisible();
    await expect(desktopTable.getByText("Senior Frontend Engineer")).toBeVisible();
    await expect(desktopTable.getByText("CloudVanguard")).toBeVisible();
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
    await page.getByRole("button", { name: "Done" }).click();
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
});
