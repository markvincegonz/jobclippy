import { test, expect } from "@playwright/test";

test.describe("Theme System — Linear Light & Dark Mode", () => {
  test.skip("toggles theme between dark canvas and light inverse canvas with visual persistence", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const toggleBtn = page.getByTestId("theme-toggle-btn");
    await expect(toggleBtn).toBeVisible({ timeout: 10000 });

    const body = page.locator("body");

    // 1. Initial dark mode verification (Linear canvas #010102 -> rgb(1, 1, 2))
    await expect(body).toHaveCSS("background-color", "rgb(1, 1, 2)");

    // 2. Toggle to Light mode
    await toggleBtn.click({ timeout: 10000 });
    await page.waitForLoadState("networkidle");

    // Verify background becomes white (Linear inverse canvas #ffffff -> rgb(255, 255, 255))
    await expect(body).toHaveCSS("background-color", "rgb(255, 255, 255)", { timeout: 10000 });

    // 3. Verify persistence across page reload
    await page.reload();
    await page.waitForLoadState("networkidle");

    await expect(body).toHaveCSS("background-color", "rgb(255, 255, 255)");

    // 4. Toggle back to Dark mode
    const toggleBtnAfterReload = page.getByTestId("theme-toggle-btn");
    await expect(toggleBtnAfterReload).toBeVisible({ timeout: 10000 });
    await toggleBtnAfterReload.click({ timeout: 10000 });
    await page.waitForLoadState("networkidle");

    await expect(body).toHaveCSS("background-color", "rgb(1, 1, 2)", { timeout: 10000 });
  });
});
