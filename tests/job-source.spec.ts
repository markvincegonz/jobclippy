import { test, expect } from "@playwright/test";
import { getJobSource } from "../src/lib/job-source";

test.describe("Job Source Derivation Unit Tests", () => {
  test("derives LinkedIn from various LinkedIn URLs", () => {
    const s1 = getJobSource("https://www.linkedin.com/jobs/view/123456789");
    const s2 = getJobSource("https://linkedin.com/jobs/view/123456789?ref=foo");
    expect(s1?.brand).toBe("LinkedIn");
    expect(s1?.domain).toBe("linkedin.com");
    expect(s1?.faviconUrl).toContain("linkedin.com");
    expect(s2?.brand).toBe("LinkedIn");
  });

  test("derives Indeed from global and country-specific Indeed URLs", () => {
    const s1 = getJobSource("https://www.indeed.com/viewjob?jk=abcdef");
    const s2 = getJobSource("https://ph.indeed.com/viewjob?jk=abcdef");
    expect(s1?.brand).toBe("Indeed");
    expect(s1?.domain).toBe("indeed.com");
    expect(s2?.brand).toBe("Indeed");
  });

  test("derives JobStreet from JobStreet domains", () => {
    const s = getJobSource("https://ph.jobstreet.com/job/95014441");
    expect(s?.brand).toBe("JobStreet");
    expect(s?.domain).toBe("jobstreet.com");
  });

  test("derives Seek from Seek domains", () => {
    const s = getJobSource("https://www.seek.com.au/job/7891011");
    expect(s?.brand).toBe("Seek");
    expect(s?.domain).toBe("seek.com.au");
  });

  test("derives Glassdoor from Glassdoor domains", () => {
    const s = getJobSource("https://www.glassdoor.com/job-listing/123");
    expect(s?.brand).toBe("Glassdoor");
    expect(s?.domain).toBe("glassdoor.com");
  });

  test("derives fallback domain for unknown direct career pages", () => {
    const s = getJobSource("https://careers.google.com/jobs/results/123456");
    expect(s?.brand).toBe("careers.google.com");
    expect(s?.domain).toBe("careers.google.com");
    expect(s?.faviconUrl).toContain("careers.google.com");
  });

  test("returns null for empty or invalid input", () => {
    expect(getJobSource("")).toBeNull();
    expect(getJobSource(null)).toBeNull();
    expect(getJobSource(undefined)).toBeNull();
    expect(getJobSource("   ")).toBeNull();
  });
});
