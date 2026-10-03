// JobClippy Universal Content Script Extractor
// Extracts job postings from Indeed, LinkedIn, JSON-LD Schema.org, or active selection.

(function () {
  // Top-frame guard: Never execute extractor inside subframes (ads, trackers, iframes)
  if (typeof window !== "undefined" && window.top !== window) {
    return;
  }

  const COMMON_SKILLS = [
    // Engineering & Dev
    "React", "Next.js", "TypeScript", "JavaScript", "Node.js", "Python", "Go",
    "Rust", "Java", "C++", "SQL", "PostgreSQL", "MongoDB", "Redis", "AWS",
    "GCP", "Azure", "Docker", "Kubernetes", "GraphQL", "REST APIs", "Tailwind CSS",
    "Git", "CI/CD", "Agile", "Playwright", "Jest", "System Design", "Microservices",
    "Linux", "FastAPI", "Django", "Spring Boot", "Terraform", "Prompt Engineering",
    "LLMs", "PyTorch",
    // Design & Creative
    "Figma", "Product Design", "UI/UX", "Graphic Design", "Video Editing",
    "Premiere Pro", "After Effects", "Final Cut Pro", "DaVinci Resolve", "CapCut",
    "Photoshop", "Illustrator", "Motion Graphics", "Animation", "Storytelling",
    "Audio Editing", "Color Grading",
    // Marketing & Operations
    "Social Media", "Content Creation", "Copywriting", "SEO", "E-Commerce",
    "Shopify", "Content Strategy", "Email Marketing", "Virtual Assistant"
  ];

  function extractSalary(text) {
    if (!text) return "Salary not listed";
    const salaryRegex = /(?:(?:up\s+to|from)\s+)?((?:PHP|₱|\$|£|€|₹|¥|CAD|AUD|SGD|USD)\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?\s*[kK]?(?:\s*(?:-|–|to)\s*(?:PHP|₱|\$|£|€|₹|¥|CAD|AUD|SGD|USD)?\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?\s*[kK]?)?(?:\s*(?:\/|\bper\b|\ba\b)\s*(?:monthly|month|mo|annually|annual|year|yr|hourly|hour|hr|daily|day|weekly|week|wk))?)/i;
    const match = text.match(salaryRegex);
    if (!match) return "Salary not listed";

    let raw = match[0].trim();
    raw = raw
      .replace(/\s+/g, " ")
      .replace(/\s*-\s*|\s*–\s*|\s+to\s+/i, "–")
      .replace(/(\$\d+),000/g, "$1K")
      .replace(/(PHP\s*\d+),000/gi, "$1K")
      .replace(/(₱\s*\d+),000/gi, "$1K")
      .replace(/(£\s*\d+),000/gi, "$1K")
      .replace(/(€\s*\d+),000/gi, "$1K")
      .replace(/\s*(?:\/|\bper\b|\ba\b)\s*(?:annually|annual|year|yr)/i, "")
      .replace(/\s*(?:\/|\bper\b|\ba\b)\s*(?:monthly|month|mo)/i, "/mo")
      .replace(/\s*(?:\/|\bper\b|\ba\b)\s*(?:hourly|hour|hr)/i, "/hr");
    return raw;
  }

  function cleanJobDescription(text) {
    if (!text) return "";
    let cleaned = text.trim();

    // 1. If text starts with full-page navigation noise (e.g. from document.body fallback),
    // drop the noise before the job description header marker
    const markerMatch = cleaned.match(/(?:(?:^|\n)(?:Full\s+job\s+description|Job\s+description)[\s:\n\r]+)/i);
    if (markerMatch && markerMatch.index !== undefined && markerMatch.index < cleaned.length * 0.85) {
      cleaned = cleaned.slice(markerMatch.index + markerMatch[0].length).trim();
    }

    // 2. Remove standard platform trailing footer spam (only at the end of the text)
    cleaned = cleaned
      .replace(/\n\s*(?:Hiring\s+Insights|Report\s+job|Indeed\s+helps\s+people|©\s*\d{4}\s*Indeed)[\s\S]*$/i, "")
      .replace(/\n\s*(?:Share\s+this\s+job|Save\s+this\s+job|Similar\s+jobs|Explore\s+more\s+jobs|Report\s+this\s+job\s+ad)[\s\S]*$/i, "")
      .replace(/\n\s*Apply\s+(?:on|via)\s+company\s+site\s*$/i, "");

    // 3. Remove standalone UI button artifact lines
    const uiLineRegex = /^(?:Apply now|Easily apply|Save job|Job details|Pay|Job type|Work from Home|Remote|Full-time|Part-time|Often responds in \d+ (?:day|days)|\d+ hires made in past \d+ days|Multiple openings|Skip to main content|Start of main content|Keyword\s*:.*|Find jobs|Company reviews|Find salaries|Upload a resume|Build a resume|Here’s how the job details align.*)$/i;

    const lines = cleaned.split("\n");
    const filtered = lines.filter((l) => {
      const trimmed = l.trim();
      if (!trimmed) return true;
      return !uiLineRegex.test(trimmed);
    });

    cleaned = filtered.join("\n").replace(/\n{3,}/g, "\n\n").trim();
    return cleaned.slice(0, 4000);
  }

  // Universal Semantic Reading Pane Scorer
  // Evaluates candidate DOM containers to dynamically isolate the active job details pane on arbitrary multi-pane job boards.
  function findActiveJobContainer(targetId) {
    if (typeof document === "undefined" || !document.body) return null;

    const candidates = Array.from(
      document.querySelectorAll(
        "main, article, [role='main'], [role='region'], div[class*='detail'], div[class*='pane'], div[class*='content'], section[class*='detail'], div[id*='detail'], div[id*='view']"
      )
    );

    // Also include any element directly matching the targetId
    if (targetId) {
      const idMatch = document.querySelector(
        `[data-job-id="${targetId}"], [data-jk="${targetId}"], [id*="${targetId}"], [data-id*="${targetId}"]`
      );
      if (idMatch && !candidates.includes(idMatch)) {
        candidates.push(idMatch);
      }
    }

    let bestContainer = null;
    let highestScore = -1;

    for (const el of candidates) {
      const text = el.innerText || el.textContent || "";
      const textLength = text.trim().length;
      if (textLength < 60) continue;

      let score = 0;

      // 1. Target ID matching (+50 points)
      if (targetId) {
        const matchesId =
          el.getAttribute("data-job-id") === targetId ||
          el.getAttribute("data-jk") === targetId ||
          el.id?.includes(targetId) ||
          el.querySelector(`[data-job-id="${targetId}"], [data-jk="${targetId}"], a[href*="${targetId}"]`);
        if (matchesId) {
          score += 50;
        }
      }

      // 2. Heading presence (+25 points)
      const hasHeading = el.querySelector("h1, h2");
      if (hasHeading && (hasHeading.textContent?.trim().length || 0) > 3) {
        score += 25;
      }

      // 3. Job keyword density (+25 points)
      const keywordRegex = /\b(?:responsibilities|requirements|qualifications|about the role|what you'll do|who you are|benefits|compensation|apply now|job description|overview)\b/i;
      if (keywordRegex.test(text)) {
        score += 25;
      }

      // 4. Text substance (+15 points for substantial text)
      if (textLength >= 300 && textLength <= 8000) {
        score += 15;
      }

      // 5. Layout positioning (+20 points for right-hand or centered reading pane)
      try {
        const rect = el.getBoundingClientRect();
        const viewportWidth = window.innerWidth || 1200;
        if (rect.width >= 320 && rect.left >= viewportWidth * 0.2) {
          score += 20;
        } else if (rect.width >= 450) {
          score += 10;
        }
      } catch {}

      // 6. Penalty for repetitive card list structures (-40 points)
      const listItems = el.querySelectorAll("li, article, div[class*='card'], div[class*='item'], div[data-testid*='job']");
      if (listItems.length >= 4 && el.querySelectorAll("h1").length === 0) {
        score -= 40;
      }

      if (score > highestScore && score >= 35) {
        highestScore = score;
        bestContainer = el;
      }
    }

    return bestContainer;
  }

  const SKILL_ALIASES = [
    { regex: /\bvideo\s+edit(?:or|ing|s)?\b/i, skill: "Video Editing" },
    { regex: /\bgraphic\s+design(?:er|ing)?\b/i, skill: "Graphic Design" },
    { regex: /\bcontent\s+creat(?:or|ion|ing)\b/i, skill: "Content Creation" },
    { regex: /\bcopywrit(?:er|ing)\b/i, skill: "Copywriting" },
    { regex: /\bfront(?:-| )?end\b/i, skill: "Frontend" },
    { regex: /\bback(?:-| )?end\b/i, skill: "Backend" },
    { regex: /\bfull(?:-| )?stack\b/i, skill: "Full Stack" },
    { regex: /\bmachine\s+learning\b/i, skill: "Machine Learning" }
  ];

  function extractSkills(text) {
    if (!text) return ["React", "TypeScript"];
    const found = new Set();
    for (const skill of COMMON_SKILLS) {
      const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(?:\\b|[^a-zA-Z0-9])${escaped}(?:\\b|[^a-zA-Z0-9])`, "i");
      if (regex.test(text)) {
        found.add(skill);
      }
    }
    for (const alias of SKILL_ALIASES) {
      if (alias.regex.test(text)) {
        found.add(alias.skill);
      }
    }
    const arr = Array.from(found);
    return arr.length > 0 ? arr : ["React", "TypeScript"];
  }

  function stripHtml(html) {
    if (!html) return "";
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  }

  // 1. Schema.org JSON-LD Parser
  function extractFromSchemaOrg() {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (const script of scripts) {
      try {
        let json = JSON.parse(script.textContent || "{}");
        if (Array.isArray(json)) json = json[0];
        if (json["@graph"] && Array.isArray(json["@graph"])) {
          json = json["@graph"].find((item) => item["@type"] === "JobPosting") || json;
        }

        if (json && (json["@type"] === "JobPosting" || json["@type"]?.includes?.("JobPosting"))) {
          const title = json.title || json.name || "";
          const company = json.hiringOrganization?.name || "";
          let location = "Remote";
          if (json.jobLocationType === "TELECOMMUTE") {
            location = "Remote";
          } else if (json.jobLocation?.address) {
            const addr = json.jobLocation.address;
            const parts = [addr.addressLocality, addr.addressRegion, addr.addressCountry].filter(Boolean);
            if (parts.length > 0) location = parts.join(", ");
          }

          let salary = "Salary not listed";
          if (json.baseSalary) {
            const val = json.baseSalary.value;
            const curr = json.baseSalary.currency === "PHP" ? "PHP " : "$";
            if (val && typeof val === "object") {
              const min = val.minValue ? `${curr}${Math.round(val.minValue / 1000)}K` : "";
              const max = val.maxValue ? `${curr}${Math.round(val.maxValue / 1000)}K` : "";
              if (min && max) salary = `${min}–${max}`;
              else if (min || max) salary = min || max;
            }
          }

          const desc = stripHtml(json.description || "");
          if (salary === "Salary not listed") {
            salary = extractSalary(desc);
          }

          if (title && company) {
            return {
              title: title.trim(),
              company: company.trim(),
              location: location.trim(),
              salary: salary.trim(),
              skills: extractSkills((title || "") + " " + (desc || "")),
              description: desc.slice(0, 3000),
              rawText: desc.slice(0, 4000),
              partialFields: {
                title: title.trim(),
                company: company.trim(),
                location: location.trim(),
                salary: salary.trim(),
                skills: extractSkills((title || "") + " " + (desc || "")),
              },
              url: window.location.href,
              source: "schema",
            };
          }
        }
      } catch {
        // Skip unparsable script tags
      }
    }
    return null;
  }

  // 2. LinkedIn DOM Extractor
  function extractFromLinkedIn() {
    if (!window.location.hostname.includes("linkedin.com")) return null;

    const titleEl = document.querySelector(
      ".job-details-jobs-unified-top-card__job-title, .jobs-unified-top-card__job-title, h1.t-24, .jobs-details__main-content h1"
    );
    const companyEl = document.querySelector(
      ".job-details-jobs-unified-top-card__company-name, .jobs-unified-top-card__company-name, a.ember-view.t-black--light"
    );
    const locationEl = document.querySelector(
      ".job-details-jobs-unified-top-card__bullet, .jobs-unified-top-card__bullet, .jobs-details__main-content span[class*='bullet']"
    );
    const descEl = document.querySelector(
      "#job-details, .jobs-description__content, .jobs-box__html-content"
    );

    if (titleEl) {
      const title = titleEl.textContent?.trim() || "";
      const company = companyEl ? companyEl.textContent?.trim() : "LinkedIn Job";
      const location = locationEl ? locationEl.textContent?.trim() : "Remote";
      const desc = descEl ? descEl.textContent?.trim() || "" : "";
      const salary = extractSalary(document.body.innerText);

      return {
        title,
        company,
        location,
        salary,
        skills: extractSkills((title || "") + " " + (desc || "")),
        description: cleanJobDescription(desc) || desc.slice(0, 3000),
        rawText: (desc || document.body?.innerText || "").slice(0, 4000),
        partialFields: {
          title,
          company,
          location,
          salary,
          skills: extractSkills((title || "") + " " + (desc || "")),
        },
        url: window.location.href,
        source: "linkedin",
      };
    }
    return null;
  }

  // 3. Indeed DOM Extractor
  async function extractFromIndeed() {
    if (!window.location.hostname.includes("indeed.")) return null;

    // Detect target jk/vjk from URL parameters
    const vjkMatch = window.location.search.match(/[?&]v?jk=([a-zA-Z0-9_-]+)/);
    const targetJk = vjkMatch ? vjkMatch[1] : null;

    // Detect if we are on a two-pane search results page with an active right preview pane
    const rightPaneSelectors = [
      "div#jobsearch-ViewjobPaneWrapper",
      "div[data-testid='jobsearch-ViewjobPaneWrapper']",
      "div.jobsearch-RightPane",
      "div#vjs-container",
      "div.fastviewjob",
      "div#viewJobSSRRoot",
      "div.jobsearch-JobComponent"
    ];

    let activePane = null;

    // 1. Check for preview iframe (common in Indeed split views)
    const iframes = document.querySelectorAll(
      "iframe#vjs-container-iframe, iframe[name*='vjs'], iframe[title*='Job details'], iframe[src*='viewjob']"
    );
    for (const iframe of iframes) {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (doc && (doc.querySelector("#jobDescriptionText, [data-testid='jobDescriptionText'], .jobsearch-JobInfoHeader-title") || (doc.body?.innerText?.length || 0) > 50)) {
          activePane = doc.body;
          break;
        }
      } catch {}
    }

    // 2. Check main DOM rightPaneSelectors
    if (!activePane) {
      for (const sel of rightPaneSelectors) {
        const el = document.querySelector(sel);
        if (el && el.innerText && el.innerText.trim().length > 30) {
          if (el.querySelector("#jobDescriptionText, [data-testid='jobDescriptionText'], h1, h2, #salaryInfoAndJobType")) {
            activePane = el;
            break;
          }
        }
      }
    }

    // 3. Check for specific clicked job card in left list if targetJk is known
    let targetedCard = null;
    if (targetJk) {
      targetedCard = document.querySelector(
        `[data-jk="${targetJk}"], a[href*="${targetJk}"], [data-mobtk*="${targetJk}"]`
      )?.closest(".job_seen_beacon, .tapItem, li, div[class*='jobCard']");
    }

    // Scoped container: prioritize activePane, then targetedCard, else fallback to document
    const scope = activePane || targetedCard || document;

    const queryInScope = (selectors) => {
      for (const sel of selectors) {
        const found = scope.querySelector(sel);
        if (found && found.textContent?.trim()) return found;
      }
      return null;
    };

    // 1. Job Title
    const titleSelectors = [
      "h1[data-testid='jobsearch-JobInfoHeader-title']",
      "h2[data-testid='jobsearch-JobInfoHeader-title']",
      "[data-testid='jobsearch-JobInfoHeader-title']",
      "[data-testid='viewJobTitle']",
      "[data-testid='simpler-job-title']",
      ".jobsearch-JobInfoHeader-title",
      "h1.jobTitle",
      "h2.jobTitle",
      ".fastviewjob-job-title",
      "#vjs-jobtitle",
      "h1"
    ];
    let titleEl = queryInScope(titleSelectors);

    // If targetedCard exists and title not found in activePane, query targetedCard specifically
    if (!titleEl && targetedCard) {
      titleEl = targetedCard.querySelector("h2.jobTitle span, h2.jobTitle a, .jobTitle");
    }

    // If no right pane and no title found yet, check for selected job card in search list
    if (!titleEl && !activePane) {
      titleEl = document.querySelector(
        ".job_seen_beacon.selected h2.jobTitle span, .tapItem.selected h2.jobTitle span"
      );
    }
    let title = titleEl ? titleEl.textContent?.trim() : "";

    // Prevent generic Indeed page title like "Job Search" from being treated as job title
    if (/^(?:Job Search|Jobs, Employment|Find Jobs)$/i.test(title)) {
      title = "";
    }

    // 2. Company Name
    const companySelectors = [
      "[data-testid='inlineHeader-companyName']",
      "[data-testid='jobsearch-CompanyReview--heading']",
      "[data-company-name='true']",
      "[data-testid='company-name']",
      ".jobsearch-CompanyInfoContainer a",
      ".jobsearch-CompanyInfoContainer div",
      "div.jobsearch-InlineCompanyRating a",
      "div.jobsearch-InlineCompanyRating",
      "#vjs-cn",
      ".vjs-cn"
    ];
    let companyEl = queryInScope(companySelectors);

    if (!companyEl && targetedCard) {
      companyEl = targetedCard.querySelector("span[data-testid='company-name'], .companyName, a[href*='/cmp/']");
    }

    if (!companyEl && !activePane) {
      companyEl = document.querySelector(
        ".job_seen_beacon.selected span[data-testid='company-name'], .job_seen_beacon.selected .companyName"
      );
    }
    let company = companyEl ? companyEl.textContent?.trim() : "";

    // 3. Location
    const locationSelectors = [
      "[data-testid='inlineHeader-companyLocation']",
      "[data-testid='job-location']",
      "[data-testid='text-location']",
      ".jobsearch-JobInfoHeader-companyLocation",
      "div[data-testid='jobsearch-CompanyInfoContainer'] > div:nth-child(2)",
      "#vjs-loc",
      ".vjs-loc"
    ];
    let locationEl = queryInScope(locationSelectors);

    if (!locationEl && targetedCard) {
      locationEl = targetedCard.querySelector("[data-testid='text-location'], div.companyLocation");
    }

    if (!locationEl && !activePane) {
      locationEl = document.querySelector(
        ".job_seen_beacon.selected [data-testid='text-location'], .job_seen_beacon.selected div.companyLocation"
      );
    }
    let location = locationEl ? locationEl.textContent?.trim() : "Remote";

    // 4. Description
    const descSelectors = [
      "#jobDescriptionText",
      "[data-testid='jobDescriptionText']",
      ".jobsearch-jobDescriptionText",
      ".jobsearch-JobComponent-description",
      "#jobDescriptionSection",
      "#vjs-desc",
      ".vjs-content"
    ];
    let descEl = queryInScope(descSelectors);
    let desc = "";

    if (descEl) {
      desc = descEl.innerText?.trim() || descEl.textContent?.trim() || "";
      desc = cleanJobDescription(desc);
    } else if (activePane) {
      desc = cleanJobDescription(activePane.innerText || "");
    }

    // 5. Salary
    const salarySelectors = [
      "#salaryInfoAndJobType",
      "[data-testid='attribute_snippets_section']",
      "div[data-testid*='salary']",
      ".jobsearch-JobMetadataHeader-item",
      "#jobDetailsSection [data-testid='attribute_snippets_section']",
      "#salary-guide",
      ".salary-snippet-container"
    ];
    let salaryEl = queryInScope(salarySelectors);
    let salary = "Salary not listed";
    if (salaryEl) {
      salary = extractSalary(salaryEl.textContent || "");
    }
    if (salary === "Salary not listed" && activePane) {
      salary = extractSalary(activePane.innerText);
    }
    if (salary === "Salary not listed" && desc) {
      salary = extractSalary(desc);
    }
    if (salary === "Salary not listed" && targetedCard) {
      const cardSalary = targetedCard.querySelector(".salary-snippet-container");
      if (cardSalary) salary = extractSalary(cardSalary.textContent || "");
    }

    // 6. Direct Job URL
    let url = window.location.href;
    if (targetJk) {
      url = `${window.location.origin}/viewjob?jk=${targetJk}`;
    } else {
      const directLink = scope.querySelector("a[href*='/viewjob?jk='], a[href*='/rc/clk?jk=']");
      if (directLink && directLink.href) {
        url = directLink.href;
      }
    }

    // 7. Same-origin /viewjob fetch fallback if targetJk is known but preview pane was unmounted or incomplete
    if (targetJk && (!desc || desc.length < 50 || !title)) {
      try {
        const fetchUrl = `${window.location.origin}/viewjob?jk=${targetJk}`;
        const res = await fetch(fetchUrl);
        if (res.ok) {
          const html = await res.text();
          const fetchedDoc = new DOMParser().parseFromString(html, "text/html");
          const fetchedTitleEl = fetchedDoc.querySelector(
            "h1[data-testid='jobsearch-JobInfoHeader-title'], .jobsearch-JobInfoHeader-title, h1"
          );
          const fetchedTitle = fetchedTitleEl?.textContent?.trim();
          if (fetchedTitle && !/^(?:Job Search|Jobs, Employment|Find Jobs)$/i.test(fetchedTitle)) {
            title = fetchedTitle;
          }

          const fetchedCompanyEl = fetchedDoc.querySelector(
            "[data-testid='inlineHeader-companyName'], .jobsearch-CompanyInfoContainer a"
          );
          if (fetchedCompanyEl?.textContent?.trim() && (!company || company === "Indeed Employer")) {
            company = fetchedCompanyEl.textContent.trim();
          }

          const fetchedLocEl = fetchedDoc.querySelector(
            "[data-testid='inlineHeader-companyLocation'], [data-testid='job-location']"
          );
          if (fetchedLocEl?.textContent?.trim()) {
            location = fetchedLocEl.textContent.trim();
          }

          const fetchedDescEl = fetchedDoc.querySelector("#jobDescriptionText, [data-testid='jobDescriptionText']");
          if (fetchedDescEl) {
            desc = cleanJobDescription(fetchedDescEl.innerText || fetchedDescEl.textContent || "");
          }

          if (salary === "Salary not listed") {
            const fetchedSalaryEl = fetchedDoc.querySelector("#salaryInfoAndJobType, [data-testid='attribute_snippets_section']");
            if (fetchedSalaryEl) salary = extractSalary(fetchedSalaryEl.textContent || "");
            if (salary === "Salary not listed" && desc) salary = extractSalary(desc);
          }
        }
      } catch (err) {
        console.warn("Viewjob fetch fallback warning:", err);
      }
    }

    // 8. Fallback to document.title only if title missing and title is NOT generic site header
    if (!title && document.title.includes("Indeed")) {
      const isGeneric = /^(?:Job Search|Jobs, Employment|Find Jobs|Indeed)/i.test(document.title.trim());
      if (!isGeneric) {
        const parts = document.title.replace(/\s*[-–|•]\s*Indeed.*$/i, "").split(/\s*[-–|•]\s*/);
        if (parts[0] && !/^(?:Job Search|Jobs, Employment|Find Jobs)/i.test(parts[0].trim())) {
          title = parts[0].trim();
        }
        if (parts[1] && !company) company = parts[1].trim();
      }
    }

    if (title) {
      return {
        title,
        company: company || "Indeed Employer",
        location: location || "Remote",
        salary,
        skills: extractSkills((title || "") + " " + (desc || "")),
        description: desc.slice(0, 4000),
        rawText: (desc || (activePane ? activePane.innerText : "") || "").slice(0, 4000),
        partialFields: {
          title,
          company: company || "Indeed Employer",
          location: location || "Remote",
          salary,
          skills: extractSkills((title || "") + " " + (desc || "")),
        },
        url,
        source: "indeed",
      };
    }

    return null;
  }

  // 4. JobStreet & Seek DOM Extractor
  async function extractFromJobStreet() {
    const hostname = typeof window !== "undefined" ? window.location.hostname : "";
    if (!hostname.includes("jobstreet.") && !hostname.includes("seek.") && !hostname.includes("jobsdb.")) {
      return null;
    }

    // Detect target jobId from query parameter or pathname
    const queryMatch = window.location.search.match(/[?&]jobId=([a-zA-Z0-9_-]+)/i);
    const pathMatch = window.location.pathname.match(/\/job\/([a-zA-Z0-9_-]+)/i);
    const targetJobId = queryMatch ? queryMatch[1] : (pathMatch ? pathMatch[1] : null);

    // Candidates for JobStreet / Seek reading pane
    const rightPaneSelectors = [
      "[data-automation='jobDetails']",
      "[data-automation='jobAdDetails']",
      "[data-automation='job-details-page']",
      "[data-automation='split-view-job-details']",
      "article[data-automation*='job']",
      "main"
    ];

    let activePane = null;
    for (const sel of rightPaneSelectors) {
      const el = document.querySelector(sel);
      if (el && (el.innerText || "").trim().length > 40) {
        activePane = el;
        break;
      }
    }

    // If activePane not found with static selectors, try semantic container scorer
    if (!activePane) {
      activePane = findActiveJobContainer(targetJobId);
    }

    // Check for targeted job card in search list if jobId is known
    let targetedCard = null;
    if (targetJobId) {
      targetedCard = document.querySelector(
        `[data-job-id="${targetJobId}"], a[href*="${targetJobId}"]`
      )?.closest("[data-automation='job-card'], article, li, div[class*='jobCard']");
    }

    const scope = activePane || targetedCard || document;

    const queryInScope = (selectors) => {
      for (const sel of selectors) {
        const found = scope.querySelector(sel);
        if (found && found.textContent?.trim()) return found;
      }
      return null;
    };

    // 1. Job Title
    const titleSelectors = [
      "[data-automation='job-detail-title']",
      "[data-automation='jobTitle']",
      "[data-automation='job-title']",
      "h1[data-automation]",
      "h1",
      "h2[data-automation='jobTitle']"
    ];
    let titleEl = queryInScope(titleSelectors);
    if (!titleEl && targetedCard) {
      titleEl = targetedCard.querySelector("[data-automation='jobTitle'], a, h3, h2");
    }
    let title = titleEl ? titleEl.textContent?.trim() : "";

    // Ignore generic site headers
    if (/^(?:Jobs in|Job Search|Career Opportunities|JobStreet|Seek|Find Jobs)$/i.test(title)) {
      title = "";
    }

    // 2. Company Name
    const companySelectors = [
      "[data-automation='advertiser-name']",
      "[data-automation='job-company']",
      "a[data-automation='advertiser-name']",
      "span[data-automation='advertiser-name']"
    ];
    let companyEl = queryInScope(companySelectors);
    if (!companyEl && targetedCard) {
      companyEl = targetedCard.querySelector("[data-automation='advertiser-name'], [class*='advertiser'], [class*='company']");
    }
    let company = companyEl ? companyEl.textContent?.trim() : "";

    // 3. Location
    const locationSelectors = [
      "[data-automation='job-detail-location']",
      "[data-automation='job-location']",
      "[data-automation='jobLocation']",
      "span[data-automation*='location']"
    ];
    let locationEl = queryInScope(locationSelectors);
    if (!locationEl && targetedCard) {
      locationEl = targetedCard.querySelector("[data-automation='job-location'], [class*='location']");
    }
    let location = locationEl ? locationEl.textContent?.trim() : "Remote";

    // 4. Description
    const descSelectors = [
      "[data-automation='jobAdDetails']",
      "[data-automation='jobDetails']",
      "[data-automation='job-details']",
      "div[data-automation='jobDescription']"
    ];
    let descEl = queryInScope(descSelectors);
    let desc = "";
    if (descEl) {
      desc = descEl.innerText?.trim() || descEl.textContent?.trim() || "";
      desc = cleanJobDescription(desc);
    } else if (activePane) {
      desc = cleanJobDescription(activePane.innerText || "");
    }

    // 5. Salary
    const salarySelectors = [
      "[data-automation='job-detail-salary']",
      "[data-automation='job-salary']",
      "[data-automation='jobSalary']",
      "span[data-automation*='salary']"
    ];
    let salaryEl = queryInScope(salarySelectors);
    let salary = "Salary not listed";
    if (salaryEl) {
      salary = extractSalary(salaryEl.textContent || "");
    }
    if (salary === "Salary not listed" && activePane) {
      salary = extractSalary(activePane.innerText);
    }
    if (salary === "Salary not listed" && desc) {
      salary = extractSalary(desc);
    }
    if (salary === "Salary not listed" && targetedCard) {
      salary = extractSalary(targetedCard.textContent || "");
    }

    // 6. Canonical Job URL
    let url = window.location.href;
    if (targetJobId) {
      url = `${window.location.origin}/job/${targetJobId}`;
    } else {
      const link = scope.querySelector("a[href*='/job/']");
      if (link && link.href) {
        url = link.href.split("?")[0];
      }
    }

    // 7. Same-origin /job/{jobId} fetch fallback if 2-pane preview elements were unmounted or delayed
    if (targetJobId && (!desc || desc.length < 50 || !title)) {
      try {
        const fetchUrl = `${window.location.origin}/job/${targetJobId}`;
        const res = await fetch(fetchUrl);
        if (res.ok) {
          const html = await res.text();
          const fetchedDoc = new DOMParser().parseFromString(html, "text/html");

          const fetchedTitleEl = fetchedDoc.querySelector(
            "[data-automation='job-detail-title'], [data-automation='jobTitle'], h1"
          );
          if (fetchedTitleEl?.textContent?.trim()) {
            title = fetchedTitleEl.textContent.trim();
          }

          const fetchedCompanyEl = fetchedDoc.querySelector("[data-automation='advertiser-name']");
          if (fetchedCompanyEl?.textContent?.trim() && (!company || company === "JobStreet Employer")) {
            company = fetchedCompanyEl.textContent.trim();
          }

          const fetchedLocEl = fetchedDoc.querySelector("[data-automation='job-detail-location']");
          if (fetchedLocEl?.textContent?.trim()) {
            location = fetchedLocEl.textContent.trim();
          }

          const fetchedDescEl = fetchedDoc.querySelector("[data-automation='jobAdDetails'], [data-automation='jobDetails']");
          if (fetchedDescEl) {
            desc = cleanJobDescription(fetchedDescEl.innerText || fetchedDescEl.textContent || "");
          }

          if (salary === "Salary not listed") {
            const fetchedSalaryEl = fetchedDoc.querySelector("[data-automation='job-detail-salary']");
            if (fetchedSalaryEl) salary = extractSalary(fetchedSalaryEl.textContent || "");
            if (salary === "Salary not listed" && desc) salary = extractSalary(desc);
          }
        }
      } catch (err) {
        console.warn("JobStreet /job fetch fallback warning:", err);
      }
    }

    // Fallback title from document.title if not found
    if (!title && document.title.includes("JobStreet")) {
      const parts = document.title.replace(/\s*[-–|•]\s*JobStreet.*$/i, "").split(/\s*[-–|•]\s*/);
      if (parts[0]) title = parts[0].trim();
      if (parts[1] && !company) company = parts[1].trim();
    }

    if (title) {
      return {
        title,
        company: company || "JobStreet Employer",
        location: location || "Remote",
        salary,
        skills: extractSkills((title || "") + " " + (desc || "")),
        description: desc.slice(0, 4000),
        rawText: (desc || (activePane ? activePane.innerText : "") || "").slice(0, 4000),
        partialFields: {
          title,
          company: company || "JobStreet Employer",
          location: location || "Remote",
          salary,
          skills: extractSkills((title || "") + " " + (desc || "")),
        },
        url,
        source: "jobstreet",
      };
    }

    return null;
  }

  // 5. Highlighted Text Fallback
  function extractFromSelection() {
    const sel = window.getSelection()?.toString().trim();
    if (!sel || sel.length < 5) return null;

    const lines = sel.split("\n").map((l) => l.trim()).filter(Boolean);
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

    return {
      title,
      company,
      location,
      salary: extractSalary(sel),
      skills: extractSkills(sel),
      description: sel.slice(0, 3000),
      rawText: sel.slice(0, 4000),
      partialFields: {
        title,
        company,
        location,
        salary: extractSalary(sel),
        skills: extractSkills(sel),
      },
      url: window.location.href,
      source: "selection",
    };
  }

  // Master Extraction Routine
  async function extractJob() {
    const hostname = typeof window !== "undefined" ? window.location.hostname : "";

    // 1. Site-Specific Extractors (Run FIRST on their respective domains!)
    if (hostname.includes("indeed.")) {
      const fromIndeed = await extractFromIndeed();
      if (fromIndeed) return fromIndeed;
    }

    if (hostname.includes("linkedin.com")) {
      const fromLinkedIn = extractFromLinkedIn();
      if (fromLinkedIn) return fromLinkedIn;
    }

    if (hostname.includes("jobstreet.") || hostname.includes("seek.") || hostname.includes("jobsdb.")) {
      const fromJobStreet = await extractFromJobStreet();
      if (fromJobStreet) return fromJobStreet;
    }

    // 2. Try JSON-LD Schema.org for structured postings
    const fromSchema = extractFromSchemaOrg();
    if (fromSchema) return fromSchema;

    // 3. Try User Text Selection (if user highlighted a job description or summary)
    const fromSelection = extractFromSelection();
    if (fromSelection) return fromSelection;

    // 4. Fallback site-specific check if domain matched non-standard pattern
    const fromIndeedFallback = await extractFromIndeed();
    if (fromIndeedFallback) return fromIndeedFallback;

    const fromLinkedInFallback = extractFromLinkedIn();
    if (fromLinkedInFallback) return fromLinkedInFallback;

    const fromJobStreetFallback = await extractFromJobStreet();
    if (fromJobStreetFallback) return fromJobStreetFallback;

    // 5. Generic Document Fallback with Universal Semantic Reading Pane Scorer
    const targetUrlId = (
      window.location.search.match(/[?&](?:jobId|jk|id|job_id)=([a-zA-Z0-9_-]+)/i) ||
      window.location.pathname.match(/\/(?:jobs|job|position|career|view)\/([a-zA-Z0-9_-]+)/i)
    )?.[1] || null;

    const activeContainer = findActiveJobContainer(targetUrlId);

    let guessedTitle = "";
    if (activeContainer) {
      const heading = activeContainer.querySelector("h1, h2");
      if (heading && heading.textContent?.trim().length > 3) {
        guessedTitle = heading.textContent.trim();
      }
    }

    if (!guessedTitle) {
      const pageTitle = document.title || "";
      guessedTitle = pageTitle.split(/[-|–•]/)[0]?.trim() || "Job Opportunity";
      if (/^(?:Job Search|Jobs, Employment|Find Jobs|Careers)$/i.test(guessedTitle)) {
        guessedTitle = "Job Opportunity";
      }
    }

    let guessedCompany = "";
    if (activeContainer) {
      const companyEl = activeContainer.querySelector("[class*='company'], [class*='employer'], [data-company]");
      if (companyEl && companyEl.textContent?.trim().length > 1) {
        guessedCompany = companyEl.textContent.trim();
      }
    }
    if (!guessedCompany) {
      guessedCompany = (document.title || "").split(/[-|–•]/)[1]?.trim() || "Company";
    }

    const bodyText = cleanJobDescription(
      activeContainer ? (activeContainer.innerText || "") : (document.body?.innerText || "")
    );
    const salary = extractSalary(
      activeContainer ? activeContainer.innerText : (document.body?.innerText || "")
    );

    return {
      title: guessedTitle,
      company: guessedCompany,
      location: "Remote",
      salary,
      skills: extractSkills((guessedTitle || "") + " " + (bodyText || "")),
      description: bodyText.slice(0, 3000),
      rawText: bodyText.slice(0, 4000),
      partialFields: {
        title: guessedTitle,
        company: guessedCompany,
        location: "Remote",
        salary,
        skills: extractSkills((guessedTitle || "") + " " + (bodyText || "")),
      },
      url: window.location.href,
      source: "generic",
    };
  }

  // Listen for messages from popup or background service worker
  if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === "EXTRACT_JOB_DETAILS") {
        Promise.resolve(extractJob())
          .then((data) => {
            sendResponse({ ok: true, data });
          })
          .catch((err) => {
            sendResponse({ ok: false, error: err.message });
          });
      }
      return true; // keeps channel open for async response
    });
  }

  // Expose on window for testing
  if (typeof window !== "undefined") {
    window.__JobClippyExtractor = {
      extractJob,
      extractSalary,
      extractSkills,
      cleanJobDescription,
      findActiveJobContainer,
      extractFromSchemaOrg,
      extractFromLinkedIn,
      extractFromIndeed,
      extractFromJobStreet,
      extractFromSelection,
    };
  }
})();
