import { NextRequest, NextResponse } from "next/server";
import { canonicalizeUrl, hashCanonicalUrl } from "@/lib/canonicalize";
import { getExtractionCache } from "@/lib/cache/prisma-store";
import {
  AiExtractedJob,
  JOB_EXTRACTION_JSON_SCHEMA,
  buildExtractionPrompt,
} from "@/lib/ai/extractor-schema";
import fs from "fs";
import path from "path";
import { extractSalary, extractSkills, parseJobText } from "@/lib/extractor";

export const runtime = "nodejs";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key, x-ai-provider",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawUrl = typeof body.url === "string" ? body.url : "";
    const rawText = typeof body.rawText === "string" ? body.rawText : "";
    const partialFields = body.partialFields || {};

    if (!rawText && !rawUrl) {
      return NextResponse.json(
        { ok: false, error: "Missing required rawText or url" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const canonicalUrl = canonicalizeUrl(rawUrl || "https://jobclippy.local/job");
    const urlHash = hashCanonicalUrl(canonicalUrl);
    const cache = getExtractionCache();

    // 1. Layer 2: Cache Lookup
    const cached = await cache.get(urlHash);
    if (cached) {
      await cache.incrementHit(urlHash);
      cached.hitCount = (cached.hitCount || 1) + 1;
      return NextResponse.json(
        {
          ok: true,
          data: cached,
          fromCache: true,
          isAiVerified: cached.modelUsed !== "heuristic-fallback",
          provider: "cache",
        },
        { headers: CORS_HEADERS }
      );
    }

    // 2. Layer 3: AI Extraction (Server Environment Only: DeepSeek -> OpenAI -> Gemini -> Fallback)
    let deepseekKey = process.env.DEEPSEEK_API_KEY;
    if (!deepseekKey) {
      try {
        for (const envFile of [".env.local", ".env"]) {
          const envPath = path.resolve(process.cwd(), envFile);
          if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, "utf-8");
            const match = content.match(/^DEEPSEEK_API_KEY=(.+)$/m);
            if (match && match[1]?.trim()) {
              deepseekKey = match[1].trim().replace(/^["']|["']$/g, "");
              process.env.DEEPSEEK_API_KEY = deepseekKey;
              break;
            }
          }
        }
      } catch (err) {
        console.warn("[extract] Error reading env files:", err);
      }
    }
    const openAiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    let aiResult: AiExtractedJob | null = null;
    let modelUsed = "heuristic-fallback";
    let activeProvider = "none";

    if (rawText.length >= 20) {
      const { system, user } = buildExtractionPrompt(rawText, partialFields, rawUrl);

      // Branch 1: DeepSeek (deepseek-chat with json_object mode)
      if (deepseekKey) {
        try {
          activeProvider = "deepseek";
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 8000);

          const response = await fetch("https://api.deepseek.com/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${deepseekKey}`,
            },
            body: JSON.stringify({
              model: "deepseek-chat",
              messages: [
                { role: "system", content: system },
                { role: "user", content: user },
              ],
              response_format: {
                type: "json_object",
              },
              temperature: 0.1,
            }),
            signal: controller.signal,
          });

          clearTimeout(timeout);

          if (response.ok) {
            const resJson = await response.json();
            const content = resJson.choices?.[0]?.message?.content;
            if (content) {
              aiResult = JSON.parse(content) as AiExtractedJob;
              modelUsed = "deepseek-chat";
            }
          } else {
            console.warn(`DeepSeek extraction error: status ${response.status}`);
          }
        } catch (err) {
          console.warn("DeepSeek API call failed, falling back:", err);
        }
      }

      // Branch 2: OpenAI (gpt-4o-mini with strict json_schema)
      if (!aiResult && openAiKey) {
        try {
          activeProvider = "openai";
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 8000);

          const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${openAiKey}`,
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [
                { role: "system", content: system },
                { role: "user", content: user },
              ],
              response_format: {
                type: "json_schema",
                json_schema: JOB_EXTRACTION_JSON_SCHEMA,
              },
              temperature: 0.1,
            }),
            signal: controller.signal,
          });

          clearTimeout(timeout);

          if (response.ok) {
            const resJson = await response.json();
            const content = resJson.choices?.[0]?.message?.content;
            if (content) {
              aiResult = JSON.parse(content) as AiExtractedJob;
              modelUsed = "gpt-4o-mini";
            }
          } else {
            console.warn(`OpenAI extraction error: status ${response.status}`);
          }
        } catch (err) {
          console.warn("OpenAI API call failed, falling back to heuristics:", err);
        }
      }

      // Branch B: Google Gemini 1.5 Flash (Generous Free Tier)
      if (!aiResult && geminiKey) {
        try {
          activeProvider = "gemini";
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 8000);

          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
          const response = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `${system}\n\n${user}` }] }],
              generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.1,
              },
            }),
            signal: controller.signal,
          });

          clearTimeout(timeout);

          if (response.ok) {
            const resJson = await response.json();
            const rawContent = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawContent) {
              aiResult = JSON.parse(rawContent) as AiExtractedJob;
              modelUsed = "gemini-1.5-flash";
            }
          }
        } catch (err) {
          console.warn("Gemini API call failed, falling back to heuristics:", err);
        }
      }
    }

    // 3. Fallback & Reconciliation
    const heuristic = parseJobText(rawText, canonicalUrl);
    const detectedSalary =
      partialFields.salary && partialFields.salary !== "Salary not listed"
        ? partialFields.salary
        : extractSalary(rawText);

    const mergedTitle =
      aiResult?.title || partialFields.title || heuristic.title || "Job Opportunity";
    const mergedCompany =
      aiResult?.company || partialFields.company || heuristic.company || "Company";
    const mergedLocation =
      aiResult?.location || partialFields.location || heuristic.location || "Remote";
    const mergedSalary =
      aiResult?.salary && aiResult.salary !== "Salary not listed"
        ? aiResult.salary
        : detectedSalary;

    const mergedSkills = Array.from(
      new Set([
        ...(aiResult?.skills || []),
        ...(partialFields.skills || []),
        ...(heuristic.skills || []),
        ...extractSkills((mergedTitle || "") + " " + (rawText || "")),
      ])
    ).slice(0, 10);

    const isAiVerified = Boolean(aiResult);

    const resultPayload = {
      canonicalUrl,
      title: mergedTitle,
      company: mergedCompany,
      location: mergedLocation,
      workplaceType: aiResult?.workplaceType || "remote",
      salary: mergedSalary,
      seniority: aiResult?.seniority || "mid",
      skills: mergedSkills.length > 0 ? mergedSkills : ["React", "TypeScript"],
      experienceYears: aiResult?.experienceYears ?? 0,
      summary:
        aiResult?.summary ||
        rawText.slice(0, 280).replace(/\s+/g, " ").trim() + "...",
      rawDescription: rawText.slice(0, 4000),
      modelUsed,
    };

    // 4. Save to Cache
    const saved = await cache.set(urlHash, resultPayload, 30);

    return NextResponse.json(
      {
        ok: true,
        data: saved,
        fromCache: false,
        isAiVerified,
        provider: isAiVerified ? activeProvider : "none (missing API key)",
      },
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { ok: false, error: `Failed to process extraction: ${message}` },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
