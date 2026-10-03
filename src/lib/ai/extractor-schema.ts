export interface AiExtractedJob {
  title: string;
  company: string;
  location: string;
  workplaceType: "remote" | "hybrid" | "on-site";
  salary: string;
  seniority: "intern" | "entry" | "mid" | "senior" | "lead" | "executive";
  skills: string[];
  experienceYears: number;
  summary: string;
}

export const JOB_EXTRACTION_JSON_SCHEMA = {
  name: "job_posting_extraction",
  strict: true,
  schema: {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "Exact job title or role (e.g. 'Senior Frontend Engineer').",
      },
      company: {
        type: "string",
        description: "Hiring company or organization name.",
      },
      location: {
        type: "string",
        description: "Geographic location (e.g. 'San Francisco, CA', 'London, UK', or 'Remote').",
      },
      workplaceType: {
        type: "string",
        enum: ["remote", "hybrid", "on-site"],
        description: "Primary work arrangement.",
      },
      salary: {
        type: "string",
        description: "Standardized compensation range or 'Salary not listed' (e.g. '$140K–$180K', 'PHP 80K–PHP 110K/mo').",
      },
      seniority: {
        type: "string",
        enum: ["intern", "entry", "mid", "senior", "lead", "executive"],
        description: "Career seniority level based on responsibilities and required experience.",
      },
      skills: {
        type: "array",
        items: { type: "string" },
        description: "Up to 8 standardized tech stack keywords, tools, or domain proficiencies.",
      },
      experienceYears: {
        type: "number",
        description: "Minimum years of relevant experience requested (0 if not specified or entry-level).",
      },
      summary: {
        type: "string",
        description: "Concise 1-2 sentence executive summary of core role responsibilities.",
      },
    },
    required: [
      "title",
      "company",
      "location",
      "workplaceType",
      "salary",
      "seniority",
      "skills",
      "experienceYears",
      "summary",
    ],
    additionalProperties: false,
  },
} as const;

export function buildExtractionPrompt(
  rawText: string,
  partialFields?: Partial<AiExtractedJob>,
  rawUrl?: string
): { system: string; user: string } {
  const hints = partialFields
    ? `\nClient pre-extracted hints (use if confident): ${JSON.stringify(partialFields)}`
    : "";
  const urlContext = rawUrl ? `\nActive Job URL: ${rawUrl}` : "";

  const system =
    "You are an expert technical recruiting parser. Extract structured job posting details from unstructured text.\n" +
    "You MUST return a valid JSON object matching the following structure:\n" +
    "{\n" +
    '  "title": "string",\n' +
    '  "company": "string",\n' +
    '  "location": "string",\n' +
    '  "workplaceType": "remote" | "hybrid" | "on-site",\n' +
    '  "salary": "string",\n' +
    '  "seniority": "intern" | "entry" | "mid" | "senior" | "lead" | "executive",\n' +
    '  "skills": ["string"],\n' +
    '  "experienceYears": number,\n' +
    '  "summary": "string"\n' +
    "}\n" +
    "Rules:\n" +
    "- Normalize salary into clean compact format (e.g. '$130K–$160K', 'PHP 80K–PHP 110K/mo'). If absent, use 'Salary not listed'.\n" +
    "- Extract top technical tools, languages, and frameworks as standardized skill tags.\n" +
    "- Disambiguation: If the text contains multiple job listings or a search results sidebar alongside an expanded job details pane, extract ONLY the specific job matching the target URL or expanded description pane. Discard secondary search result cards.\n" +
    "- Do not include markdown formatting or hallucinated requirements. Pure JSON only.";

  const user = `Job Posting Text:\n---\n${rawText.slice(0, 4500)}\n---${hints}${urlContext}`;

  return { system, user };
}
