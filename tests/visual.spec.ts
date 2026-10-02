import { test, expect } from "@playwright/test";

test.describe("Linear Design System Visual & Computed Token Assertions", () => {
  test("verifies exact color tokens, hairline borders, and surface ladder", async ({ page }) => {
    await page.goto("/");

    const body = page.locator("body");
    const toggleBtn = page.getByTestId("theme-toggle-btn");
    const saveJobBtn = page.getByTestId("quick-add-btn");
    const firstCard = page.locator('[data-testid^="job-card-"]').first();

    // 1. Font Family Verification (Inter / SF Pro Display fallback stack)
    const fontFamily = await body.evaluate((el) => window.getComputedStyle(el).fontFamily);
    expect(fontFamily.toLowerCase()).toMatch(/inter|sf pro display|-apple-system|system-ui|segoe ui|roboto/i);

    // 2. Dark Mode Token Verifications
    const darkBodyBg = await body.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(darkBodyBg).toBe("rgb(1, 1, 2)"); // #010102

    const darkCardBg = await firstCard.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(darkCardBg).toBe("rgb(15, 16, 21)"); // #0f1015 (surface-1)

    const darkCardBorder = await firstCard.evaluate((el) => window.getComputedStyle(el).borderColor);
    expect(darkCardBorder).toBe("rgb(35, 37, 42)"); // #23252a (hairline)

    const primaryBtnBg = await saveJobBtn.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(primaryBtnBg).toBe("rgb(94, 106, 210)"); // #5e6ad2 (primary lavender)

    // 3. Switch to Light Mode and verify Inverse Token Verifications
    await toggleBtn.click();
    await page.waitForTimeout(300);

    const lightBodyBg = await body.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(lightBodyBg).toBe("rgb(255, 255, 255)"); // #ffffff (inverse canvas)

    const lightCardBg = await firstCard.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(lightCardBg).toBe("rgb(247, 248, 248)"); // #f7f8f8 (inverse surface-1)

    const lightCardBorder = await firstCard.evaluate((el) => window.getComputedStyle(el).borderColor);
    expect(lightCardBorder).toBe("rgb(226, 228, 232)"); // #e2e4e8 (inverse hairline)

    // 4. Switch back to Dark Mode
    await toggleBtn.click();
    await page.waitForTimeout(300);
    const restoredDarkBg = await body.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(restoredDarkBg).toBe("rgb(1, 1, 2)");
  });
});
