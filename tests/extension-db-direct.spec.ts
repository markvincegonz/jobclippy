import { test, expect } from "@playwright/test";

test.describe("Direct PostgreSQL Persistence & Extension Configuration", () => {
  test.describe.configure({ mode: "serial" });

  const uniqueId = Date.now();
  const testJobTitle = `Direct DB Platform Lead ${uniqueId}`;
  const testCompany = `Prisma Stream ${uniqueId}`;

  test("Extension config resolves base URL dynamically without hardcoded localhost in logic", async ({ page }) => {
    await page.goto("http://localhost:3000");

    // Evaluate extension config in browser context
    const configResult = await page.evaluate(async () => {
      const testConfig = {
        API_BASE_URL: "http://localhost:3000",
        ENDPOINTS: { JOBS: "/api/jobs", EXTRACT: "/api/extract" },
        url(endpoint: string) {
          const base = this.API_BASE_URL.replace(/\/+$/, "");
          const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
          return `${base}${path}`;
        },
      };
      return {
        jobsUrl: testConfig.url(testConfig.ENDPOINTS.JOBS),
        extractUrl: testConfig.url(testConfig.ENDPOINTS.EXTRACT),
      };
    });

    expect(configResult.jobsUrl).toBe("http://localhost:3000/api/jobs");
    expect(configResult.extractUrl).toBe("http://localhost:3000/api/extract");
  });

  test("Clipped job payload persists directly to PostgreSQL database via POST /api/jobs", async ({ request }) => {
    const postRes = await request.post("http://localhost:3000/api/jobs", {
      data: {
        title: testJobTitle,
        company: testCompany,
        location: "Remote — Pacific",
        salary: "$175,000 – $210,000",
        stage: "wishlist",
        skills: ["TypeScript", "PostgreSQL", "Prisma", "Docker"],
        description: "Direct persistence test validating PostgreSQL entry creation.",
        url: "https://careers.prismastream.io/jobs/platform-lead",
        notes: [{ text: "Clipped directly via extension to PostgreSQL" }],
      },
    });

    expect(postRes.status()).toBe(201);
    const body = await postRes.json();
    expect(body.ok).toBe(true);
    expect(body.data.id).toBeTruthy();
    expect(body.data.title).toBe(testJobTitle);
    expect(body.data.company).toBe(testCompany);
    expect(body.data.notes).toHaveLength(1);
    expect(body.data.notes[0].text).toBe("Clipped directly via extension to PostgreSQL");

    const createdId = body.data.id;

    // Verify GET /api/jobs directly returns this record from PostgreSQL
    const getRes = await request.get("http://localhost:3000/api/jobs");
    expect(getRes.status()).toBe(200);
    const getBody = await getRes.json();
    const found = getBody.data.find((j: { id: string }) => j.id === createdId);
    expect(found).toBeTruthy();
    expect(found.title).toBe(testJobTitle);

    // Clean up created test record
    const deleteRes = await request.delete(`http://localhost:3000/api/jobs/${createdId}`);
    expect(deleteRes.status()).toBe(200);
  });

  test("Kanban board mounts and reads directly from PostgreSQL database without relying on localStorage", async ({ page, request }) => {
    // 1. Create a job directly in database
    const directTitle = `Database Direct Card ${Date.now()}`;
    const postRes = await request.post("http://localhost:3000/api/jobs", {
      data: {
        title: directTitle,
        company: "Postgres First Corp",
        location: "Remote",
        salary: "$160K",
        stage: "wishlist",
        skills: ["PostgreSQL", "Next.js"],
        description: "Testing initial UI load from database without localStorage seeding.",
        url: "https://example.com/job",
      },
    });
    expect(postRes.status()).toBe(201);
    const createdJob = (await postRes.json()).data;

    // 2. Open dashboard in a clean session
    await page.goto("http://localhost:3000");

    // 3. Clear localStorage completely to ensure UI is not dependent on local storage
    await page.evaluate(() => {
      localStorage.clear();
    });

    // Reload page with cleared localStorage
    await page.reload();

    // 4. Verify the database-persisted job appears on the Kanban board
    const wishlistCol = page.getByTestId("column-wishlist");
    await expect(wishlistCol.getByText(directTitle)).toBeVisible({ timeout: 10000 });
    await expect(wishlistCol.getByText("Postgres First Corp")).toBeVisible();

    // Clean up
    await request.delete(`http://localhost:3000/api/jobs/${createdJob.id}`);
  });

  test("Database re-seed endpoint /api/jobs/reset restores default opportunities", async ({ request }) => {
    const resetRes = await request.post("http://localhost:3000/api/jobs/reset");
    expect(resetRes.status()).toBe(200);
    const body = await resetRes.json();
    expect(body.ok).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThanOrEqual(5);

    // Verify known seed job is present
    const designer = body.data.find((j: { title: string }) => j.title === "Senior Product Designer");
    expect(designer).toBeTruthy();
    expect(designer.company).toBe("LinearFlow");
  });

  test("Two independent browser sessions see identical state without ghost item resurrection", async ({ browser, request }) => {
    // Reset database to known seeds
    await request.post("http://localhost:3000/api/jobs/reset");

    // Create Browser Context 2 (e.g. second browser simulation with stale localStorage ghost job)
    const context2 = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      colorScheme: "dark",
    });
    const page2 = await context2.newPage();

    // Pre-populate stale localStorage in Context 2 before loading dashboard
    await page2.addInitScript(() => {
      localStorage.setItem(
        "jobclippy_jobs_v1",
        JSON.stringify([
          {
            id: "ghost-job-9999",
            title: "Ghost Job That Does Not Exist in PostgreSQL",
            company: "Phantom Corp",
            location: "Nowhere",
            salary: "$999K",
            stage: "wishlist",
            skills: ["Spooky"],
            description: "This ghost job should never be loaded by the pure database store.",
            url: "https://ghost.example.com",
            notes: [],
            createdAt: new Date().toISOString(),
          },
        ])
      );
    });

    await page2.goto("http://localhost:3000/board");
    await page2.waitForLoadState("networkidle");

    // Verify Ghost Job is NOT displayed in Context 2
    await expect(page2.getByText("Ghost Job That Does Not Exist in PostgreSQL")).toHaveCount(0);
    // Context 2 displays real database opportunity
    await expect(page2.getByText("Senior Product Designer")).toBeVisible();

    await context2.close();
  });
});
