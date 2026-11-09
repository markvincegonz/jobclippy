import { chromium } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

async function capture() {
  const outputDir = path.resolve(process.cwd(), "docs/screenshots");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: "dark",
  });

  const page = await context.newPage();

  console.log("1. Capturing Kanban Pipeline Board...");
  await page.goto("http://localhost:3000/board");
  await page.waitForLoadState("networkidle");
  await page.waitForSelector('[data-testid="column-wishlist"]');
  // Small pause for smooth animations to finish
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outputDir, "pipeline-board.png") });

  console.log("2. Capturing Job Detail Slide-Over Sheet...");
  const firstCard = page.locator('[data-testid^="job-card-"]').first();
  if (await firstCard.isVisible()) {
    await firstCard.click();
    await page.waitForSelector('[data-testid="job-detail-sheet"]');
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(outputDir, "job-detail-sheet.png") });
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);
  }

  console.log("3. Capturing Command Palette (⌘K)...");
  await page.keyboard.press("Control+k");
  await page.waitForTimeout(400);
  const palette = page.locator('[role="dialog"]');
  if (await palette.isVisible()) {
    await page.screenshot({ path: path.join(outputDir, "command-palette.png") });
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);
  }

  console.log("4. Capturing Applications Table...");
  await page.goto("http://localhost:3000/applications");
  await page.waitForLoadState("networkidle");
  await page.waitForSelector("table tbody tr");
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outputDir, "applications-table.png") });

  console.log("5. Capturing Pipeline Velocity & Funnel Analytics...");
  await page.goto("http://localhost:3000/analytics");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outputDir, "funnel-analytics.png") });

  console.log("Screenshots captured successfully in docs/screenshots/!");
  await browser.close();
}

capture().catch((err) => {
  console.error("Screenshot capture failed:", err);
  process.exit(1);
});
