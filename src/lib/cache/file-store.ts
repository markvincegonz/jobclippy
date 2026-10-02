import fs from "node:fs";
import path from "node:path";
import { CachedJobExtraction, ExtractionCacheStore, NewExtractionPayload } from "./types";

const DEFAULT_TTL_DAYS = 30;
const CACHE_DIR = path.resolve(".jobclippy");
const CACHE_FILE = path.join(CACHE_DIR, "extraction-cache.json");

export class LocalExtractionCacheStore implements ExtractionCacheStore {
  private memoryCache: Map<string, CachedJobExtraction> = new Map();
  private diskEnabled: boolean = true;
  private isLoaded: boolean = false;

  constructor(options?: { enableDisk?: boolean }) {
    if (options?.enableDisk === false) {
      this.diskEnabled = false;
    }
  }

  private loadFromDisk(): void {
    if (!this.diskEnabled || this.isLoaded) return;
    this.isLoaded = true;

    try {
      if (fs.existsSync(CACHE_FILE)) {
        const raw = fs.readFileSync(CACHE_FILE, "utf8");
        const parsed = JSON.parse(raw);
        if (typeof parsed === "object" && parsed !== null) {
          for (const [hash, entry] of Object.entries(parsed)) {
            if (this.isValidEntry(entry)) {
              this.memoryCache.set(hash, entry as CachedJobExtraction);
            }
          }
        }
      }
    } catch (err) {
      // In read-only or serverless environments, fallback to pure in-memory
      console.warn("LocalExtractionCache: Disk load warning, using in-memory only:", err);
      this.diskEnabled = false;
    }
  }

  private saveToDisk(): void {
    if (!this.diskEnabled) return;
    try {
      if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR, { recursive: true });
      }
      const data: Record<string, CachedJobExtraction> = {};
      for (const [key, value] of this.memoryCache.entries()) {
        data[key] = value;
      }
      fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2), "utf8");
    } catch {
      // Graceful write failure for serverless containers
      this.diskEnabled = false;
    }
  }

  private isValidEntry(entry: unknown): entry is CachedJobExtraction {
    return Boolean(
      entry &&
        typeof entry === "object" &&
        "urlHash" in entry &&
        "title" in entry &&
        "expiresAt" in entry
    );
  }

  async get(urlHash: string): Promise<CachedJobExtraction | null> {
    this.loadFromDisk();
    const entry = this.memoryCache.get(urlHash);
    if (!entry) return null;

    // Check expiration
    const expiresAtTime = new Date(entry.expiresAt).getTime();
    if (Date.now() > expiresAtTime) {
      this.memoryCache.delete(urlHash);
      this.saveToDisk();
      return null;
    }

    return entry;
  }

  async set(
    urlHash: string,
    payload: NewExtractionPayload,
    ttlDays: number = DEFAULT_TTL_DAYS
  ): Promise<CachedJobExtraction> {
    this.loadFromDisk();

    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlDays * 24 * 60 * 60 * 1000);

    const fullRecord: CachedJobExtraction = {
      ...payload,
      urlHash,
      hitCount: 1,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    this.memoryCache.set(urlHash, fullRecord);
    this.saveToDisk();
    return fullRecord;
  }

  async incrementHit(urlHash: string): Promise<void> {
    this.loadFromDisk();
    const entry = this.memoryCache.get(urlHash);
    if (entry) {
      entry.hitCount = (entry.hitCount || 0) + 1;
      this.saveToDisk();
    }
  }

  async clear(): Promise<void> {
    this.memoryCache.clear();
    this.saveToDisk();
  }
}

// Global singleton instance for server environment
let globalCache: ExtractionCacheStore | null = null;

export function getExtractionCache(): ExtractionCacheStore {
  if (!globalCache) {
    globalCache = new LocalExtractionCacheStore();
  }
  return globalCache;
}
