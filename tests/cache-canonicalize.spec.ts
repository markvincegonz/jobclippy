import { test, expect } from "@playwright/test";
import { canonicalizeUrl, hashCanonicalUrl } from "../src/lib/canonicalize";
import { LocalExtractionCacheStore } from "../src/lib/cache/file-store";

test.describe("Layer 2: Canonicalization & Cache Database Suite", () => {
  test("canonicalizeUrl removes tracking parameters and standardizes Indeed URLs", () => {
    const rawIndeed1 =
      "https://ph.indeed.com/viewjob?jk=7d4a2b918c0e&from=serp&vjs=3&utm_source=jobseeker&trackingId=987abc";
    const rawIndeed2 =
      "https://www.indeed.com/jobs?q=Video+Editor&vjk=7d4a2b918c0e&utm_medium=email";

    const canon1 = canonicalizeUrl(rawIndeed1);
    const canon2 = canonicalizeUrl(rawIndeed2);

    expect(canon1).toBe("https://www.indeed.com/viewjob?jk=7d4a2b918c0e");
    expect(canon2).toBe("https://www.indeed.com/viewjob?jk=7d4a2b918c0e");

    // Both variations must produce identical SHA-256 hashes
    expect(hashCanonicalUrl(canon1)).toBe(hashCanonicalUrl(canon2));
  });

  test("canonicalizeUrl normalizes LinkedIn job URLs", () => {
    const rawLinkedIn1 =
      "https://www.linkedin.com/jobs/view/3928172645/?refId=abcdef&trackingId=xyz123";
    const rawLinkedIn2 =
      "https://linkedin.com/jobs/view/3928172645?utm_campaign=google_jobs_apply";

    const canon1 = canonicalizeUrl(rawLinkedIn1);
    const canon2 = canonicalizeUrl(rawLinkedIn2);

    expect(canon1).toBe("https://www.linkedin.com/jobs/view/3928172645");
    expect(canon2).toBe("https://www.linkedin.com/jobs/view/3928172645");
    expect(hashCanonicalUrl(canon1)).toBe(hashCanonicalUrl(canon2));
  });

  test("canonicalizeUrl strips arbitrary tracking queries while preserving non-tracking search parameters", () => {
    const raw =
      "https://careers.google.com/jobs/results/12345/?utm_source=ad&team=ENGINEERING&ref=newsletter&location=Austin";
    const canon = canonicalizeUrl(raw);

    expect(canon).toContain("location=Austin");
    expect(canon).toContain("team=ENGINEERING");
    expect(canon).not.toContain("utm_source");
    expect(canon).not.toContain("ref=");
  });

  test("cache store saves, retrieves, increments hit, and handles expiration", async () => {
    const store = new LocalExtractionCacheStore({ enableDisk: false });
    const url = "https://linear.app/careers/staff-frontend";
    const hash = hashCanonicalUrl(canonicalizeUrl(url));

    // 1. Initial lookup is a cache miss
    const initial = await store.get(hash);
    expect(initial).toBeNull();

    // 2. Set cache entry
    const saved = await store.set(
      hash,
      {
        canonicalUrl: canonicalizeUrl(url),
        title: "Staff Frontend Engineer",
        company: "Linear",
        location: "Remote",
        workplaceType: "remote",
        salary: "$180K–$220K",
        seniority: "lead",
        skills: ["React", "TypeScript", "Next.js"],
        experienceYears: 6,
        summary: "Leading high-performance frontend interfaces for Linear.",
        rawDescription: "Join our team building Linear.",
        modelUsed: "gpt-4o-mini",
      },
      30
    );

    expect(saved.urlHash).toBe(hash);
    expect(saved.hitCount).toBe(1);

    // 3. Subsequent lookup is a cache hit
    const hit = await store.get(hash);
    expect(hit).not.toBeNull();
    expect(hit?.title).toBe("Staff Frontend Engineer");
    expect(hit?.company).toBe("Linear");
    expect(hit?.skills).toContain("React");

    // 4. Increment hit count
    await store.incrementHit(hash);
    const hitUpdated = await store.get(hash);
    expect(hitUpdated?.hitCount).toBe(2);

    // 5. Expired entry returns null
    const expiredHash = "expired-hash-test";
    await store.set(
      expiredHash,
      {
        canonicalUrl: "https://example.com/expired-job",
        title: "Old Job",
        company: "Old Co",
        location: "Remote",
        salary: "$100K",
        skills: ["SQL"],
      },
      -1 // Expired 1 day ago
    );

    const expiredResult = await store.get(expiredHash);
    expect(expiredResult).toBeNull();
  });
});
