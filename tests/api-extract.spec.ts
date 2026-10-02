import { test, expect } from "@playwright/test";

test.describe("Layer 3: /api/extract Server Endpoint & Caching Integration", () => {
  test("returns 400 when rawText and url are missing", async ({ request }) => {
    const res = await request.post("/api/extract", {
      data: {},
    });
    expect(res.status()).toBe(400);
    const json = await res.json();
    expect(json.ok).toBe(false);
  });

  test("processes job text via heuristic fallback, saves to cache, and hits cache on second call", async ({
    request,
  }) => {
    const testId = Date.now();
    const rawUrl1 = `https://ph.indeed.com/viewjob?jk=testjob${testId}&utm_source=email&trackingId=abc`;
    const rawUrl2 = `https://www.indeed.com/viewjob?jk=testjob${testId}&ref=search`;

    const jobText = `
      Staff Cloud Infrastructure Engineer
      Cellexia Systems Ltd
      Remote
      PHP 90,000 - PHP 120,000 a month
      Full-time

      We are seeking a Staff Cloud Engineer to lead our Kubernetes and Terraform infrastructure.
      Requirements: Docker, AWS, Python, Go, and Microservices architecture.
    `;

    // 1. First call: Cache Miss -> processes and caches
    const res1 = await request.post("/api/extract", {
      data: {
        url: rawUrl1,
        rawText: jobText,
      },
    });

    expect(res1.status()).toBe(200);
    const json1 = await res1.json();
    expect(json1.ok).toBe(true);
    expect(json1.fromCache).toBe(false);
    expect(json1.data.title).toContain("Staff Cloud");
    expect(json1.data.company).toContain("Cellexia");
    expect(json1.data.salary).toContain("PHP");
    expect(json1.data.skills).toContain("Docker");
    expect(json1.data.skills).toContain("AWS");

    // 2. Second call with different tracking params: Cache Hit!
    const res2 = await request.post("/api/extract", {
      data: {
        url: rawUrl2,
        rawText: "Unused changed text",
      },
    });

    expect(res2.status()).toBe(200);
    const json2 = await res2.json();
    expect(json2.ok).toBe(true);
    expect(json2.fromCache).toBe(true);
    expect(json2.data.urlHash).toBe(json1.data.urlHash);
    expect(json2.data.title).toBe(json1.data.title);
    expect(json2.data.hitCount).toBeGreaterThanOrEqual(2);
  });
});
