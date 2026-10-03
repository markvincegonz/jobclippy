# Design: JobStreet Support & Universal AI Section Extractor

## Context

See [proposal.md](proposal.md) for motivation.

Candidates browsing JobStreet and Seek Asia platforms encounter both 2-pane search views (`/web-jobs?jobId=...`) and direct opportunity pages (`/job/...`). Currently, the extension lacks JobStreet platform selectors. Furthermore, as platforms increasingly obfuscate CSS class names and deploy multi-column layouts, relying solely on static class names fails on unknown job sites.

## Goals / Non-Goals

**Goals:**
- Provide first-class extraction for JobStreet (`ph.jobstreet.com`, `jobstreet.com.*`) and Seek (`seek.com.*`).
- Implement a universal semantic reading-pane scorer that dynamically isolates the active job reading pane on arbitrary multi-column layouts.
- Enhance `/api/extract` with active URL and target ID prompts, instructing DeepSeek to disambiguate the active viewed job from surrounding search result cards.
- Canonicalize JobStreet URLs to clean `/job/{jobId}` paths.

**Non-Goals:**
- Crawling entire search result pagination lists in bulk.
- Modifying the PostgreSQL schema or Kanban board UI.

## Decisions

### Decision 1: JobStreet / Seek Platform Extractor
- **Domain Matching**: Detect `window.location.hostname.includes("jobstreet.") || window.location.hostname.includes("seek.")`.
- **Target ID Resolution**: Parse `jobId` from query `/[?&]jobId=([a-zA-Z0-9_-]+)/` or pathname `/job/([a-zA-Z0-9_-]+)`.
- **Targeted Selectors**:
  - Scope container: `[data-automation="jobDetails"], [data-automation="jobAdDetails"], article, main`.
  - Title: `[data-automation="job-detail-title"], [data-automation="jobTitle"], h1`.
  - Company: `[data-automation="advertiser-name"]`.
  - Location: `[data-automation="job-detail-location"]`.
  - Salary: `[data-automation="job-detail-salary"]`.
  - Description: `[data-automation="jobAdDetails"], [data-automation="jobDetails"]`.
- **Same-Origin Detail Fetch**: If `jobId` is present in the URL but the right pane is unmounted, perform a same-origin `fetch('/job/' + jobId)` directly in the content script.
- **Canonical URL**: Normalize to `${window.location.origin}/job/${jobId}`.

### Decision 2: Universal Semantic Reading Pane Scorer
To handle arbitrary job boards without platform-specific code, implement `findActiveJobContainer(targetId)`:
- Evaluate candidate containers (`<main>`, `<article>`, `[role="main"]`, `[role="region"]`, `section`, `div`):
  - **+50 points**: Contains target ID in `data-job-id`, `data-jk`, `id`, or links.
  - **+25 points**: Contains an `<h1>` heading.
  - **+25 points**: Contains job keywords (`Responsibilities`, `Requirements`, `Qualifications`, `About the role`, `Benefits`, `Apply`).
  - **+20 points**: Layout position (`boundingClientRect.left > window.innerWidth * 0.25`) representing the right-hand details pane on 2-pane desktop displays.
  - **-40 points**: Repetitive list structures (`<ul>` with multiple card items) representing search lists.
- Extract text from the highest-scoring container, preventing list pollution.

### Decision 3: AI URL & Section Disambiguation
- Update `buildExtractionPrompt(rawText, partialFields, rawUrl)` in `src/lib/ai/extractor-schema.ts`.
- Pass `rawUrl` from `/api/extract`.
- Include the explicit disambiguation instruction:
  *"Active Job URL: {rawUrl}. If this page contains a list of search result cards alongside an expanded job reading pane, extract and verify ONLY the specific job posting matching the target URL or expanded description. Discard sidebar search lists."*

### Decision 4: URL Normalizer Update
In `src/lib/canonicalize.ts`:
- Detect JobStreet and Seek URLs.
- Strip tracking query parameters (`ref`, `origin`, `type`, `sol`) and hash anchors.
- Standardize `/web-jobs?jobId=12345` to `/job/12345`.

## Risks / Trade-offs

- **[Risk] Obfuscated JobStreet DOM**: If JobStreet updates internal tags, the combination of `data-automation` markers, same-origin `/job/{jobId}` fetch, and the universal semantic scorer ensures triple-redundant resilience.
- **[Risk] Extra Content Script Payload**: The semantic scorer uses standard DOM APIs without external dependencies, maintaining <5ms evaluation time.
