import { CacheConfig } from './types';

// Cache configurations for different data types
export const CACHE_CONFIGS: Record<string, CacheConfig> = {
  // Static data - rarely changes (players now handled by persistent cache)
  nfl_state: { ttl: 60 * 60 * 1000, maxSize: 1 }, // 1 hour

  // User data - changes infrequently
  user: { ttl: 30 * 60 * 1000, maxSize: 1000 }, // 30 minutes
  user_leagues: { ttl: 15 * 60 * 1000, maxSize: 500 }, // 15 minutes
  user_drafts: { ttl: 15 * 60 * 1000, maxSize: 500 }, // 15 minutes

  // League data - changes moderately
  league: { ttl: 10 * 60 * 1000, maxSize: 1000 }, // 10 minutes
  league_users: { ttl: 10 * 60 * 1000, maxSize: 1000 }, // 10 minutes
  league_rosters: { ttl: 5 * 60 * 1000, maxSize: 1000 }, // 5 minutes
  league_drafts: { ttl: 10 * 60 * 1000, maxSize: 1000 }, // 10 minutes
  league_traded_picks: { ttl: 10 * 60 * 1000, maxSize: 1000 }, // 10 minutes
  league_playoff_bracket: { ttl: 10 * 60 * 1000, maxSize: 1000 }, // 10 minutes

  // Dynamic data - changes frequently
  league_matchups: { ttl: 2 * 60 * 1000, maxSize: 2000 }, // 2 minutes
  league_transactions: { ttl: 2 * 60 * 1000, maxSize: 2000 }, // 2 minutes
  trending_players: { ttl: 5 * 60 * 1000, maxSize: 100 }, // 5 minutes

  // Draft data - changes during draft, then static
  draft: { ttl: 5 * 60 * 1000, maxSize: 1000 }, // 5 minutes
  draft_picks: { ttl: 2 * 60 * 1000, maxSize: 1000 }, // 2 minutes
  draft_traded_picks: { ttl: 5 * 60 * 1000, maxSize: 1000 }, // 5 minutes
};
