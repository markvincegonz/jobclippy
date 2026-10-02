// JobClippy MV3 Background Service Worker
// Ephemeral service worker handling context menus, storage queue, and tab bridge messaging.

const CONTEXT_MENU_ID = "save-highlight-to-jobclippy";
const APP_URL_PATTERNS = [
  "http://localhost/*",
  "http://127.0.0.1/*",
  "https://*.vercel.app/*"
];

// 1. Initialize Context Menus & Defaults on Install
chrome.runtime.onInstalled.addListener(async () => {
  chrome.contextMenus.create({
    id: CONTEXT_MENU_ID,
    title: "Save Highlighted Job to JobClippy",
    contexts: ["selection"]
  });

  const { pending_clips = [] } = await chrome.storage.local.get("pending_clips");
  updateBadge(pending_clips.length);
});

// Helper: Update extension badge counter
async function updateBadge(count) {
  if (count > 0) {
    await chrome.action.setBadgeText({ text: String(count) });
    await chrome.action.setBadgeBackgroundColor({ color: "#5E6AD2" });
  } else {
    await chrome.action.setBadgeText({ text: "" });
  }
}

// 2. Handle Context Menu Click on Selected Text
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === CONTEXT_MENU_ID && info.selectionText) {
    const rawText = info.selectionText.trim();
    const lines = rawText.split("\n").map(l => l.trim()).filter(Boolean);

    let title = "Software Engineer";
    let company = "Company";
    let location = "Remote";

    if (lines.length > 0) {
      const firstLine = lines[0].replace(/^Title[:\s-]*/i, "");
      if (/\s+at\s+/i.test(firstLine)) {
        const parts = firstLine.split(/\s+at\s+/i);
        title = parts[0].trim();
        if (parts[1]) company = parts[1].split(/[.,\n]/)[0].trim();
      } else {
        title = firstLine;
      }
    }
    if (lines.length > 1 && company === "Company") {
      company = lines[1].replace(/^Company[:\s-]*/i, "");
    }
    if (lines.length > 2 && (lines[2].toLowerCase().includes("remote") || lines[2].length < 40)) {
      location = lines[2].replace(/^Location[:\s-]*/i, "");
    }

    const job = {
      title,
      company,
      location,
      salary: "Salary not listed",
      stage: "wishlist",
      skills: ["React", "TypeScript"],
      description: rawText.slice(0, 3000),
      url: tab?.url || "https://linkedin.com/jobs",
      notes: [{ id: "note-" + Date.now(), text: "Clipped from selected text", createdAt: new Date().toISOString() }],
    };

    await saveAndSyncJob(job);

    // Flash green badge feedback
    await chrome.action.setBadgeText({ text: "✓" });
    await chrome.action.setBadgeBackgroundColor({ color: "#10b981" });
    setTimeout(async () => {
      const { pending_clips = [] } = await chrome.storage.local.get("pending_clips");
      updateBadge(pending_clips.length);
    }, 1500);
  }
});

// 3. Core Queue & Sync Function
async function saveAndSyncJob(jobData) {
  const newJob = {
    ...jobData,
    id: "job-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
    createdAt: new Date().toISOString(),
  };

  // Get current pending queue from chrome.storage.local
  const { pending_clips = [] } = await chrome.storage.local.get("pending_clips");
  const updatedClips = [...pending_clips, newJob];
  await chrome.storage.local.set({ pending_clips: updatedClips });
  await updateBadge(updatedClips.length);

  // Check if JobClippy web app is currently open in any tab
  try {
    const tabs = await chrome.tabs.query({ url: APP_URL_PATTERNS });
    if (tabs.length > 0) {
      for (const t of tabs) {
        chrome.tabs.sendMessage(t.id, {
          type: "SYNC_CLIPPED_JOBS",
          jobs: updatedClips
        }, (res) => {
          if (chrome.runtime.lastError) {
            // Tab might still be loading, queue remains safely in storage
          } else if (res && res.success) {
            // Once bridge confirms write, clear pending queue
            chrome.storage.local.set({ pending_clips: [] });
            updateBadge(0);
          }
        });
      }
    }
  } catch (err) {
    console.warn("Could not query tabs for sync:", err);
  }

  return newJob;
}

// 4. Runtime Message Listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      if (message.type === "SAVE_CLIPPED_JOB") {
        const savedJob = await saveAndSyncJob(message.job);
        sendResponse({ success: true, job: savedJob });
      } else if (message.type === "GET_PENDING_CLIPS") {
        const { pending_clips = [] } = await chrome.storage.local.get("pending_clips");
        sendResponse({ success: true, clips: pending_clips });
      } else if (message.type === "CLEAR_PENDING_CLIPS") {
        await chrome.storage.local.set({ pending_clips: [] });
        await updateBadge(0);
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: "Unknown message type" });
      }
    } catch (err) {
      sendResponse({ success: false, error: err.message });
    }
  })();

  return true; // Keep message channel open for async response
});
