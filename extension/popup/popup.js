// JobClippy Popup Controller (Ultra-Minimalist Linear Edition)
// Manages in-memory extracted attributes, on-demand AI refinement, and direct DB save.

document.addEventListener("DOMContentLoaded", async () => {
  if (typeof CONFIG !== "undefined" && CONFIG.init) {
    await CONFIG.init();
  }

  const openBoardLink = document.getElementById("open-board-link");
  if (openBoardLink && typeof CONFIG !== "undefined") {
    openBoardLink.href = CONFIG.API_BASE_URL;
  }

  const statusPill = document.getElementById("status-pill");
  const statusText = document.getElementById("status-text");
  const stageSelect = document.getElementById("job-stage");
  const noteTextarea = document.getElementById("job-note");
  const clipBtn = document.getElementById("clip-btn");
  const btnLabel = document.getElementById("btn-label");
  const feedbackBanner = document.getElementById("feedback-banner");
  const feedbackMsg = document.getElementById("feedback-msg");

  // In-memory staged job payload
  let stagedJob = {
    title: "Software Engineer",
    company: "Company",
    location: "Remote",
    salary: "Salary not listed",
    skills: ["React", "TypeScript"],
    description: "",
    rawText: "",
    url: "",
    source: "generic",
  };
  let jobUrl = "";

  // Helper to extract job from active tab with programmatic injection fallback
  async function extractFromTab(tab) {
    if (!tab || !tab.id) return null;

    const tryMessage = () =>
      new Promise((resolve) => {
        chrome.tabs.sendMessage(tab.id, { type: "EXTRACT_JOB_DETAILS" }, { frameId: 0 }, (response) => {
          if (chrome.runtime.lastError || !response || !response.ok) {
            resolve(null);
          } else {
            resolve(response.data);
          }
        });
      });

    // 1. Try messaging content script directly in main frame
    let data = await tryMessage();
    if (data) return data;

    // 2. Programmatically inject content script into main frame (for tabs opened before extension was loaded)
    try {
      if (chrome.scripting) {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id, frameIds: [0] },
          files: ["content/extractor.js"],
        });

        data = await tryMessage();
        if (data) return data;

        // 3. Fallback: direct function execution in main frame via scripting
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id, frameIds: [0] },
          func: async () => {
            if (window.__JobClippyExtractor) {
              return await window.__JobClippyExtractor.extractJob();
            }
            return null;
          },
        });
        if (results && results[0] && results[0].result) {
          return results[0].result;
        }
      }
    } catch (err) {
      console.warn("Scripting injection fallback warning:", err);
    }

    return null;
  }

  // Query active tab and request extraction
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    jobUrl = tab?.url || "https://jobclippy.local";

    const data = await extractFromTab(tab);

    if (data) {
      stagedJob = {
        title: data.title || "Software Engineer",
        company: data.company || "Company",
        location: data.location || "Remote",
        salary: data.salary || "Salary not listed",
        skills: Array.isArray(data.skills) && data.skills.length > 0 ? data.skills : ["React", "TypeScript"],
        description: data.description || "",
        rawText: data.rawText || data.description || "",
        url: data.url || jobUrl,
        source: data.source || "detected",
      };

      statusPill.className = "status-pill status-detected";
      if (data.source === "selection") {
        statusText.textContent = "Text Selected";
      } else if (data.source === "schema") {
        statusText.textContent = "Schema.org";
      } else if (data.source === "linkedin") {
        statusText.textContent = "LinkedIn";
      } else if (data.source === "indeed") {
        statusText.textContent = "Indeed";
      } else {
        statusText.textContent = "Job Detected";
      }
    } else {
      // Manual fallback state with intelligent page title parsing
      statusPill.className = "status-pill status-manual";
      statusText.textContent = "Manual Entry";
      if (tab?.title) {
        const parts = tab.title.split(/[-|–•]/);
        const titleCandidate = parts[0]?.trim() || "Software Engineer";
        const companyCandidate = parts[1]?.replace(/Indeed.*$/i, "").trim() || "Company";
        stagedJob.title = titleCandidate;
        stagedJob.company = companyCandidate;
        stagedJob.url = jobUrl;
      }
    }
  } catch (err) {
    console.warn("Could not query active tab:", err);
    statusPill.className = "status-pill status-manual";
    statusText.textContent = "Manual Entry";
  }

  // On-demand AI extraction executed only upon clicking "Clip to JobClippy"
  async function performOnDemandAiExtraction() {
    if (!stagedJob.rawText && !stagedJob.description) return;

    try {
      const extractUrl = (typeof CONFIG !== "undefined" && CONFIG.url)
        ? CONFIG.url(CONFIG.ENDPOINTS.EXTRACT)
        : "http://localhost:3000/api/extract";

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(extractUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: stagedJob.url || jobUrl,
          rawText: stagedJob.rawText || stagedJob.description || "",
          partialFields: {
            title: stagedJob.title,
            company: stagedJob.company,
            location: stagedJob.location,
            salary: stagedJob.salary,
            skills: stagedJob.skills,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.ok) {
        const json = await response.json();
        if (json.ok && json.data) {
          const ai = json.data;
          if (ai.title && ai.title !== "Job Opportunity") stagedJob.title = ai.title;
          if (ai.company && ai.company !== "Company") stagedJob.company = ai.company;
          if (ai.salary && ai.salary !== "Salary not listed") stagedJob.salary = ai.salary;
          if (ai.location) stagedJob.location = ai.location;
          if (Array.isArray(ai.skills) && ai.skills.length > 0) stagedJob.skills = ai.skills;
          if (ai.summary) stagedJob.description = ai.summary;
        }
      }
    } catch (err) {
      console.warn("On-demand AI extraction skipped or timed out, using preliminary attributes:", err);
    }
  }

  // Handle Save / Clip action
  clipBtn.addEventListener("click", async () => {
    clipBtn.disabled = true;
    btnLabel.textContent = "Saving...";
    statusPill.className = "status-pill status-saving";
    statusText.textContent = "Saving...";

    // Run AI refinement on-demand
    await performOnDemandAiExtraction();

    const selectedStage = stageSelect.value || "wishlist";
    const userNote = noteTextarea.value.trim();

    const finalPayload = {
      title: stagedJob.title || "Software Engineer",
      company: stagedJob.company || "Company",
      location: stagedJob.location || "Remote",
      salary: stagedJob.salary || "Salary not listed",
      stage: selectedStage,
      skills: Array.isArray(stagedJob.skills) && stagedJob.skills.length > 0 ? stagedJob.skills : ["React", "TypeScript"],
      description: stagedJob.description || "",
      url: stagedJob.url || jobUrl || "https://jobclippy.local",
      notes: userNote ? [userNote] : [],
      source: stagedJob.source || "extension",
    };

    let saveSuccess = false;
    let offlineFallback = false;

    // 1. Direct PostgreSQL Persistence via POST /api/jobs
    try {
      const saveUrl = (typeof CONFIG !== "undefined" && CONFIG.url)
        ? CONFIG.url(CONFIG.ENDPOINTS.JOBS)
        : "http://localhost:3000/api/jobs";

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(saveUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalPayload),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.ok) {
        const json = await response.json();
        if (json.ok) {
          saveSuccess = true;
        }
      }
    } catch (err) {
      console.warn("Direct DB save failed or server unreachable, falling back to local sync:", err);
      offlineFallback = true;
    }

    // 2. Storage bridge update for active web app tabs
    try {
      if (typeof chrome !== "undefined" && chrome.tabs) {
        const tabs = await chrome.tabs.query({});
        tabs.forEach((tab) => {
          if (tab.url && (tab.url.includes("localhost:3000") || tab.url.includes("jobclippy"))) {
            chrome.tabs.sendMessage(tab.id, {
              type: "JOB_CLIPPED_SYNC",
              job: finalPayload,
            }, () => {
              if (chrome.runtime.lastError) {
                // Ignore error if tab does not have bridge content script
              }
            });
          }
        });
      }
    } catch (err) {
      console.warn("Storage bridge broadcast notice:", err);
    }

    // 3. Fallback queue in chrome.storage.local if direct DB save was offline
    if (offlineFallback || !saveSuccess) {
      try {
        if (typeof chrome !== "undefined" && chrome.storage?.local) {
          const stored = await chrome.storage.local.get(["pending_jobs"]);
          const list = stored.pending_jobs || [];
          list.push({ ...finalPayload, id: "offline-" + Date.now() });
          await chrome.storage.local.set({ pending_jobs: list });
        }
      } catch (storageErr) {
        console.warn("Could not save to chrome.storage.local:", storageErr);
      }
    }

    // 4. UI Feedback State
    clipBtn.className = "clip-button success";
    btnLabel.textContent = "Saved to JobClippy";
    statusPill.className = "status-pill status-saved";
    statusText.textContent = "Saved";

    feedbackBanner.className = offlineFallback ? "feedback-banner banner-warning" : "feedback-banner";
    feedbackMsg.textContent = offlineFallback
      ? "Saved offline (queued for sync)"
      : "Saved to your JobClippy pipeline!";
    feedbackBanner.classList.remove("hidden");

    setTimeout(() => {
      window.close();
    }, 1400);
  });
});
