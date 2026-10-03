// JobClippy Extension Shared Configuration
// Configures backend API endpoints dynamically without hardcoded URLs.

const CONFIG = {
  // Base URL for JobClippy API and dashboard
  API_BASE_URL:
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) ||
    "http://localhost:3000",

  // Endpoints
  ENDPOINTS: {
    JOBS: "/api/jobs",
    EXTRACT: "/api/extract",
  },

  // Helper to resolve full URL
  url(endpoint) {
    const base = (this.API_BASE_URL || "http://localhost:3000").replace(/\/+$/, "");
    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    return `${base}${path}`;
  },

  // Initialize dynamic override from chrome.storage.local if user configured custom host
  async init() {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      try {
        const stored = await chrome.storage.local.get("jobclippy_api_url");
        if (stored?.jobclippy_api_url) {
          this.API_BASE_URL = stored.jobclippy_api_url.replace(/\/+$/, "");
        }
      } catch {
        // Fallback to default
      }
    }
    return this;
  },
};

// Export for node/testing environments if needed
if (typeof module !== "undefined" && module.exports) {
  module.exports = CONFIG;
}
