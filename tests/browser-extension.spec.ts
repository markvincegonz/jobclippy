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

    // Inputs: Stage and Note are present, pregathered inputs are removed
    await expect(page.locator("#job-stage")).toBeVisible();
    await expect(page.locator("#job-note")).toBeVisible();
    await expect(page.locator("#job-title")).toHaveCount(0);
    await expect(page.locator("#job-company")).toHaveCount(0);
    await expect(page.locator("#job-location")).toHaveCount(0);
    await expect(page.locator("#job-salary")).toHaveCount(0);

    // Clip Button: Clean typography without casual emojis
    const clipBtn = page.locator("#clip-btn");
    await expect(clipBtn).toBeVisible();
    await expect(clipBtn).toHaveText("Clip to JobClippy");
    const clipText = await clipBtn.innerText();
    expect(clipText).not.toMatch(/[⚡✨🏢📍💰]/);
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

  test("content extractor targets active vjk on Indeed recommendation feed and prevents Job Search title fallback", async ({ page }) => {
    // Intercept indeed.com with simulated homepage recommendation feed
    await page.route("https://www.indeed.com/**", (route) => {
      const url = route.request().url();
      if (url.includes("/viewjob?jk=a9fb756783b8d1a4")) {
        route.fulfill({
          status: 200,
          contentType: "text/html",
          body: `
            <!DOCTYPE html>
            <html>
            <head><title>Senior Frontend Engineer - Apex Corp | Indeed.com</title></head>
            <body>
              <h1 class="jobsearch-JobInfoHeader-title" data-testid="jobsearch-JobInfoHeader-title">Senior Frontend Engineer</h1>
              <div data-testid="inlineHeader-companyName">Apex Corp</div>
              <div data-testid="inlineHeader-companyLocation">San Francisco, CA</div>
              <div id="salaryInfoAndJobType">$140,000 - $170,000 a year</div>
              <div id="jobDescriptionText">
                <p>Apex Corp is looking for a Senior Frontend Engineer to build web applications using React, Next.js, and TypeScript.</p>
              </div>
            </body>
            </html>
          `
        });
        return;
      }

      route.fulfill({
        status: 200,
        contentType: "text/html",
        body: `
          <!DOCTYPE html>
          <html>
          <head>
            <!-- Generic page title that should NEVER be used as the job title -->
            <title>Job Search | Indeed</title>
          </head>
          <body>
            <!-- Card 1: Top recommendation (not clicked) -->
            <div class="job_seen_beacon" data-jk="wrong_top_job_1">
              <h2 class="jobTitle"><span>Junior Graphic Designer</span></h2>
              <span class="companyName">Wrong Graphic Design Studio</span>
            </div>

            <!-- Card 2: The clicked opportunity with matching data-jk -->
            <div class="job_seen_beacon" data-jk="a9fb756783b8d1a4">
              <h2 class="jobTitle"><span>Senior Frontend Engineer</span></h2>
              <span data-testid="company-name">Apex Corp</span>
              <div data-testid="text-location">San Francisco, CA</div>
              <div class="salary-snippet-container">$140,000 - $170,000 a year</div>
            </div>
          </body>
          </html>
        `
      });
    });

    await page.goto("https://www.indeed.com/?from=gnav-compui&vjk=a9fb756783b8d1a4");

    // Inject extractor script
    const extractorCode = fs.readFileSync("extension/content/extractor.js", "utf8");
    await page.evaluate(extractorCode);

    // Run extraction
    const extracted = await page.evaluate(async () => {
      // @ts-expect-error window object test augmentation
      return await window.__JobClippyExtractor.extractJob();
    });

    expect(extracted.source).toBe("indeed");
    expect(extracted.title).toBe("Senior Frontend Engineer");
    expect(extracted.title).not.toBe("Job Search");
    expect(extracted.company).toBe("Apex Corp");
    expect(extracted.location).toBe("San Francisco, CA");
    expect(extracted.url).toBe("https://www.indeed.com/viewjob?jk=a9fb756783b8d1a4");
    expect(extracted.skills).toContain("React");
    expect(extracted.skills).toContain("TypeScript");
    expect(extracted.description).toContain("Apex Corp is looking for a Senior Frontend Engineer");
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

  test("content extractor parses JobStreet two-pane search view and resolves canonical /job/{jobId}", async ({ page }) => {
    await page.route("https://ph.jobstreet.com/**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "text/html",
        body: `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Search Jobs in Philippines | JobStreet</title>
          </head>
          <body>
            <!-- Left search cards list -->
            <div data-automation="searchResults">
              <article data-automation="job-card" data-job-id="wrong-99999999">
                <h3 data-automation="jobTitle">Customer Support Representative</h3>
                <span data-automation="advertiser-name">Unrelated BPO Inc</span>
              </article>
            </div>

            <!-- Right Detail Pane (Active Job) -->
            <div data-automation="jobDetails">
              <h1 data-automation="job-detail-title">Lead Full Stack Developer</h1>
              <span data-automation="advertiser-name">Tech Solutions Asia</span>
              <span data-automation="job-detail-location">Taguig, Metro Manila</span>
              <span data-automation="job-detail-salary">PHP 120,000 - PHP 160,000 per month</span>
              <div data-automation="jobAdDetails">
                <p>We are seeking an experienced Lead Full Stack Developer to drive cloud architecture.</p>
                <p>Core Requirements: React, TypeScript, Next.js, Node.js, and PostgreSQL.</p>
                <p>Great benefits and flexible remote arrangement.</p>
              </div>
            </div>
          </body>
          </html>
        `
      });
    });

    await page.goto("https://ph.jobstreet.com/web-jobs?jobId=95014441&type=standard");

    const extractorCode = fs.readFileSync("extension/content/extractor.js", "utf8");
    await page.evaluate(extractorCode);

    const extracted = await page.evaluate(async () => {
      // @ts-expect-error window object test augmentation
      return await window.__JobClippyExtractor.extractJob();
    });

    expect(extracted.source).toBe("jobstreet");
    expect(extracted.title).toBe("Lead Full Stack Developer");
    expect(extracted.company).toBe("Tech Solutions Asia");
    expect(extracted.location).toBe("Taguig, Metro Manila");
    expect(extracted.salary).toBe("PHP 120K–PHP 160K/mo");
    expect(extracted.skills).toContain("React");
    expect(extracted.skills).toContain("TypeScript");
    expect(extracted.skills).toContain("Next.js");
    expect(extracted.skills).toContain("Node.js");
    expect(extracted.skills).toContain("PostgreSQL");
    expect(extracted.description).toContain("We are seeking an experienced Lead Full Stack Developer");
    expect(extracted.url).toBe("https://ph.jobstreet.com/job/95014441");
  });

  test("content extractor parses JobStreet standalone detail view", async ({ page }) => {
    await page.route("https://ph.jobstreet.com/**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "text/html",
        body: `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Senior DevOps Engineer - CloudScale | JobStreet</title>
          </head>
          <body>
            <main data-automation="job-details-page">
              <h1 data-automation="job-detail-title">Senior DevOps Engineer</h1>
              <a data-automation="advertiser-name">CloudScale Global</a>
              <span data-automation="job-detail-location">Cebu City, Philippines</span>
              <span data-automation="job-detail-salary">PHP 150,000 - PHP 190,000 per month</span>
              <div data-automation="jobAdDetails">
                <p>Join CloudScale Global managing cloud infrastructure.</p>
                <p>Required expertise in AWS, Docker, Kubernetes, Terraform, and Linux.</p>
              </div>
            </main>
          </body>
          </html>
        `
      });
    });

    await page.goto("https://ph.jobstreet.com/job/95014441?ref=search-standalone&type=standard&origin=jobTitle#sol=de4f0854592042b55b6f3745ed4259d3499d5552");

    const extractorCode = fs.readFileSync("extension/content/extractor.js", "utf8");
    await page.evaluate(extractorCode);

    const extracted = await page.evaluate(async () => {
      // @ts-expect-error window object test augmentation
      return await window.__JobClippyExtractor.extractJob();
    });

    expect(extracted.source).toBe("jobstreet");
    expect(extracted.title).toBe("Senior DevOps Engineer");
    expect(extracted.company).toBe("CloudScale Global");
    expect(extracted.location).toBe("Cebu City, Philippines");
    expect(extracted.salary).toBe("PHP 150K–PHP 190K/mo");
    expect(extracted.skills).toContain("AWS");
    expect(extracted.skills).toContain("Docker");
    expect(extracted.skills).toContain("Kubernetes");
    expect(extracted.skills).toContain("Linux");
    expect(extracted.url).toBe("https://ph.jobstreet.com/job/95014441");
  });

  test("universal semantic reading pane scorer isolates active job pane on arbitrary multi-column layouts", async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Careers Portal - Multi-column View</title>
      </head>
      <body>
        <div class="layout-container" style="display: flex;">
          <!-- Left Search Results Sidebar: List of cards to discard -->
          <aside class="sidebar-results" style="width: 300px;">
            <ul>
              <li class="card">
                <span>Job 1: Junior QA Tester at Beta Labs</span>
              </li>
              <li class="card">
                <span>Job 2: Product Manager at Delta Fin</span>
              </li>
              <li class="card">
                <span>Job 3: Technical Recruiter at Talent HR</span>
              </li>
              <li class="card">
                <span>Job 4: Sales Operations at Growth Ltd</span>
              </li>
            </ul>
          </aside>

          <!-- Right Active Reading Pane: Target ID eng-808 -->
          <main class="reading-pane-content" data-job-id="eng-808" style="flex: 1; padding: 20px;">
            <h1>Senior Distributed Systems Architect</h1>
            <div class="company-badge">Nexus HyperScale Systems</div>
            <div class="job-meta">Location: Remote | Salary: $190,000 - $230,000 a year</div>
            <div class="job-body">
              <h3>Role Overview & Responsibilities</h3>
              <p>We are looking for a Senior Distributed Systems Architect to design high-throughput consensus protocols.</p>
              <p>Requirements include extensive experience with Go, Rust, System Design, and Kubernetes.</p>
              <p>Competitive benefits and equity package included. Apply now!</p>
            </div>
          </main>
        </div>
      </body>
      </html>
    `);

    const extractorCode = fs.readFileSync("extension/content/extractor.js", "utf8");
    await page.evaluate(extractorCode);

    const extracted = await page.evaluate(async () => {
      // @ts-expect-error window object test augmentation
      return await window.__JobClippyExtractor.extractJob();
    });

    expect(extracted.source).toBe("generic");
    expect(extracted.title).toBe("Senior Distributed Systems Architect");
    expect(extracted.company).toBe("Nexus HyperScale Systems");
    expect(extracted.salary).toBe("$190K–$230K");
    expect(extracted.skills).toContain("Go");
    expect(extracted.skills).toContain("Rust");
    expect(extracted.skills).toContain("Kubernetes");
    expect(extracted.skills).toContain("System Design");
    expect(extracted.description).toContain("Senior Distributed Systems Architect to design high-throughput");
    // Verify sidebar search cards are NOT polluting the description
    expect(extracted.description).not.toContain("Junior QA Tester");
    expect(extracted.description).not.toContain("Product Manager at Delta Fin");
  });
});

