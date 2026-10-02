# Chrome Web Store Listing & Publication Blueprint

> Single source of truth for JobClippy Chrome Web Store metadata, permissions justifications, and privacy disclosures.

---

## 1. Store Metadata

- **Extension Name:** JobClippy — Universal Job Clipper
- **Short Description:** Save job opportunities from LinkedIn, Indeed, and any career portal directly into your JobClippy pipeline in one click.
- **Category:** Productivity
- **Primary Language:** English
- **Pricing:** Free

### Detailed Description

```
JobClippy is the ambient companion for candidates and tech job hunters.

Tired of copying and pasting job descriptions, salaries, and company names between endless browser tabs and spreadsheets? JobClippy lets you track opportunities directly from where you find them.

⚡ FEATURES:
• One-Click Universal Clipper: Automatically parses Job Title, Company, Location, Salary, and Key Skills from LinkedIn, Indeed, and modern ATS career portals (Greenhouse, Lever, Ashby, and Workday).
• Highlight-to-Clip Fallback: Highlight text on any company page, right-click, and select "Save Highlighted Job to JobClippy".
• Linear-Grade Dark Interface: Clean preview card allows inline edits, skill tag adjustments, and target pipeline stage selection (Wishlist, Applied, Interviewing).
• Real-time Dashboard Sync: Synchronizes clipped jobs directly with your JobClippy Kanban Board and High-Density Applications Table without losing your place.
• Fast & Offline-Resilient: Built on modern Chrome Manifest V3 standards with local storage queueing.

Take control of your job search with JobClippy.
```

---

## 2. Permissions Justifications

| Permission | Technical Reason | Plain-English Reviewer Justification |
| :--- | :--- | :--- |
| `storage` | `chrome.storage.local` | Stores pending clipped jobs locally when the user is offline or the dashboard tab is closed. |
| `contextMenus` | `chrome.contextMenus.create` | Adds the right-click "Save Highlighted Job to JobClippy" context menu item for user-selected text. |
| `activeTab` | Temporary active tab access | Allows the popup to query the active tab's URL and title upon user click. |
| `tabs` | `chrome.tabs.query` | Queries whether an open JobClippy dashboard tab exists to relay clipped job updates in real time. |
| `host_permissions` (`http://*/*`, `https://*/*`) | Content script matching | Required to detect job postings on LinkedIn, Indeed, and diverse career portals. |

---

## 3. Privacy & Data Practices

- **Data Collection:** JobClippy collects job listing attributes (job title, company name, location, compensation, skills, and URL) solely when initiated by the user (clicking "[ Clip to JobClippy ]" or selecting the context menu).
- **Data Transmission:** All captured data is stored locally within the user's browser (`chrome.storage.local` and `localStorage`). No data is transmitted to third-party tracking services or sold to third parties.
- **Account Credentials:** The extension does not collect passwords, user credentials, or financial information.

---

## 4. How to Load Unpacked for Development

1. Open Google Chrome and navigate to `chrome://extensions`.
2. Toggle on **Developer mode** in the top-right corner.
3. Click **Load unpacked**.
4. Select the `extension/` directory inside this repository.
5. The JobClippy extension icon will appear in your browser toolbar ready to clip!
