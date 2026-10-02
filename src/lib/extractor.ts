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
  "Figma",
  "Product Design",
  "UI/UX",
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
];

export function extractSalary(text: string): string {
  if (!text) return "Salary not listed";

  // Regex patterns for various salary representations:
  // e.g., $120,000 - $150,000, $120k-$150k, $80 - $120 / hr, $140,000 to $180,000
  const salaryRegex =
    /(\$\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?\s*[kK]?\s*(?:-|–|to)\s*\$?\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?\s*[kK]?(?:\s*(?:\/|\bper\b)\s*(?:yr|year|annual|annually|hr|hour))?|\$\s*\d{1,3}(?:,\d{3})*\s*[kK]?(?:\s*(?:\/|\bper\b)\s*(?:yr|year|annual|annually|hr|hour))?)/i;

  const match = text.match(salaryRegex);
  if (!match) return "Salary not listed";

  let raw = match[0].trim();
  // Standardize format:
  // e.g. "$120,000 - $150,000" -> "$120K–$150K"
  raw = raw
    .replace(/\s+/g, " ")
    .replace(/\s*-\s*|\s*–\s*|\s+to\s+/i, "–")
    .replace(/(\$\d+),000/g, "$1K");

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
