interface NutritionData {
  calories: number;
  fat: number;
  carbs: number;
  protein: number;
}

interface CacheEntry {
  data: NutritionData;
  timestamp: number;
  hitCount: number;
}

export class NutritionCache {
  private cache: Map<string, CacheEntry>;
  private maxSize: number;
  private ttlMs: number; // Time to live in milliseconds

  constructor(maxSize = 1000, ttlHours = 24) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttlMs = ttlHours * 60 * 60 * 1000;
  }

  /**
   * Get cached nutrition data
   */
  get(key: string): NutritionData | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    const age = Date.now() - entry.timestamp;
    if (age > this.ttlMs) {
      this.cache.delete(key);
      return null;
    }

    // Increment hit count
    entry.hitCount++;

    return entry.data;
  }

  /**
   * Set nutrition data in cache
   */
  set(key: string, data: NutritionData): void {
    // Enforce max size by removing least used entries
    if (this.cache.size >= this.maxSize) {
      this.evictLeastUsed();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      hitCount: 0,
    });
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.calculateHitRate(),
    };
  }

  /**
   * Evict least used entry when cache is full
   */
  private evictLeastUsed(): void {
    let leastUsedKey: string | null = null;
    let leastUsedCount = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.hitCount < leastUsedCount) {
        leastUsedCount = entry.hitCount;
        leastUsedKey = key;
      }
    }

    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
    }
  }

  /**
   * Calculate cache hit rate
   */
  private calculateHitRate(): number {
    let totalHits = 0;
    let totalEntries = 0;

    for (const entry of this.cache.values()) {
      totalHits += entry.hitCount;
      totalEntries++;
    }

    return totalEntries > 0 ? totalHits / totalEntries : 0;
  }
}
