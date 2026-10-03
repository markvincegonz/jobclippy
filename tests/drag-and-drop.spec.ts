import { test, expect } from "@playwright/test";

test.describe("Kanban Drag-and-Drop & Accessible Spatial Navigation", () => {
  test.beforeEach(async ({ request }) => {
    await request.post("/api/jobs/reset");
  });

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

  test("sorts job items in the same column by dragging bottom to top", async ({
    page,
    request,
  }) => {
    await request.post("/api/jobs/reset");
    await page.goto("/board");

    const wishlistCol = page.getByTestId("column-wishlist");
    const appliedCol = page.getByTestId("column-applied");

    // Move job-2 into wishlist first so wishlist has 2 jobs
    const appliedCard = appliedCol.getByText("Senior Frontend Engineer");
    await appliedCard.dragTo(wishlistCol);

    // Now wishlist has 2 cards: Senior Product Designer (top), Senior Frontend Engineer (bottom)
    const cards = wishlistCol.locator('[data-testid^="job-card-"]');
    await expect(cards).toHaveCount(2);
    await expect(cards.nth(0)).toContainText("Senior Product Designer");
    await expect(cards.nth(1)).toContainText("Senior Frontend Engineer");

    // Drag bottom card (Senior Frontend Engineer) to the top card (Senior Product Designer)
    const bottomCard = cards.nth(1);
    const topCard = cards.nth(0);

    const topBox = await topCard.boundingBox();
    expect(topBox).not.toBeNull();

    // Drag over the top half of topCard to trigger insertion before it
    await bottomCard.hover();
    await page.mouse.down();
    await page.mouse.move(topBox!.x + topBox!.width / 2, topBox!.y + 10);
    await page.mouse.up();

    // Verify order reversed in wishlist column: Senior Frontend Engineer is now first
    await expect(cards.nth(0)).toContainText("Senior Frontend Engineer");
    await expect(cards.nth(1)).toContainText("Senior Product Designer");
    await expect(page.getByText("Order updated")).toBeVisible();
  });

  test("card hover quick actions: 1-click stage advancement", async ({ page, request }) => {
    await request.post("/api/jobs/reset");
    await page.goto("/board");

    const wishlistCol = page.getByTestId("column-wishlist");
    const appliedCol = page.getByTestId("column-applied");

    // job-1 is in wishlist initially
    await expect(wishlistCol.getByText("Senior Product Designer")).toBeVisible();

    // Hover job-1 card to reveal action strip
    const job1Card = page.getByTestId("job-card-job-1");
    await job1Card.hover();

    const advanceBtn = page.getByTestId("quick-advance-btn-job-1");
    await expect(advanceBtn).toBeVisible();

    // Click quick advance (wishlist -> applied)
    await advanceBtn.click();

    // Card should now be in applied column
    await expect(wishlistCol.getByText("Senior Product Designer")).not.toBeVisible();
    await expect(appliedCol.getByText("Senior Product Designer")).toBeVisible();
    await expect(page.getByText("Stage updated")).toBeVisible();
  });

  test("card hover quick actions: inline quick note editor and direct link", async ({ page, request }) => {
    await request.post("/api/jobs/reset");
    await page.goto("/board");

    const job1Card = page.getByTestId("job-card-job-1");
    await job1Card.hover();

    // 1. Verify direct link button
    const linkBtn = page.getByTestId("quick-link-btn-job-1");
    await expect(linkBtn).toBeVisible();
    await expect(linkBtn).toHaveAttribute("target", "_blank");
    await expect(linkBtn).toHaveAttribute("href", /linkedin\.com/);

    // 2. Open inline quick note editor
    const noteBtn = page.getByTestId("quick-note-btn-job-1");
    await noteBtn.click();

    const noteInput = page.getByTestId("quick-note-input-job-1");
    await expect(noteInput).toBeVisible();
    await expect(noteInput).toBeFocused();

    // Type note and press Enter
    await noteInput.fill("Met lead designer at UX conference");
    await page.keyboard.press("Enter");

    // Toast confirms save
    await expect(page.getByText("Note Added")).toBeVisible();
    await expect(noteInput).not.toBeVisible();

    // Click card to open detail sheet and verify note exists
    await job1Card.click();
    await expect(page.getByText("Met lead designer at UX conference")).toBeVisible();
  });

  test("advancing to offer by clicking advance button triggers confetti and celebratory milestone toast", async ({
    page,
    request,
  }) => {
    await request.post("/api/jobs/reset");
    await page.goto("/board");

    const interviewingCol = page.getByTestId("column-interviewing");
    const offerCol = page.getByTestId("column-offer");
    const confetti = page.locator('[data-testid="confetti-canvas"]');

    // Confetti not active initially
    await expect(confetti).not.toBeAttached();

    // job-3 (Fullstack Platform Engineer at DataPulse AI) is in interviewing initially
    const job3Card = page.getByTestId("job-card-job-3");
    await expect(job3Card).toBeVisible();
    await expect(interviewingCol.getByText("Fullstack Platform Engineer")).toBeVisible();

    // Hover card to reveal quick advance button
    await job3Card.hover();
    const advanceBtn = page.getByTestId("quick-advance-btn-job-3");
    await expect(advanceBtn).toBeVisible();
    await expect(advanceBtn).toHaveAttribute("title", "Advance to Offer");

    // Click advance button (interviewing -> offer)
    await advanceBtn.click();

    // Verify card moved to Offer column
    await expect(interviewingCol.getByText("Fullstack Platform Engineer")).not.toBeVisible();
    await expect(offerCol.getByText("Fullstack Platform Engineer")).toBeVisible();

    // Confetti canvas must be attached and active
    await expect(confetti).toBeAttached();

    // Celebratory milestone toast must be visible with exact copy
    await expect(page.getByText("🎉 Huge Milestone: Offer Received!")).toBeVisible();
    await expect(
      page.getByText("Congratulations on Fullstack Platform Engineer at DataPulse AI!")
    ).toBeVisible();
  });
});



