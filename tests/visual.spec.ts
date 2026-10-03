import { test, expect } from "@playwright/test";

test.describe("Linear Design System Visual & Computed Token Assertions", () => {
  test.skip("verifies exact color tokens, hairline borders, and surface ladder", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const body = page.locator("body");
    const toggleBtn = page.getByTestId("theme-toggle-btn");
    await expect(toggleBtn).toBeVisible({ timeout: 10000 });
    const saveJobBtn = page.getByTestId("quick-add-btn");
    const firstCard = page.locator('[data-testid^="job-card-"]').first();

    // 1. Font Family Verification (Inter / SF Pro Display fallback stack)
    const fontFamily = await body.evaluate((el) => window.getComputedStyle(el).fontFamily);
    expect(fontFamily.toLowerCase()).toMatch(/inter|sf pro display|-apple-system|system-ui|segoe ui|roboto/i);

    // 2. Dark Mode Token Verifications
    await expect(body).toHaveCSS("background-color", "rgb(1, 1, 2)"); // #010102
    await expect(firstCard).toHaveCSS("background-color", "rgb(15, 16, 21)"); // #0f1015 (surface-1)
    await expect(firstCard).toHaveCSS("border-color", "rgb(35, 37, 42)"); // #23252a (hairline)
    await expect(saveJobBtn).toHaveCSS("background-color", "rgb(94, 106, 210)"); // #5e6ad2 (primary lavender)

    // 3. Switch to Light Mode and verify Inverse Token Verifications
    await toggleBtn.click({ timeout: 10000 });
    await page.waitForLoadState("networkidle");

    await expect(body).toHaveCSS("background-color", "rgb(255, 255, 255)", { timeout: 10000 }); // #ffffff (inverse canvas)
    await expect(firstCard).toHaveCSS("background-color", "rgb(247, 248, 248)"); // #f7f8f8 (inverse surface-1)
    await expect(firstCard).toHaveCSS("border-color", "rgb(226, 228, 232)"); // #e2e4e8 (inverse hairline)

    // 4. Switch back to Dark Mode
    await toggleBtn.click({ timeout: 10000 });
    await page.waitForLoadState("networkidle");

    await expect(body).toHaveCSS("background-color", "rgb(1, 1, 2)", { timeout: 10000 });
  });
});
