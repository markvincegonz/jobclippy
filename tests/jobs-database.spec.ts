import { test, expect } from "@playwright/test";

test.describe("PostgreSQL & Prisma Jobs API Integration", () => {
  test.describe.configure({ mode: "serial" });
  let createdJobId = "";

  test("GET /api/jobs returns seeded opportunities from PostgreSQL", async ({ request }) => {
    const res = await request.get("http://localhost:3000/api/jobs");
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThanOrEqual(1);

    const companies = json.data.map((j: { company: string }) => j.company);
    expect(companies).toContain("LinearFlow");
  });

  test("POST /api/jobs creates a new opportunity in PostgreSQL", async ({ request }) => {
    const res = await request.post("http://localhost:3000/api/jobs", {
      data: {
        title: "Principal AI Infrastructure Architect",
        company: "DeepMind Tech Labs",
        location: "Remote — Global",
        salary: "$210K–$260K",
        stage: "wishlist",
        skills: ["PyTorch", "Kubernetes", "PostgreSQL", "Prisma", "Docker"],
        description: "Architect distributed model execution and database persistence systems.",
        url: "https://example.com/careers/ai-arch",
        notes: "Found through referral.",
      },
    });

    expect(res.status()).toBe(201);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.data.id).toBeTruthy();
    expect(json.data.title).toBe("Principal AI Infrastructure Architect");
    expect(json.data.notes.length).toBe(1);
    expect(json.data.notes[0].text).toBe("Found through referral.");

    createdJobId = json.data.id;
  });

  test("PATCH /api/jobs/[id] updates stage and appends notes", async ({ request }) => {
    expect(createdJobId).toBeTruthy();

    const patchRes = await request.patch(`http://localhost:3000/api/jobs/${createdJobId}`, {
      data: {
        stage: "interviewing",
        newNote: "Screening round completed with VP of Engineering.",
      },
    });

    expect(patchRes.ok()).toBeTruthy();
    const patchJson = await patchRes.json();
    expect(patchJson.ok).toBe(true);
    expect(patchJson.data.stage).toBe("interviewing");
    expect(patchJson.data.notes.length).toBe(2);

    // Verify GET reflects the update
    const getRes = await request.get(`http://localhost:3000/api/jobs/${createdJobId}`);
    const getJson = await getRes.json();
    expect(getJson.data.stage).toBe("interviewing");
  });

  test("DELETE /api/jobs/[id] removes job and cascades notes", async ({ request }) => {
    expect(createdJobId).toBeTruthy();

    const delRes = await request.delete(`http://localhost:3000/api/jobs/${createdJobId}`);
    expect(delRes.ok()).toBeTruthy();

    const checkRes = await request.get(`http://localhost:3000/api/jobs/${createdJobId}`);
    expect(checkRes.status()).toBe(404);
  });

  test("Web UI renders PostgreSQL-backed opportunities on the Kanban board", async ({ page }) => {
    await page.goto("http://localhost:3000/");

    // Check main container exists
    await expect(page.getByRole("main").first()).toBeVisible();

    // Verify seeded jobs appear on board
    await expect(page.getByText("Senior Product Designer").first()).toBeVisible();
    await expect(page.getByText("LinearFlow").first()).toBeVisible();
  });
});
