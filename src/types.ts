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
}

/**
 * Raw player data from Sleeper API (/v1/players/nfl)
 * This represents the complete player object as returned by Sleeper
 */
export interface SleeperPlayer {
  // Identity
  player_id: string;
  first_name: string;
  last_name: string;
  full_name: string;

  // Position & Team
  position: string;
  team: string | null;
  team_abbr: string | null;
  status: 'Active' | 'Inactive' | string;

  // Physical Attributes
  number: number | null;
  age: number | null;
  height: string | null;
  weight: string | null;
  birth_date: string | null;
  birth_city: string | null;
  birth_state: string | null;
  birth_country: string | null;

  // Career Info
  years_exp: number | null;
  college: string | null;
  high_school: string | null;

  // Fantasy Positions
  fantasy_positions: string[];
  sport: string;

  // Injury Information
  injury_status: 'Out' | 'Questionable' | 'Doubtful' | 'IR' | 'PUP' | 'Suspended' | 'COV' | null;
  injury_body_part: string | null;
  injury_notes: string | null;
  injury_start_date: string | null;
  practice_participation: 'Full' | 'Limited' | 'DNP' | null;
  practice_description: string | null;

  // Depth Chart
  depth_chart_position: string | null;
  depth_chart_order: number | null;

  // External IDs
  espn_id: number | null;
  yahoo_id: number | null;
  rotowire_id: number | null;
  rotoworld_id: number | null;
  fantasy_data_id: number | null;
  stats_id: number | null;
  sportradar_id: string | null;
  gsis_id: string | null;
  pandascore_id: string | null;
  swish_id: number | null;
  oddsjam_id: string | null;
  opta_id: string | null;
  kalshi_id: string | null;

  // Metadata
  active: boolean;
  search_rank: number;
  search_first_name: string;
  search_last_name: string;
  search_full_name: string;
  hashtag: string;
  news_updated: number | null;
  team_changed_at: number | null;
  metadata: any | null;
  competitions: any[];
}

/**
 * Enriched player data used throughout the application
 * This is the minimal, fantasy-relevant subset extracted from SleeperPlayer
 */
export interface Player {
  // Identity
  player_id: string;
  full_name: string;
  position: string;
  team: string; // Includes 'FA' for free agents
  status: string;
  number: number | null;

  // Injury Information
  injury_status: string | null;
  injury_body_part: string | null;
  injury_notes: string | null;
  injury_start_date: string | null;
  practice_participation: string | null;
  practice_description: string | null;

  // Depth Chart
  depth_chart_position: string | null;
  depth_chart_order: number | null;

  // Additional Context
  years_exp: number | null;
  age: number | null;

  // Enhanced Warning Flag
  availability_warning?: string;
}
