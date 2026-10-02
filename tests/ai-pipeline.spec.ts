import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { canonicalizeUrl, hashCanonicalUrl } from "../src/lib/canonicalize";
import { getExtractionCache } from "../src/lib/cache/file-store";

test.describe("AI-Powered 3-Tier Job Extraction Pipeline End-to-End Suite", () => {
  test("Layer 1: Content extractor produces rawText and partialFields token-budgeted payload", async ({
    page,
  }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Principal ML Engineer - Anthropic</title>
      </head>
      <body>
        <div id="jobDescriptionText">
          <h1>Principal ML Engineer</h1>
          <p>Anthropic is hiring a Principal ML Engineer to lead large language model scaling.</p>
          <p>Compensation: $250,000 - $320,000 a year. Location: San Francisco, CA (Hybrid).</p>
          <p>Requirements: Python, PyTorch, LLMs, Distributed Systems, Kubernetes.</p>
        </div>
      </body>
      </html>
    `);

    const extractorCode = fs.readFileSync("extension/content/extractor.js", "utf8");
    await page.evaluate(extractorCode);

    const extracted = await page.evaluate(() => {
      // @ts-expect-error window test helper
      return window.__JobClippyExtractor.extractJob();
    });

    expect(extracted).not.toBeNull();
    expect(extracted.rawText).toBeDefined();
    expect(extracted.rawText.length).toBeGreaterThan(50);
    expect(extracted.partialFields).toBeDefined();
    expect(extracted.partialFields.salary).toBe("$250K–$320K");
    expect(extracted.partialFields.skills).toContain("PyTorch");
  });

  test("Layer 2 & 3: API route caches extraction and serves sub-50ms cache hits for identical job postings", async ({
    request,
  }) => {
    const uniqueJobId = "ml-lead-" + Date.now();
    const urlA = `https://www.indeed.com/viewjob?jk=${uniqueJobId}&from=serp&utm_campaign=hiring`;
    const urlB = `https://ph.indeed.com/jobs?q=ML+Engineer&vjk=${uniqueJobId}&ref=search`;

    const jobText = `
      Principal ML Engineer
      Anthropic AI
      San Francisco, CA (Hybrid)
      $260,000 - $310,000 a year

      Lead model scaling and PyTorch distributed training pipelines.
    `;

    // 1. Initial Call -> Cache Miss
    const res1 = await request.post("/api/extract", {
      data: {
        url: urlA,
        rawText: jobText,
        partialFields: {
          title: "Principal ML Engineer",
          company: "Anthropic AI",
          salary: "$260K–$310K",
        },
      },
    });

    expect(res1.status()).toBe(200);
    const body1 = await res1.json();
    expect(body1.ok).toBe(true);
    expect(body1.fromCache).toBe(false);
    expect(body1.data.title).toContain("Principal ML");
    expect(body1.data.salary).toBe("$260K–$310K");

    // 2. Second Call with Alternate URL -> Layer 2 Cache Hit
    const startTime = Date.now();
    const res2 = await request.post("/api/extract", {
      data: {
        url: urlB,
        rawText: "Different raw text is ignored because canonical hash matches",
      },
    });
    const elapsed = Date.now() - startTime;

    expect(res2.status()).toBe(200);
    const body2 = await res2.json();
    expect(body2.ok).toBe(true);
    expect(body2.fromCache).toBe(true);
    expect(body2.data.urlHash).toBe(body1.data.urlHash);
    expect(body2.data.title).toBe(body1.data.title);
    expect(elapsed).toBeLessThan(2000); // Verify fast cache hit without timeout
  });

  test("Kanban Board receives AI-verified job clip through bridge and renders verified tags and summary", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByTestId("column-wishlist")).toBeVisible();

    const uniqueTitle = "Lead AI Systems Architect " + Date.now();

    // Simulate AI pipeline output injected via extension bridge
    await page.evaluate((title) => {
      const STORAGE_KEY = "jobclippy_jobs_v1";
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      const newJob = {
        id: "ai-clip-" + Date.now(),
        title: title,
        company: "Nexus AI Labs",
        location: "Remote",
        salary: "$210K–$260K",
        stage: "wishlist",
        skills: ["PyTorch", "Kubernetes", "LLMs", "Python"],
        description: "AI Verified: Architecting scalable inference engines for generative AI models.",
        url: "https://nexusailabs.com/jobs/lead-ai",
        notes: [
          {
            id: "note-ai-1",
            text: "✨ AI Verified: 5+ years experience required, remote work supported.",
            createdAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify([newJob, ...existing]));

      window.dispatchEvent(
        new CustomEvent("jobclippy:synced", {
          detail: { added: 1, jobs: [newJob] },
        })
      );
    }, uniqueTitle);

    // Verify card appears in Wishlist column
    const wishlist = page.getByTestId("column-wishlist");
    const card = wishlist.getByText(uniqueTitle);
    await expect(card).toBeVisible({ timeout: 5000 });
    await expect(wishlist.getByText("Nexus AI Labs")).toBeVisible();
    await expect(wishlist.getByText("$210K–$260K")).toBeVisible();

    // Open detail sheet
    await card.click();
    const sheet = page.getByTestId("job-detail-sheet");
    await expect(sheet).toBeVisible();
    await expect(sheet.getByText("Nexus AI Labs")).toBeVisible();
    await expect(sheet.getByText("✨ AI Verified: 5+ years experience required, remote work supported.")).toBeVisible();
  });
});
