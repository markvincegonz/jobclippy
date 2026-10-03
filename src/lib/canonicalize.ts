import crypto from "node:crypto";

const TRACKING_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "ref",
  "refid",
  "trackingid",
  "trk",
  "from",
  "vjs",
  "fbclid",
  "gclid",
  "origin",
  "midtoken",
  "sessionid",
  "rc",
  "rclk",
  "spa",
  "mobilesearch",
  "tk",
  "advn",
  "adanchor",
  "co",
  "bb",
  "clk",
  "cmp",
]);

/**
 * Normalizes job posting URLs across major portals and custom domains.
 * Strips tracking query parameters and standardizes canonical job IDs.
 */
export function canonicalizeUrl(rawUrl: string): string {
  if (!rawUrl || typeof rawUrl !== "string") {
    return "";
  }

  try {
    const parsed = new URL(rawUrl.trim());
    let protocol = parsed.protocol.toLowerCase();
    let hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
    let pathname = parsed.pathname;

    // 1. Indeed domain normalization
    if (hostname.includes("indeed.")) {
      const jk = parsed.searchParams.get("jk") || parsed.searchParams.get("vjk");
      if (jk) {
        return `https://www.indeed.com/viewjob?jk=${encodeURIComponent(jk)}`;
      }
      // If path contains /viewjob or /rc/clk with jk in path or params
      const pathMatch = pathname.match(/\/(?:viewjob|rc\/clk)\/([a-zA-Z0-9_-]+)/);
      if (pathMatch) {
        return `https://www.indeed.com/viewjob?jk=${encodeURIComponent(pathMatch[1])}`;
      }
    }

    // 1.1 JobStreet / Seek / JobsDB normalization
    if (
      hostname.includes("jobstreet.") ||
      hostname.includes("seek.") ||
      hostname.includes("jobsdb.")
    ) {
      const jobId =
        parsed.searchParams.get("jobId") ||
        pathname.match(/\/job\/([a-zA-Z0-9_-]+)/)?.[1];
      if (jobId) {
        return `https://${hostname}/job/${encodeURIComponent(jobId)}`;
      }
    }

    // 2. LinkedIn normalization
    if (hostname.includes("linkedin.com")) {
      const jobIdMatch = pathname.match(/\/jobs\/view\/(\d+)/);
      if (jobIdMatch) {
        return `https://www.linkedin.com/jobs/view/${jobIdMatch[1]}`;
      }
      const currentJobId = parsed.searchParams.get("currentJobId");
      if (currentJobId && /^\d+$/.test(currentJobId)) {
        return `https://www.linkedin.com/jobs/view/${currentJobId}`;
      }
    }

    // 3. Greenhouse normalization
    if (hostname.includes("greenhouse.io")) {
      const ghMatch = pathname.match(/\/jobs\/(\d+)/);
      if (ghMatch) {
        return `https://${hostname}${pathname.replace(/\/$/, "")}`;
      }
    }

    // 4. Lever normalization
    if (hostname.includes("lever.co")) {
      const leverMatch = pathname.match(/\/[^/]+\/([a-f0-9-]+)/i);
      if (leverMatch) {
        return `https://${hostname}${pathname.replace(/\/$/, "")}`;
      }
    }

    // 5. Generic normalization: strip tracking parameters
    const cleanParams = new URLSearchParams();
    parsed.searchParams.forEach((value, key) => {
      if (!TRACKING_PARAMS.has(key.toLowerCase()) && !key.toLowerCase().startsWith("utm_")) {
        cleanParams.append(key, value);
      }
    });

    cleanParams.sort();
    const cleanSearch = cleanParams.toString();
    const cleanPath = pathname.replace(/\/+$/, "") || "/";

    return `${protocol}//${hostname}${cleanPath}${cleanSearch ? `?${cleanSearch}` : ""}`;
  } catch {
    // If URL cannot be parsed by WHATWG URL, return cleaned lowercase fallback
    return rawUrl.trim().toLowerCase().replace(/[?#].*$/, "");
  }
}

/**
 * Computes deterministic SHA-256 hash of a canonicalized URL string.
 */
export function hashCanonicalUrl(canonicalUrl: string): string {
  return crypto.createHash("sha256").update(canonicalUrl.trim()).digest("hex");
}
