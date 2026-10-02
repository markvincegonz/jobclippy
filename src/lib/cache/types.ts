export interface CachedJobExtraction {
  urlHash: string;
  canonicalUrl: string;
  title: string;
  company: string;
  location: string;
  workplaceType?: "remote" | "hybrid" | "on-site";
  salary: string;
  seniority?: "intern" | "entry" | "mid" | "senior" | "lead" | "executive";
  skills: string[];
  experienceYears?: number;
  summary?: string;
  rawDescription?: string;
  modelUsed?: string;
  hitCount: number;
  createdAt: string;
  expiresAt: string;
}

export type NewExtractionPayload = Omit<
  CachedJobExtraction,
  "urlHash" | "hitCount" | "createdAt" | "expiresAt"
>;

export interface ExtractionCacheStore {
  /**
   * Retrieves an unexpired cached extraction by its SHA-256 URL hash.
   * Returns null if missing or expired.
   */
  get(urlHash: string): Promise<CachedJobExtraction | null>;

  /**
   * Persists an extraction payload with expiration timestamp.
   */
  set(
    urlHash: string,
    payload: NewExtractionPayload,
    ttlDays?: number
  ): Promise<CachedJobExtraction>;

  /**
   * Increments the cache hit counter for analytical tracking.
   */
  incrementHit(urlHash: string): Promise<void>;

  /**
   * Clears all stored cache entries (primarily for testing and cache reset).
   */
  clear(): Promise<void>;
}
