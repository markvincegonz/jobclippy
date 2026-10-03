export interface JobSourceInfo {
  brand: string;
  domain: string;
  faviconUrl: string;
}

const KNOWN_SOURCES: Array<{
  match: (hostname: string) => boolean;
  brand: string;
  primaryDomain: string;
}> = [
  {
    match: (h) => h.includes("linkedin.com") || h.endsWith("linkedin.com"),
    brand: "LinkedIn",
    primaryDomain: "linkedin.com",
  },
  {
    match: (h) => h.includes("indeed.") || h.endsWith("indeed.com"),
    brand: "Indeed",
    primaryDomain: "indeed.com",
  },
  {
    match: (h) => h.includes("jobstreet.") || h.endsWith("jobstreet.com"),
    brand: "JobStreet",
    primaryDomain: "jobstreet.com",
  },
  {
    match: (h) => h.includes("seek.") || h.endsWith("seek.com") || h.endsWith("seek.com.au"),
    brand: "Seek",
    primaryDomain: "seek.com.au",
  },
  {
    match: (h) => h.includes("glassdoor.") || h.endsWith("glassdoor.com"),
    brand: "Glassdoor",
    primaryDomain: "glassdoor.com",
  },
  {
    match: (h) => h.includes("wellfound.com") || h.includes("angel.co"),
    brand: "Wellfound",
    primaryDomain: "wellfound.com",
  },
  {
    match: (h) => h.includes("greenhouse.io"),
    brand: "Greenhouse",
    primaryDomain: "greenhouse.io",
  },
  {
    match: (h) => h.includes("lever.co"),
    brand: "Lever",
    primaryDomain: "lever.co",
  },
  {
    match: (h) => h.includes("ashbyhq.com"),
    brand: "Ashby",
    primaryDomain: "ashbyhq.com",
  },
  {
    match: (h) => h.includes("workable.com"),
    brand: "Workable",
    primaryDomain: "workable.com",
  },
  {
    match: (h) => h.includes("smartrecruiters.com"),
    brand: "SmartRecruiters",
    primaryDomain: "smartrecruiters.com",
  },
  {
    match: (h) => h.includes("workatastartup.com") || h.includes("ycombinator.com"),
    brand: "Y Combinator",
    primaryDomain: "ycombinator.com",
  },
  {
    match: (h) => h.includes("github.com"),
    brand: "GitHub",
    primaryDomain: "github.com",
  },
  {
    match: (h) => h.includes("weworkremotely.com"),
    brand: "We Work Remotely",
    primaryDomain: "weworkremotely.com",
  },
  {
    match: (h) => h.includes("remoteok.com") || h.includes("remoteok.io"),
    brand: "RemoteOK",
    primaryDomain: "remoteok.com",
  },
  {
    match: (h) => h.includes("ziprecruiter.com"),
    brand: "ZipRecruiter",
    primaryDomain: "ziprecruiter.com",
  },
  {
    match: (h) => h.includes("dice.com"),
    brand: "Dice",
    primaryDomain: "dice.com",
  },
];

/**
 * Extracts clean domain and human-friendly brand from a job posting URL.
 * Returns null if the URL is empty or invalid.
 */
export function getJobSource(rawUrl?: string | null): JobSourceInfo | null {
  if (!rawUrl || typeof rawUrl !== "string") {
    return null;
  }

  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return null;
  }

  // Ensure url has a protocol for the URL constructor
  const normalizedUrl = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(normalizedUrl);
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
    if (!hostname) {
      return null;
    }

    for (const source of KNOWN_SOURCES) {
      if (source.match(hostname)) {
        return {
          brand: source.brand,
          domain: source.primaryDomain,
          faviconUrl: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(source.primaryDomain)}&sz=32`,
        };
      }
    }

    // Fallback: Use clean domain name as brand label
    return {
      brand: hostname,
      domain: hostname,
      faviconUrl: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=32`,
    };
  } catch {
    return null;
  }
}
