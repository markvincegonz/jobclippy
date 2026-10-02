import { test, expect } from "@playwright/test";

test.describe("DeepSeek & Server-Side Key Extraction Pipeline", () => {
  test("CORS preflight OPTIONS works without client keys", async ({ request }) => {
    const res = await request.fetch("http://localhost:3000/api/extract", {
      method: "OPTIONS",
      headers: {
        Origin: "chrome-extension://abcdefghijklmnop",
        "Access-Control-Request-Method": "POST",
      },
    });

    expect(res.status()).toBe(204);
    expect(res.headers()["access-control-allow-origin"]).toBe("*");
    expect(res.headers()["access-control-allow-methods"]).toContain("POST");
  });

  test("Extracts job attributes using server environment without requiring client x-api-key", async ({
    request,
  }) => {
    const sampleText = `
      Staff Cloud Infrastructure Engineer
      Apex HyperScale — Remote
      Compensation: $180,000 - $220,000 / year
      Tech Stack: Kubernetes, Terraform, Go, AWS, Docker
      We are seeking a senior infrastructure architect to lead platform reliability.
    `;

    const res = await request.post("http://localhost:3000/api/extract", {
      data: {
        url: "https://example.com/careers/staff-cloud-eng",
        rawText: sampleText,
        partialFields: {
          title: "Staff Cloud Infrastructure Engineer",
          company: "Apex HyperScale",
        },
      },
    });

    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.data).toBeDefined();
    expect(json.data.title).toContain("Cloud");
    expect(json.data.company).toBe("Apex HyperScale");
    expect(json.data.salary).toBeTruthy();
    expect(json.data.skills.length).toBeGreaterThanOrEqual(1);
    // Should succeed whether using server AI key or heuristic fallback
    expect(["deepseek", "openai", "gemini", "none (missing API key)", "cache"]).toContain(json.provider);
  });
});
