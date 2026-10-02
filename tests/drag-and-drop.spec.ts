import { test, expect } from "@playwright/test";

test.describe("Kanban Drag-and-Drop & Accessible Spatial Navigation", () => {
  test("advances card stage via keyboard shortcut ']' and returns via '['", async ({
    page,
  }) => {
    await page.goto("/");

    const wishlistCol = page.getByTestId("column-wishlist");
    const appliedCol = page.getByTestId("column-applied");

    const card = wishlistCol.locator('[data-testid^="job-card-"]').first();
    await expect(card).toBeVisible();

    // Focus the card container
    await card.focus();

    // Press ']' to advance to next stage (Applied)
    await page.keyboard.press("]");

    // Verify card moved to Applied column
    await expect(appliedCol.getByText("Senior Product Designer")).toBeVisible();
    await expect(wishlistCol.getByText("Senior Product Designer")).not.toBeVisible();

    // Press '[' to move back to Wishlist
    const appliedCard = appliedCol.locator('[data-testid^="job-card-"]').first();
    await appliedCard.focus();
    await page.keyboard.press("[");

    // Verify card is back in Wishlist
    await expect(wishlistCol.getByText("Senior Product Designer")).toBeVisible();
  });

  test("drags card between columns using HTML5 drag and drop", async ({ page }) => {
    await page.goto("/");

    const wishlistCol = page.getByTestId("column-wishlist");
    const offerCol = page.getByTestId("column-offer");

    const card = wishlistCol.getByText("Senior Product Designer");
    await expect(card).toBeVisible();

    // Perform dragTo from Wishlist to Offer column
    await card.dragTo(offerCol);

    // Verify card is now in Offer column
    await expect(offerCol.getByText("Senior Product Designer")).toBeVisible();
    await expect(wishlistCol.getByText("Senior Product Designer")).not.toBeVisible();

    // Verify milestone celebration toast notification appeared
    await expect(page.locator('[role="status"]').getByText(/Offer Received/i)).toBeVisible();

    // Verify confetti canvas was activated on drop
    const confetti = page.locator('[data-testid="confetti-canvas"]');
    await expect(confetti).toBeAttached();
  });

  test("does not show confetti on hover or drag in-and-out, only on drop", async ({ page }) => {
    await page.goto("/");

    const wishlistCol = page.getByTestId("column-wishlist");
    const interviewingCol = page.getByTestId("column-interviewing");
    const confetti = page.locator('[data-testid="confetti-canvas"]');

    // Confetti should not be active initially
    await expect(confetti).not.toBeAttached();

    // Drag over interviewing column and leave
    const card = wishlistCol.getByText("Senior Product Designer");
    await card.hover();
    await page.mouse.down();
    await interviewingCol.hover();

    // Still no confetti while hovering/holding
    await expect(confetti).not.toBeAttached();

    await wishlistCol.hover();
    await page.mouse.up();

    // Still no confetti after cancel/release in original
    await expect(confetti).not.toBeAttached();
  });
});

