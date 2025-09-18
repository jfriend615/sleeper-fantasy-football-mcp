// Cache configuration interface
export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of entries
}

// Cache entry interface
export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

// Cache statistics interface (for future use)
export interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  refreshes: number;
  size: number;
  hitRate: number;
}
