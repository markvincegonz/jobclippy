import { test, expect } from "@playwright/test";

test.describe("Hardening & Error Safeguards Suite", () => {
  test.afterAll(async ({ request }) => {
    await request.post("http://localhost:3000/api/jobs/reset");
  });

  test("deleting a card triggers an Undo toast, and clicking Undo restores the card", async ({
    page,
  }) => {
    await page.goto("/");

    // Locate the seed card in Wishlist
    const wishlistCol = page.getByTestId("column-wishlist");
    const targetCard = wishlistCol.getByText("Senior Product Designer");
    await expect(targetCard).toBeVisible();

    // Open dropdown and delete
    const cardContainer = page.locator('[data-testid^="job-card-"]').first();
    const actionBtn = cardContainer.locator('button[aria-label="Job actions"]');
    await actionBtn.click();
    await page.getByText("Delete Job").click();

    // Verify card is removed from column
    await expect(wishlistCol.getByText("Senior Product Designer")).not.toBeVisible();

    // Verify Undo toast appears
    const undoToast = page.locator('[role="status"]').getByText("Opportunity removed");
    await expect(undoToast).toBeVisible();

    // Click Undo
    const undoBtn = page.getByRole("button", { name: "Undo" });
    await expect(undoBtn).toBeVisible();
    await undoBtn.click();

    // Verify card is restored
    await expect(wishlistCol.getByText("Senior Product Designer")).toBeVisible();
  });

  test("Detail Sheet requires explicit confirmation before deleting opportunity", async ({
    page,
  }) => {
    await page.goto("/");

    // Open seed card
    const card = page.getByText("Senior Product Designer");
    await card.click();

    // Click "Delete Opportunity"
    const deleteBtn = page.getByRole("button", { name: "Delete Opportunity" });
    await expect(deleteBtn).toBeVisible();
    await deleteBtn.click();

    // Verify confirmation prompt is displayed
    await expect(page.getByText("Delete permanently?")).toBeVisible();
    const confirmBtn = page.getByTestId("confirm-delete-opportunity-btn");
    await expect(confirmBtn).toBeVisible();

    // Cancel first
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(deleteBtn).toBeVisible();

    // Click again and confirm delete
    await deleteBtn.click();
    await confirmBtn.click();

    // Verify card is deleted and Undo toast is visible
    await expect(page.getByText("Senior Product Designer")).not.toBeVisible();
    await expect(page.locator('[role="status"]').getByText("Opportunity removed")).toBeVisible();
  });

  test("Reset Demo requires confirmation dialog before resetting data", async ({
    page,
  }) => {
    await page.goto("/");

    // Click Reset Demo
    const resetBtn = page.getByRole("button", { name: "Reset Demo" });
    await resetBtn.click();

    // Verify confirmation dialog appears
    await expect(page.getByText("Reset to Sample Pipeline?")).toBeVisible();
    await expect(page.getByText("This action will restore the 5 initial sample jobs")).toBeVisible();

    // Cancel dismissal
    const cancelBtn = page.getByRole("button", { name: "Cancel" });
    await cancelBtn.click();
    await expect(page.getByText("Reset to Sample Pipeline?")).not.toBeVisible();
  });
});
