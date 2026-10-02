import assert from 'node:assert';

const userPastedText = `Skip to main content
Home
Company reviews
Find salaries
Messages Unread count 0
1
new update
Employers / Post Job
Start of main content
Keyword : all jobs
&nbsp;
Edit location input box label
Find jobs
Welcome to Indeed
Add pay
Add location
You haven't added a resume yet
A resume helps you stand out and apply faster.
Upload a resume
Build a resume
Jobs for you
Video Editor
Easily apply
Iconiqlast
Work from Home
PHP 19,000 - PHP 25,000 a month
Video Editor
Easily apply
Cellexia LTD
Work from Home
PHP 80,000 - PHP 110,000 a month
Full-time +1
Opportunities for promotion
Gym membership
Employee stock ownership plan
Company events
Work from home
Often responds in 1 day
3 hires made in past 30 days
Viral Content Creator
Easily apply
Infront
Work from Home
PHP 87,646 - PHP 117,180 a month
Full-time
Paid training
Pay raise
Opportunities for promotion
Promotion to permanent employee
Work from home
E-Commerce Listing Specialist
Easily apply
Multiple openings
ItsWorthMore.com LLC
Work from Home
PHP 5 an hour
Full-time
Often responds in 3 days
3 hires made in past 30 days
Video Editor
Easily apply
Multiple openings
SUPERVA BUSINESS PROCESS OUTSOURCING SERVICES
•
Remote
•
PHP 48,000 - PHP 49,000 a month
Apply now
Job details
PHP 48,000 - PHP 49,000 a month
Full-time
Remote
Job details
Here’s how the job details align with your profile.
Pay
PHP 48,000 - PHP 49,000 a month
Job type
Full-time
Full job description

Are you a creative, detail-oriented video editor ready to bring stories to life?

Virtual Dream Team is looking for an experienced editor who can transform raw footage into polished, engaging content while maintaining strong visual quality, brand consistency, and clear storytelling.

Key Responsibilities

Edit and assemble raw footage into polished, professional videos
Incorporate graphics, animations, music, captions, and sound effects
Collaborate with team members to understand each project’s goals and creative direction
Ensure all videos follow brand guidelines and quality standards
Review edits carefully and make revisions based on constructive feedback
Manage multiple projects while meeting agreed deadlines
Explore and apply new editing techniques, trend`;

// Clean Description Function
function cleanJobDescription(text) {
  if (!text) return "";
  let cleaned = text;

  // 1. If text contains "Full job description" or "Job description", extract only the content after it!
  const fullDescMarker = cleaned.match(/(?:Full\s+job\s+description|Job\s+description)[\s:\n\r]+/i);
  if (fullDescMarker && fullDescMarker.index !== undefined) {
    cleaned = cleaned.slice(fullDescMarker.index + fullDescMarker[0].length);
  }

  // 2. Strip leading page header noise if marker wasn't found
  cleaned = cleaned
    .replace(/^[\s\S]*?(?:Job\s+details|Here’s\s+how\s+the\s+job\s+details\s+align[\s\S]*?Job\s+type[^\n]*\n)/i, "")
    .replace(/^[\s\S]*?(?:Jobs\s+for\s+you|Search\s+results|Apply\s+now\b[^\n]*\n)/i, "");

  // 3. Strip trailing footer spam
  cleaned = cleaned
    .replace(/(?:Hiring\s+Insights|Report\s+job|Apply\s+(?:on|via)\s+company\s+site|Indeed\s+helps\s+people|©\s*\d{4}\s*Indeed)[\s\S]*$/i, "")
    .replace(/(?:Share\s+this\s+job|Save\s+this\s+job|Similar\s+jobs|Explore\s+more\s+jobs)[\s\S]*$/i, "");

  // 4. Strip leftover repetitive UI button lines
  const noiseLines = [
    /^Apply now$/i,
    /^Easily apply$/i,
    /^Save job$/i,
    /^Job details$/i,
    /^Pay$/i,
    /^Job type$/i,
    /^Remote$/i,
    /^Full-time.*$/i,
    /^Work from Home$/i,
    /^Often responds in \d+ (?:day|days)$/i,
    /^\d+ hires made in past \d+ days$/i,
    /^Multiple openings$/i,
    /^Skip to main content$/i,
    /^Start of main content$/i,
    /^Keyword\s*:.*$/i,
    /^Find jobs$/i,
    /^Company reviews$/i,
    /^Find salaries$/i,
    /^Upload a resume$/i,
    /^Build a resume$/i,
    /^Here’s how the job details align with your profile\.?$/i,
  ];

  const lines = cleaned.split("\n");
  const filtered = lines.filter((l) => {
    const trimmed = l.trim();
    if (!trimmed) return true;
    return !noiseLines.some((r) => r.test(trimmed));
  });

  cleaned = filtered.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  return cleaned;
}

// Salary Regex supporting PHP, USD, etc.
const salaryRegex = /(?:(?:up\s+to|from)\s+)?((?:PHP|₱|\$|£|€|₹|¥|CAD|AUD|SGD|USD)\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?\s*[kK]?(?:\s*(?:-|–|to)\s*(?:PHP|₱|\$|£|€|₹|¥|CAD|AUD|SGD|USD)?\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?\s*[kK]?)?(?:\s*(?:\/|\bper\b|\ba\b)\s*(?:monthly|month|mo|annually|annual|year|yr|hourly|hour|hr|daily|day|weekly|week|wk))?)/i;

function extractSalary(text) {
  if (!text) return "Salary not listed";
  const match = text.match(salaryRegex);
  if (!match) return "Salary not listed";

  let raw = match[0].trim();
  raw = raw
    .replace(/\s+/g, " ")
    .replace(/\s*-\s*|\s*–\s*|\s+to\s+/i, "–")
    .replace(/(\$\d+),000/g, "$1K")
    .replace(/(PHP\s*\d+),000/gi, "$1K")
    .replace(/\s*(?:\/|\bper\b|\ba\b)\s*(?:annually|annual|year|yr)/i, "")
    .replace(/\s*(?:\/|\bper\b|\ba\b)\s*(?:monthly|month|mo)/i, "/mo")
    .replace(/\s*(?:\/|\bper\b|\ba\b)\s*(?:hourly|hour|hr)/i, "/hr");
  return raw;
}

console.log('Testing cleanJobDescription:');
const cleaned = cleanJobDescription(userPastedText);
console.log('Cleaned length:', cleaned.length);
console.log('--- PREVIEW START ---');
console.log(cleaned.slice(0, 300));
console.log('--- PREVIEW END ---');

assert(!cleaned.includes('Skip to main content'), 'Should NOT include Skip to main content');
assert(!cleaned.includes('Company reviews'), 'Should NOT include Company reviews');
assert(!cleaned.includes('Apply now'), 'Should NOT include Apply now');
assert(cleaned.startsWith('Are you a creative, detail-oriented video editor ready to bring stories to life?'), 'Should start with clean job description');
console.log('✓ cleanJobDescription passed cleanly!');

console.log('\nTesting extractSalary on user text:');
// When scoped to the right pane section (from "Video Editor\nSUPERVA" onwards):
const rightPaneSnippet = userPastedText.slice(userPastedText.indexOf('SUPERVA') - 20);
const salary = extractSalary(rightPaneSnippet);
console.log('Extracted salary from right pane:', salary);
assert(salary.includes('PHP 48') || salary.includes('PHP 48K'), 'Should extract PHP 48K salary from right pane');
console.log('✓ extractSalary passed on right pane PHP salary!');
