// JobClippy Web App Bridge Content Script
// Bridges clipped jobs between the extension and JobClippy web app localStorage.

(function () {
  const STORAGE_KEY = "jobclippy_jobs_v1";

  function syncJobsToLocalStorage(newJobs) {
    if (!Array.isArray(newJobs) || newJobs.length === 0) return 0;

    let existing = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) existing = JSON.parse(stored);
    } catch (e) {
      console.warn("[JobClippy Bridge] Error reading stored jobs:", e);
    }

    const existingIds = new Set(existing.map((j) => j.id));
    const toAdd = newJobs.filter((j) => !existingIds.has(j.id));

    if (toAdd.length === 0) return 0;

    const merged = [...toAdd, ...existing];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      // Dispatch both standard StorageEvent and CustomEvent for immediate reactivity
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: STORAGE_KEY,
          newValue: JSON.stringify(merged),
        })
      );
      window.dispatchEvent(
        new CustomEvent("jobclippy:synced", {
          detail: { added: toAdd.length, jobs: toAdd },
        })
      );
      console.log(`[JobClippy Bridge] Successfully synced ${toAdd.length} job(s) to dashboard.`);
      return toAdd.length;
    } catch (e) {
      console.error("[JobClippy Bridge] Error writing synced jobs to localStorage:", e);
      return 0;
    }
  }

  // 1. Initial check for queued clips when page opens
  if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
    chrome.runtime.sendMessage({ type: "GET_PENDING_CLIPS" }, (response) => {
      if (chrome.runtime.lastError) return;
      if (response && response.success && Array.isArray(response.clips) && response.clips.length > 0) {
        const count = syncJobsToLocalStorage(response.clips);
        if (count > 0) {
          chrome.runtime.sendMessage({ type: "CLEAR_PENDING_CLIPS" });
        }
      }
    });

    // 2. Listen for live clips dispatched while dashboard tab is open
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === "SYNC_CLIPPED_JOBS") {
        const count = syncJobsToLocalStorage(message.jobs);
        sendResponse({ success: true, count });
      }
      return true;
    });
  }
})();
