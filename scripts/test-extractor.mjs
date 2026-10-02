import fs from 'node:fs';
import assert from 'node:assert';

// Mock DOM environment for Node testing
class MockDOMParser {
  parseFromString(str) {
    return {
      body: {
        textContent: str.replace(/<[^>]*>/g, ' ')
      }
    };
  }
}

globalThis.DOMParser = MockDOMParser;
globalThis.window = {
  location: { href: 'https://linear.app/careers/staff-frontend', hostname: 'linear.app', search: '', origin: 'https://linear.app' },
  getSelection: () => ({ toString: () => '' })
};
globalThis.window.top = globalThis.window; // mock top frame

globalThis.document = {
  title: 'Staff Frontend Engineer - Linear',
  querySelectorAll: () => [],
  querySelector: () => null,
  body: { innerText: 'Looking for a Staff Frontend Engineer with React, TypeScript, Next.js. Offering $180,000 - $220,000 annual compensation.' }
};

// Load extractor code into context
const code = fs.readFileSync('extension/content/extractor.js', 'utf8');
eval(code);

const extractor = globalThis.window.__JobClippyExtractor;
assert(extractor, 'Extractor should be registered on window');

console.log('Testing salary extraction:');
const s1 = extractor.extractSalary('Salary: $140,000 - $180,000 / year');
assert.strictEqual(s1, '$140K–$180K');
console.log('✓ Salary range formatted:', s1);

const s2 = extractor.extractSalary('PHP 48,000 - PHP 49,000 a month');
assert.strictEqual(s2, 'PHP 48K–PHP 49K/mo');
console.log('✓ Philippine Peso salary formatted:', s2);

console.log('Testing skills extraction:');
const skills = extractor.extractSkills('Requires Video Editing, Premiere Pro, After Effects, and Storytelling.');
assert(skills.includes('Video Editing'));
assert(skills.includes('Premiere Pro'));
assert(skills.includes('After Effects'));
assert(skills.includes('Storytelling'));
console.log('✓ Video editing skills extracted:', skills);

console.log('Testing Schema.org JSON-LD extraction:');
document.querySelectorAll = (sel) => {
  if (sel.includes('application/ld+json')) {
    return [{
      textContent: JSON.stringify({
        '@type': 'JobPosting',
        title: 'Staff Frontend Engineer',
        hiringOrganization: { name: 'Linear' },
        jobLocationType: 'TELECOMMUTE',
        baseSalary: {
          value: { minValue: 180000, maxValue: 220000, unitText: 'YEAR' }
        },
        description: '<p>Join our team building Linear. Requires React and TypeScript.</p>'
      })
    }];
  }
  return [];
};

const jobFromSchema = extractor.extractFromSchemaOrg();
assert(jobFromSchema, 'Job should be extracted from Schema.org');
assert.strictEqual(jobFromSchema.title, 'Staff Frontend Engineer');
assert.strictEqual(jobFromSchema.company, 'Linear');
assert.strictEqual(jobFromSchema.location, 'Remote');
assert.strictEqual(jobFromSchema.salary, '$180K–$220K');
assert(jobFromSchema.skills.includes('React'));
console.log('✓ Schema.org extraction passed:', jobFromSchema.title, 'at', jobFromSchema.company);

console.log('Testing selection fallback:');
window.getSelection = () => ({
  toString: () => 'Lead Cloud Architect at CloudCorp\nRemote\n$160k - $200k\nRequires AWS, Kubernetes, Terraform.'
});
const jobFromSel = extractor.extractFromSelection();
assert(jobFromSel, 'Job should be extracted from text selection');
assert.strictEqual(jobFromSel.title, 'Lead Cloud Architect');
assert.strictEqual(jobFromSel.company, 'CloudCorp');
console.log('✓ Selection fallback passed:', jobFromSel.title, 'at', jobFromSel.company);

