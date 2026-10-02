export interface ExtractedJobData {
  title?: string;
  company?: string;
  location?: string;
  salary?: string;
  skills: string[];
  description: string;
  url?: string;
}

const COMMON_SKILLS = [
  // Engineering & Tech
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Python",
  "Go",
  "Rust",
  "Java",
  "C++",
  "SQL",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "AWS",
  "GCP",
  "Azure",
  "Docker",
  "Kubernetes",
  "GraphQL",
  "REST APIs",
  "Tailwind CSS",
  "Git",
  "CI/CD",
  "Agile",
  "Playwright",
  "Jest",
  "System Design",
  "Microservices",
  "Linux",
  "FastAPI",
  "Django",
  "Spring Boot",
  "Terraform",
  "Prompt Engineering",
  "LLMs",
  "PyTorch",
  // Design, Video Editing & Creative
  "Figma",
  "Product Design",
  "UI/UX",
  "Graphic Design",
  "Video Editing",
  "Premiere Pro",
  "After Effects",
  "Final Cut Pro",
  "DaVinci Resolve",
  "CapCut",
  "Photoshop",
  "Illustrator",
  "Motion Graphics",
  "Animation",
  "Storytelling",
  "Audio Editing",
  "Color Grading",
  // Marketing & Operations
  "Social Media",
  "Content Creation",
  "Copywriting",
  "SEO",
  "E-Commerce",
  "Shopify",
  "Content Strategy",
  "Email Marketing",
  "Virtual Assistant",
];

export function extractSalary(text: string): string {
  if (!text) return "Salary not listed";

  const salaryRegex =
    /(?:(?:up\s+to|from)\s+)?((?:PHP|₱|\$|£|€|₹|¥|CAD|AUD|SGD|USD)\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?\s*[kK]?(?:\s*(?:-|–|to)\s*(?:PHP|₱|\$|£|€|₹|¥|CAD|AUD|SGD|USD)?\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?\s*[kK]?)?(?:\s*(?:\/|\bper\b|\ba\b)\s*(?:monthly|month|mo|annually|annual|year|yr|hourly|hour|hr|daily|day|weekly|week|wk))?)/i;

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

export function extractSkills(text: string): string[] {
  if (!text) return [];

  const foundSkills = new Set<string>();

  for (const skill of COMMON_SKILLS) {
    // Escape special characters in skill names like C++, Next.js
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(?:\\b|[^a-zA-Z0-9])${escaped}(?:\\b|[^a-zA-Z0-9])`, "i");
    if (regex.test(text)) {
      foundSkills.add(skill);
    }
  }

  const SKILL_ALIASES = [
    { regex: /\bvideo\s+edit(?:or|ing|s)?\b/i, skill: "Video Editing" },
    { regex: /\bgraphic\s+design(?:er|ing)?\b/i, skill: "Graphic Design" },
    { regex: /\bcontent\s+creat(?:or|ion|ing)\b/i, skill: "Content Creation" },
    { regex: /\bcopywrit(?:er|ing)\b/i, skill: "Copywriting" },
    { regex: /\bfront(?:-| )?end\b/i, skill: "Frontend" },
    { regex: /\bback(?:-| )?end\b/i, skill: "Backend" },
    { regex: /\bfull(?:-| )?stack\b/i, skill: "Full Stack" },
    { regex: /\bmachine\s+learning\b/i, skill: "Machine Learning" },
  ];

  for (const alias of SKILL_ALIASES) {
    if (alias.regex.test(text)) {
      foundSkills.add(alias.skill);
    }
  }

  return Array.from(foundSkills);
}

export function parseJobText(rawText: string, fallbackUrl?: string): ExtractedJobData {
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  let title = "Software Engineer";
  let company = "Company";
  let location = "Remote";

  if (lines.length > 0) {
    const firstLine = lines[0].replace(/^Title[:\s-]*/i, "");
    if (/\s+at\s+/i.test(firstLine)) {
      const parts = firstLine.split(/\s+at\s+/i);
      title = parts[0].trim();
      if (parts[1]) {
        company = parts[1].split(/[.,\n]/)[0].trim();
      }
    } else {
      title = firstLine;
    }
  }

  if (lines.length > 1 && company === "Company") {
    company = lines[1].replace(/^Company[:\s-]*/i, "");
  }

  if (lines.length > 2 && (lines[2].toLowerCase().includes("remote") || lines[2].toLowerCase().includes("hybrid") || lines[2].length < 40)) {
    location = lines[2].replace(/^Location[:\s-]*/i, "");
  }

  const salary = extractSalary(rawText);
  const skills = extractSkills(rawText);

  return {
    title,
    company,
    location,
    salary,
    skills: skills.length > 0 ? skills : ["React", "TypeScript"],
    description: rawText,
    url: fallbackUrl || "https://linkedin.com/jobs",
  };
}
