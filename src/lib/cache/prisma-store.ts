import { prisma } from "@/lib/prisma";
import { CachedJobExtraction, ExtractionCacheStore, NewExtractionPayload } from "./types";

const DEFAULT_TTL_DAYS = 30;

export class PrismaExtractionCacheStore implements ExtractionCacheStore {
  async get(urlHash: string): Promise<CachedJobExtraction | null> {
    try {
      const record = await prisma.extractionCache.findUnique({
        where: { urlHash },
      });

      if (!record) return null;

      // Check expiration
      if (new Date() > record.expiresAt) {
        prisma.extractionCache.delete({ where: { urlHash } }).catch(() => {});
        return null;
      }

      const extracted = (record.extractedData || {}) as Record<string, unknown>;

      return {
        urlHash: record.urlHash,
        canonicalUrl: record.canonicalUrl,
        title: (extracted.title as string) || "Job Opportunity",
        company: (extracted.company as string) || "Company",
        location: (extracted.location as string) || "Remote",
        workplaceType: extracted.workplaceType as CachedJobExtraction["workplaceType"],
        salary: (extracted.salary as string) || "Salary not listed",
        seniority: extracted.seniority as CachedJobExtraction["seniority"],
        skills: Array.isArray(extracted.skills) ? (extracted.skills as string[]) : [],
        experienceYears: extracted.experienceYears as number | undefined,
        summary: extracted.summary as string | undefined,
        rawDescription: extracted.rawDescription as string | undefined,
        modelUsed: record.modelUsed,
        hitCount: record.hitCount,
        createdAt: record.createdAt.toISOString(),
        expiresAt: record.expiresAt.toISOString(),
      };
    } catch (err) {
      console.warn("PrismaExtractionCacheStore.get failed:", err);
      return null;
    }
  }

  async set(
    urlHash: string,
    payload: NewExtractionPayload,
    ttlDays: number = DEFAULT_TTL_DAYS
  ): Promise<CachedJobExtraction> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlDays * 24 * 60 * 60 * 1000);

    let domain = "career-site";
    try {
      const parsedUrl = new URL(payload.canonicalUrl);
      domain = parsedUrl.hostname.replace(/^www\./, "");
    } catch {
      // ignore
    }

    const { canonicalUrl, modelUsed = "deepseek-chat", ...extractedData } = payload;

    const fullRecord: CachedJobExtraction = {
      ...payload,
      urlHash,
      hitCount: 1,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const jsonPayload = extractedData as any;

      await prisma.extractionCache.upsert({
        where: { urlHash },
        update: {
          canonicalUrl,
          domain,
          extractedData: jsonPayload,
          modelUsed,
          hitCount: { increment: 1 },
          expiresAt,
        },
        create: {
          urlHash,
          canonicalUrl,
          domain,
          extractedData: jsonPayload,
          modelUsed,
          hitCount: 1,
          createdAt: now,
          expiresAt,
        },
      });
    } catch (err) {
      console.warn("PrismaExtractionCacheStore.set failed:", err);
    }

    return fullRecord;
  }

  async incrementHit(urlHash: string): Promise<void> {
    try {
      await prisma.extractionCache.update({
        where: { urlHash },
        data: { hitCount: { increment: 1 } },
      });
    } catch {
      // ignore
    }
  }

  async clear(): Promise<void> {
    try {
      await prisma.extractionCache.deleteMany({});
    } catch (err) {
      console.warn("PrismaExtractionCacheStore.clear failed:", err);
    }
  }
}

// Global singleton instance for server environment
let globalPrismaCache: ExtractionCacheStore | null = null;

export function getExtractionCache(): ExtractionCacheStore {
  if (!globalPrismaCache) {
    globalPrismaCache = new PrismaExtractionCacheStore();
  }
  return globalPrismaCache;
}