console.log('\nTesting Indeed DOM extraction on Two-Pane Search Results Page:');
globalThis.window.location = {
  href: 'https://ph.indeed.com/jobs?q=Video+Editor&vjk=abc123xyz',
  hostname: 'ph.indeed.com',
  origin: 'https://ph.indeed.com',
  search: '?q=Video+Editor&vjk=abc123xyz'
};

// Simulate two-pane layout where the left column has Job #1 (Iconiqlast)
// but the user has selected Job #5 (SUPERVA / Virtual Dream Team) in the right pane!
const mockRightPane = {
  innerText: `
    Video Editor
    SUPERVA BUSINESS PROCESS OUTSOURCING SERVICES
    Remote
    PHP 48,000 - PHP 49,000 a month
    Full-time

    Are you a creative, detail-oriented video editor ready to bring stories to life?
    Virtual Dream Team is looking for an experienced editor who can transform raw footage into polished content.
    Must have Premiere Pro, After Effects, and Color Grading skills.
  `,
  querySelector: (sel) => {
    if (sel.includes("jobsearch-JobInfoHeader-title") || sel === "h1") {
      return { textContent: 'Video Editor' };
    }
    if (sel.includes("inlineHeader-companyName") || sel.includes("company-name")) {
      return { textContent: 'SUPERVA BUSINESS PROCESS OUTSOURCING SERVICES' };
    }
    if (sel.includes("inlineHeader-companyLocation") || sel.includes("job-location")) {
      return { textContent: 'Remote' };
    }
    if (sel.includes("salaryInfoAndJobType") || sel.includes("salary")) {
      return { textContent: 'PHP 48,000 - PHP 49,000 a month - Full-time' };
    }
    if (sel.includes("jobDescriptionText")) {
      return {
        innerText: `Are you a creative, detail-oriented video editor ready to bring stories to life?
Virtual Dream Team is looking for an experienced editor who can transform raw footage into polished content.
Must have Premiere Pro, After Effects, and Color Grading skills.`
      };
    }
    return null;
  }
};

document.querySelector = (sel) => {
  if (sel.includes("jobsearch-ViewjobPaneWrapper") || sel.includes("jobsearch-RightPane")) {
    return mockRightPane;
  }
  // If query bleeds to document level (left column):
  if (sel.includes("h2.jobTitle")) {
    return { textContent: 'WRONG_FIRST_JOB_TITLE' };
  }
  if (sel.includes("companyName")) {
    return { textContent: 'WRONG_FIRST_COMPANY_ICONIQLAST' };
  }
  return null;
};

const indeedJob = extractor.extractJob();
assert(indeedJob, 'Indeed job must be extracted');
assert.strictEqual(indeedJob.source, 'indeed');
assert.strictEqual(indeedJob.title, 'Video Editor');
assert.strictEqual(indeedJob.company, 'SUPERVA BUSINESS PROCESS OUTSOURCING SERVICES');
assert.strictEqual(indeedJob.location, 'Remote');
assert.strictEqual(indeedJob.salary, 'PHP 48K–PHP 49K/mo');
assert(indeedJob.skills.includes('Video Editing'));
assert(indeedJob.skills.includes('Premiere Pro'));
assert(indeedJob.skills.includes('After Effects'));
assert(indeedJob.skills.includes('Color Grading'));
assert(indeedJob.description.includes('Virtual Dream Team is looking for an experienced editor'));
assert.strictEqual(indeedJob.url, 'https://ph.indeed.com/viewjob?jk=abc123xyz');

console.log('✓ Indeed scoped right-pane extraction passed:');
console.log('  Title:', indeedJob.title);
console.log('  Company:', indeedJob.company);
console.log('  Salary:', indeedJob.salary);
console.log('  URL:', indeedJob.url);
console.log('  Skills:', indeedJob.skills.join(', '));
console.log('  Description length:', indeedJob.description.length);

console.log('\nAll extraction engine tests PASSED cleanly!');
