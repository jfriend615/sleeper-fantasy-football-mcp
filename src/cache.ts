import { CacheEntry, CacheConfig } from './types.js';
import { CACHE_CONFIGS } from './cache-config.js';

export class SleeperCache {
  private cache = new Map<string, CacheEntry>();

  // Generate cache key from endpoint and parameters
  private generateKey(endpoint: string, params: Record<string, any> = {}): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return `${endpoint}${sortedParams ? `?${sortedParams}` : ''}`;
  }

  private getCacheConfig(endpoint: string): CacheConfig {
    // Skip players - handled by persistent cache
    if (endpoint.includes('/players/') && !endpoint.includes('/trending')) {
      return { ttl: 0, maxSize: 0 }; // Don't cache in memory
    }

    if (endpoint.includes('/players/') && !endpoint.includes('/trending')) return CACHE_CONFIGS.players;
    if (endpoint.includes('/state/')) return CACHE_CONFIGS.nfl_state;
    if (endpoint.startsWith('/user/') && endpoint.includes('/leagues/')) return CACHE_CONFIGS.user_leagues;
    if (endpoint.startsWith('/user/') && endpoint.includes('/drafts/')) return CACHE_CONFIGS.user_drafts;
    if (endpoint.startsWith('/user/')) return CACHE_CONFIGS.user;
    if (endpoint.includes('/league/') && endpoint.includes('/matchups/')) return CACHE_CONFIGS.league_matchups;
    if (endpoint.includes('/league/') && endpoint.includes('/transactions')) return CACHE_CONFIGS.league_transactions;
    if (endpoint.includes('/league/') && endpoint.includes('/rosters')) return CACHE_CONFIGS.league_rosters;
    if (endpoint.includes('/league/') && endpoint.includes('/users')) return CACHE_CONFIGS.league_users;
    if (endpoint.includes('/league/') && endpoint.includes('/drafts')) return CACHE_CONFIGS.league_drafts;
    if (endpoint.includes('/league/') && endpoint.includes('/traded_picks')) return CACHE_CONFIGS.league_traded_picks;
    if (endpoint.includes('/league/') && endpoint.includes('/bracket')) return CACHE_CONFIGS.league_playoff_bracket;
    if (endpoint.includes('/league/')) return CACHE_CONFIGS.league;
    if (endpoint.includes('/draft/') && endpoint.includes('/picks')) return CACHE_CONFIGS.draft_picks;
    if (endpoint.includes('/draft/') && endpoint.includes('/traded_picks')) return CACHE_CONFIGS.draft_traded_picks;
    if (endpoint.includes('/draft/')) return CACHE_CONFIGS.draft;
    if (endpoint.includes('/trending')) return CACHE_CONFIGS.trending_players;

    // Default to short TTL for unknown endpoints
    return { ttl: 5 * 60 * 1000, maxSize: 100 };
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  get(endpoint: string, params: Record<string, any> = {}): any | null {
    const key = this.generateKey(endpoint, params);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return null;
    }

    entry.hits++;
    return entry.data;
  }

  set(endpoint: string, data: any, params: Record<string, any> = {}): void {
    const config = this.getCacheConfig(endpoint);
    const key = this.generateKey(endpoint, params);

    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl: config.ttl,
      hits: 0,
    };

    this.cache.set(key, entry);
  }

  clear(): void {
    this.cache.clear();
  }
}
