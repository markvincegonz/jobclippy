// JobClippy Web App Bridge Content Script
// Bridges clipped jobs between the extension and JobClippy web app in-memory state.

(function () {
  function notifyAppOfSyncedJobs(newJobs) {
    if (!Array.isArray(newJobs) || newJobs.length === 0) return 0;

    window.dispatchEvent(
      new CustomEvent("jobclippy:synced", {
        detail: { added: newJobs.length, jobs: newJobs },
      })
    );
    console.log(`[JobClippy Bridge] Successfully notified dashboard of ${newJobs.length} job(s).`);
    return newJobs.length;
  }

  // 1. Initial check for queued clips when page opens
  if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
    chrome.runtime.sendMessage({ type: "GET_PENDING_CLIPS" }, (response) => {
      if (chrome.runtime.lastError) return;
      if (response && response.success && Array.isArray(response.clips) && response.clips.length > 0) {
        const count = notifyAppOfSyncedJobs(response.clips);
        if (count > 0) {
          chrome.runtime.sendMessage({ type: "CLEAR_PENDING_CLIPS" });
        }
      }
    });

    // 2. Listen for live clips dispatched while dashboard tab is open
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === "JOB_PERSISTED_TO_DB") {
        window.dispatchEvent(
          new CustomEvent("jobclippy:synced", {
            detail: { added: 1, job: message.job, source: "database" },
          })
        );
        sendResponse({ success: true });
      } else if (message.type === "SYNC_CLIPPED_JOBS") {
        const count = notifyAppOfSyncedJobs(message.jobs);
        sendResponse({ success: true, count });
      }
      return true;
    });
  }
})();
