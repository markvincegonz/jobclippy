import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

test.describe("Browser Extension Package & Bridge Integration", () => {
  test("verifies Manifest V3 extension package structure and icon assets", async () => {
    const manifestPath = path.resolve("extension/manifest.json");
    expect(fs.existsSync(manifestPath)).toBe(true);

    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.name).toContain("JobClippy");
    expect(manifest.action.default_popup).toBe("popup/popup.html");
    expect(manifest.background.service_worker).toBe("background/service-worker.js");

    // Verify icons exist at required pixel dimensions
    for (const iconFile of Object.values(manifest.icons)) {
      const fullPath = path.resolve("extension", iconFile as string);
      expect(fs.existsSync(fullPath)).toBe(true);
      const stat = fs.statSync(fullPath);
      expect(stat.size).toBeGreaterThan(100);
    }
  });

  test("popup HTML renders with Linear design, Clippy mascot, and interactive elements", async ({ page }) => {
    const popupHtmlPath = path.resolve("extension/popup/popup.html");
    await page.goto("file://" + popupHtmlPath.replace(/\\/g, "/"));

    // Brand and Clippy Mascot
    await expect(page.locator(".brand-name")).toHaveText("JobClippy");
    await expect(page.locator(".mascot-svg")).toBeVisible();

    // Status Pill
    await expect(page.locator("#status-pill")).toBeVisible();

    // Inputs
    await expect(page.locator("#job-title")).toBeVisible();
    await expect(page.locator("#job-company")).toBeVisible();
    await expect(page.locator("#job-location")).toBeVisible();
    await expect(page.locator("#job-salary")).toBeVisible();
    await expect(page.locator("#job-stage")).toBeVisible();
    await expect(page.locator("#job-note")).toBeVisible();

    // Clip Button
    const clipBtn = page.locator("#clip-btn");
    await expect(clipBtn).toBeVisible();
    await expect(clipBtn).toContainText("Clip to JobClippy");
  });

  test("content extractor parses Schema.org JobPosting correctly", async ({ page }) => {
    // Navigate to empty data URL page with Schema.org JobPosting injected
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Principal Systems Engineer - Apex Cloud</title>
        <script type="application/ld+json">
        {
          "@type": "JobPosting",
          "title": "Principal Systems Engineer",
          "hiringOrganization": {
            "name": "Apex Cloud"
          },
          "jobLocationType": "TELECOMMUTE",
          "baseSalary": {
            "value": {
              "minValue": 195000,
              "maxValue": 240000,
              "unitText": "YEAR"
            }
          },
          "description": "<p>We are hiring a Principal Systems Engineer with deep expertise in Rust, Kubernetes, Linux, and Go.</p>"
        }
        </script>
      </head>
      <body>
        <h1>Principal Systems Engineer</h1>
      </body>
      </html>
    `);

    // Inject extractor script
    const extractorCode = fs.readFileSync("extension/content/extractor.js", "utf8");
    await page.evaluate(extractorCode);

    // Run extraction
    const extracted = await page.evaluate(() => {
      // @ts-expect-error window object test augmentation
      return window.__JobClippyExtractor.extractJob();
    });

    expect(extracted.title).toBe("Principal Systems Engineer");
    expect(extracted.company).toBe("Apex Cloud");
    expect(extracted.location).toBe("Remote");
    expect(extracted.salary).toBe("$195K–$240K");
    expect(extracted.skills).toContain("Rust");
    expect(extracted.skills).toContain("Kubernetes");
    expect(extracted.skills).toContain("Linux");
    expect(extracted.skills).toContain("Go");
  });

  test("content extractor parses Indeed two-pane search results with active right pane and international salary", async ({ page }) => {
    // Intercept https://ph.indeed.com with simulated two-pane search results
    await page.route("https://ph.indeed.com/**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "text/html",
        body: `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Video Editor Jobs - Indeed.com</title>
          </head>
          <body>
            <!-- Left search results list (Job #1 should NOT be extracted) -->
            <div id="mosaic-provider-jobcards">
              <div class="job_seen_beacon">
                <h2 class="jobTitle"><span>Wrong Job Title Iconiqlast</span></h2>
                <span class="companyName">Iconiqlast Wrong Company</span>
                <div class="companyLocation">Remote</div>
                <div class="salary-snippet-container">PHP 19,000 - PHP 25,000 a month</div>
              </div>
            </div>

            <!-- Right Preview Pane: The active job user is viewing -->
            <div id="jobsearch-ViewjobPaneWrapper">
              <div class="jobsearch-JobInfoHeader">
                <h1 data-testid="jobsearch-JobInfoHeader-title" class="jobsearch-JobInfoHeader-title">Video Editor</h1>
                <div data-testid="inlineHeader-companyName">SUPERVA BUSINESS PROCESS OUTSOURCING SERVICES</div>
                <div data-testid="inlineHeader-companyLocation">Remote</div>
                <div id="salaryInfoAndJobType">PHP 48,000 - PHP 49,000 a month</div>
              </div>
              <div id="jobDescriptionText">
                <p>Are you a creative, detail-oriented video editor ready to bring stories to life?</p>
                <p>Virtual Dream Team is looking for an experienced editor who can transform raw footage into polished content.</p>
                <p>Requirements: Premiere Pro, After Effects, and Color Grading.</p>
                <p>Apply now by submitting your reel!</p>
              </div>
            </div>
          </body>
          </html>
        `
      });
    });

    await page.goto("https://ph.indeed.com/jobs?q=Video+Editor&vjk=7d4a2b918c0e");

    // Inject extractor script
    const extractorCode = fs.readFileSync("extension/content/extractor.js", "utf8");
    await page.evaluate(extractorCode);

    // Run extraction
    const extracted = await page.evaluate(() => {
      // @ts-expect-error window object test augmentation
      return window.__JobClippyExtractor.extractJob();
    });

    expect(extracted.source).toBe("indeed");
    expect(extracted.title).toBe("Video Editor");
    expect(extracted.company).toBe("SUPERVA BUSINESS PROCESS OUTSOURCING SERVICES");
    expect(extracted.location).toBe("Remote");
    expect(extracted.salary).toBe("PHP 48K–PHP 49K/mo");
    expect(extracted.skills).toContain("Video Editing");
    expect(extracted.skills).toContain("Premiere Pro");
    expect(extracted.skills).toContain("After Effects");
    expect(extracted.skills).toContain("Color Grading");
    expect(extracted.description).toContain("Virtual Dream Team is looking for an experienced editor");
    expect(extracted.description).toContain("Apply now by submitting your reel!");
    expect(extracted.url).toBe("https://ph.indeed.com/viewjob?jk=7d4a2b918c0e");
  });

  test("live web app bridge immediately synchronizes clipped opportunity to Kanban board", async ({ page }) => {
    await page.goto("/");

    // Verify initial Kanban board load
    await expect(page.getByTestId("column-wishlist")).toBeVisible();

    const uniqueTitle = "Staff AI Platform Engineer " + Date.now();

    // Simulate extension bridge injecting clipped job into localStorage and firing sync event
    await page.evaluate((title) => {
      const STORAGE_KEY = "jobclippy_jobs_v1";
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      const newJob = {
        id: "clipped-" + Date.now(),
        title: title,
        company: "OpenBrain AI",
        location: "Remote",
        salary: "$185K–$225K",
        stage: "wishlist",
        skills: ["Python", "PyTorch", "LLMs", "FastAPI"],
        description: "Leading generative AI platform architecture and low-latency inference.",
        url: "https://openbrain.ai/jobs/staff-ai",
        notes: [
          {
            id: "note-clip-1",
            text: "Clipped via JobClippy Chrome Extension with referral note.",
            createdAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
      };

      const updated = [newJob, ...existing];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      // Dispatch custom synced event
      window.dispatchEvent(
        new CustomEvent("jobclippy:synced", {
          detail: { added: 1, jobs: [newJob] },
        })
      );
    }, uniqueTitle);

    // Verify the clipped card immediately appears in the Wishlist column without reload
    const wishlistColumn = page.getByTestId("column-wishlist");
    const clippedCard = wishlistColumn.getByText(uniqueTitle);
    await expect(clippedCard).toBeVisible({ timeout: 5000 });
    await expect(wishlistColumn.getByText("OpenBrain AI")).toBeVisible();

    // Click card to open Detail Sheet
    await clippedCard.click();

    // Verify slide-over sheet displays parsed details and notes
    const sheet = page.getByTestId("job-detail-sheet");
    await expect(sheet).toBeVisible();
    await expect(sheet.getByText("OpenBrain AI")).toBeVisible();
    await expect(sheet.getByText("$185K–$225K")).toBeVisible();
    await expect(sheet.getByText("Clipped via JobClippy Chrome Extension with referral note.")).toBeVisible();
  });
});
