// JobClippy Popup Controller
// Queries active tab content script, populates preview card, and handles clipping.

document.addEventListener("DOMContentLoaded", async () => {
  const statusPill = document.getElementById("status-pill");
  const statusText = document.getElementById("status-text");
  const titleInput = document.getElementById("job-title");
  const companyInput = document.getElementById("job-company");
  const locationInput = document.getElementById("job-location");
  const salaryInput = document.getElementById("job-salary");
  const skillsContainer = document.getElementById("skills-container");
  const newSkillInput = document.getElementById("new-skill-input");
  const stageSelect = document.getElementById("job-stage");
  const noteTextarea = document.getElementById("job-note");
  const clipBtn = document.getElementById("clip-btn");
  const btnIcon = document.getElementById("btn-icon");
  const btnLabel = document.getElementById("btn-label");
  const feedbackBanner = document.getElementById("feedback-banner");

  let currentSkills = ["React", "TypeScript"];
  let jobUrl = "";
  let jobDescription = "";

  function renderSkills() {
    skillsContainer.innerHTML = "";
    currentSkills.forEach((skill, index) => {
      const tag = document.createElement("span");
      tag.className = "skill-tag";
      tag.textContent = skill + " ×";
      tag.title = "Click to remove";
      tag.addEventListener("click", () => {
        currentSkills.splice(index, 1);
        renderSkills();
      });
      skillsContainer.appendChild(tag);
    });
  }

  // Handle adding new skill tag
  newSkillInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && newSkillInput.value.trim()) {
      e.preventDefault();
      const val = newSkillInput.value.trim();
      if (!currentSkills.includes(val)) {
        currentSkills.push(val);
        renderSkills();
      }
      newSkillInput.value = "";
    }
  });

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
          func: () => {
            if (window.__JobClippyExtractor) {
              return window.__JobClippyExtractor.extractJob();
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
    jobUrl = tab?.url || "https://linkedin.com/jobs";

    const data = await extractFromTab(tab);

    if (data) {
      titleInput.value = data.title || "Software Engineer";
      companyInput.value = data.company || "Company";
      locationInput.value = data.location || "Remote";
      salaryInput.value = data.salary || "Salary not listed";
      jobDescription = data.description || "";
      if (data.url) jobUrl = data.url;

      if (Array.isArray(data.skills) && data.skills.length > 0) {
        currentSkills = data.skills;
      }
      renderSkills();

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

      // Progressive AI Refinement in background (Layer 2 & 3)
      if (data.rawText || data.description) {
        refineWithAiServer(data);
      }
    } else {
      // Manual fallback state with intelligent page title parsing
      statusPill.className = "status-pill status-manual";
      statusText.textContent = "Manual Entry";
      if (tab?.title) {
        const parts = tab.title.split(/[-|–•]/);
        titleInput.value = parts[0]?.trim() || "Software Engineer";
        if (parts[1]) {
          const comp = parts[1].replace(/Indeed.*$/i, "").trim();
          if (comp) companyInput.value = comp;
        }
      } else {
        titleInput.value = "Software Engineer";
        companyInput.value = "Company";
      }
      renderSkills();
    }
  } catch (err) {
    console.warn("Could not query active tab:", err);
    renderSkills();
  }

  // Progressive background AI refinement against JobClippy backend
  async function refineWithAiServer(extractedData) {
    try {
      statusPill.className = "status-pill status-refining";
      statusText.textContent = "✨ AI Refining...";

      const response = await fetch("http://localhost:3000/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: extractedData.url || jobUrl,
          rawText: extractedData.rawText || extractedData.description || "",
          partialFields: {
            title: titleInput.value,
            company: companyInput.value,
            location: locationInput.value,
            salary: salaryInput.value,
            skills: currentSkills,
          },
        }),
      });

      if (response.ok) {
        const json = await response.json();
        if (json.ok && json.data) {
          const ai = json.data;
          if (ai.title && (!titleInput.value || titleInput.value === "Job Opportunity")) {
            titleInput.value = ai.title;
          }
          if (ai.company && (!companyInput.value || companyInput.value === "Company")) {
            companyInput.value = ai.company;
          }
          if (ai.salary && ai.salary !== "Salary not listed") {
            salaryInput.value = ai.salary;
          }
          if (ai.location) {
            locationInput.value = ai.location;
          }
          if (Array.isArray(ai.skills) && ai.skills.length > 0) {
            currentSkills = Array.from(new Set([...currentSkills, ...ai.skills]));
            renderSkills();
          }
          if (ai.summary) {
            jobDescription = ai.summary;
          }

          if (json.isAiVerified) {
            statusPill.className = "status-pill status-ai";
            statusText.textContent = json.fromCache ? "⚡ AI Cached" : "✨ AI Verified";
            return;
          } else {
            statusPill.className = "status-pill status-detected";
            statusText.textContent = "Regex (Click ⚙️ to add AI key)";
            return;
          }
        }
      }
    } catch {
      // Quietly retain optimistic regex values if local dev server isn't reached
    }

    statusPill.className = "status-pill status-detected";
    statusText.textContent = "Job Detected";
  }

  // Handle Save / Clip action
  clipBtn.addEventListener("click", async () => {
    const title = titleInput.value.trim() || "Untitled Opportunity";
    const company = companyInput.value.trim() || "Confidential Company";
    const location = locationInput.value.trim() || "Remote";
    const salary = salaryInput.value.trim() || "Salary not listed";
    const stage = stageSelect.value;
    const note = noteTextarea.value.trim();

    const jobPayload = {
      title,
      company,
      location,
      salary,
      stage,
      skills: currentSkills,
      description: jobDescription || `${title} at ${company}. Clipped from ${jobUrl}`,
      url: jobUrl,
      notes: note ? [{ id: "note-" + Date.now(), text: note, createdAt: new Date().toISOString() }] : [],
    };

    clipBtn.disabled = true;
    clipBtn.classList.add("success");
    btnIcon.textContent = "✓";
    btnLabel.textContent = "[ Clipped! ]";

    feedbackBanner.classList.remove("hidden");

    // Send payload to service worker for local queueing & tab bridge sync
    chrome.runtime.sendMessage({
      type: "SAVE_CLIPPED_JOB",
      job: jobPayload,
    }, (res) => {
      console.log("Job saved response:", res);
    });

    // Provide visual celebration and close smoothly after 1.2s
    setTimeout(() => {
      window.close();
    }, 1200);
  });
});
