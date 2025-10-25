import { PlayerService } from '../player-service';
import type { SleeperPlayer, Player } from '../types';

const playerService = new PlayerService();

export interface ToolResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
}

/**
 * Extract only fantasy-relevant fields from a player object
 */
function extractPlayerInfo(player: SleeperPlayer): Player | null {
  if (!player) return null;

  const team = player.team || 'FA';

  const enrichedPlayer: Player = {
    player_id: player.player_id,
    full_name: player.full_name,
    position: player.position,
    team: team,
    status: player.status,
    number: player.number,

    // Injury Information (available from Sleeper)
    injury_status: player.injury_status,
    injury_body_part: player.injury_body_part,
    injury_notes: player.injury_notes,
    injury_start_date: player.injury_start_date,
    practice_participation: player.practice_participation,
    practice_description: player.practice_description,

    // Depth Chart
    depth_chart_position: player.depth_chart_position,
    depth_chart_order: player.depth_chart_order,

    // Additional Context
    years_exp: player.years_exp,
    age: player.age,
  };

  // Add warning flags for critical conditions
  if (player.injury_status && ['Out', 'IR', 'PUP', 'Suspended'].includes(player.injury_status)) {
    enrichedPlayer.availability_warning = `⚠️ ${player.injury_status}`;
  } else if (player.injury_status === 'Questionable') {
    enrichedPlayer.availability_warning = '⚠️ Game-time decision';
  } else if (player.injury_status === 'Doubtful') {
    enrichedPlayer.availability_warning = '⚠️ Unlikely to play';
  }

  return enrichedPlayer;
}

/**
 * Check if a value looks like a player ID (not team defense or user ID)
 */
function looksLikePlayerId(value: any): boolean {
  if (typeof value !== 'string') return false;

  // Must be numeric string, 1-10 digits
  if (!/^\d{1,10}$/.test(value)) return false;

  // Filter out common non-player IDs (single digits are usually roster IDs)
  const nonPlayerIds = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  if (nonPlayerIds.includes(value)) return false;

  return true;
}

/**
 * Check if a value is a team defense (3-letter team abbreviation)
 */
function isTeamDefense(value: any): boolean {
  if (typeof value !== 'string') return false;
  return /^[A-Z]{2,3}$/.test(value) && value.length <= 3;
}

/**
 * Recursively find and collect all player IDs in an object
 * Based on Sleeper API documentation structure
 */
function collectPlayerIds(obj: any, ids: Set<string> = new Set()): Set<string> {
  if (Array.isArray(obj)) {
    obj.forEach(item => collectPlayerIds(item, ids));
  } else if (obj && typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj)) {

      // Known player ID fields from Sleeper API docs
      if (['players', 'starters', 'reserve', 'taxi'].includes(key)) {
        if (Array.isArray(value)) {
          value.forEach(v => {
            if (looksLikePlayerId(v) && !isTeamDefense(v)) {
              ids.add(v);
            }
          });
        }
      }
      // Single player ID fields
      else if (key === 'player_id' && looksLikePlayerId(value)) {
        ids.add(value as string);
      }
      // Players points object - keys are player IDs
      else if (key === 'players_points' && typeof value === 'object' && value !== null) {
        Object.keys(value).forEach(id => {
          if (looksLikePlayerId(id)) {
            ids.add(id);
          }
        });
      }
      // Skip known non-player ID fields
      else if (['picked_by', 'roster_id', 'owner_id', 'user_id', 'league_id', 'draft_id'].includes(key)) {
        // These are user/roster/league IDs, not player IDs
        continue;
      }
      else {
        collectPlayerIds(value, ids);
      }
    }
  }
  return ids;
}

/**
 * Recursively enrich an object with minimal player data
 * Based on Sleeper API response structure
 */
async function enrichObject(obj: any, playerMap: Map<string, SleeperPlayer>): Promise<any> {
  if (Array.isArray(obj)) {
    return Promise.all(obj.map(item => enrichObject(item, playerMap)));
  }

  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const enriched: any = {};

  for (const [key, value] of Object.entries(obj)) {

    // Enrich roster arrays (from /league/{id}/rosters)
    if (['players', 'starters', 'reserve', 'taxi'].includes(key) && Array.isArray(value)) {
      enriched[key] = value;

      // Filter out team defenses and empty slots, then enrich
      const playerIds = value.filter(id =>
        looksLikePlayerId(id) && !isTeamDefense(id) && id !== '0'
      );

      if (playerIds.length > 0) {
        enriched[`${key}_enriched`] = playerIds
          .map(id => {
            const player = playerMap.get(id);
            return player ? extractPlayerInfo(player) : null;
          })
          .filter(p => p !== null);
      }
    }
    // Enrich single player ID (from draft picks, trending players)
    else if (key === 'player_id' && looksLikePlayerId(value)) {
      enriched[key] = value;
      const player = playerMap.get(value as string);
      enriched['player_info'] = player ? extractPlayerInfo(player) : null;
    }
    // Enrich players_points (from matchups)
    else if (key === 'players_points' && typeof value === 'object' && value !== null) {
      enriched[key] = value;

      // Create enriched array with player info + points
      const playersWithPoints = Object.entries(value)
        .filter(([id]) => looksLikePlayerId(id))
        .map(([id, points]) => {
          const player = playerMap.get(id);
          const playerInfo = player ? extractPlayerInfo(player) : null;
          return playerInfo ? { ...playerInfo, points } : null;
        })
        .filter((p): p is Player & { points: unknown } => p !== null && 'player_id' in p)
        .sort((a, b) => (b.points as number) - (a.points as number));

      if (playersWithPoints.length > 0) {
        enriched['players_with_points'] = playersWithPoints;
      }
    }
    // Skip enriching known non-player fields
    else if (['picked_by', 'roster_id', 'owner_id', 'user_id', 'league_id', 'draft_id'].includes(key)) {
      enriched[key] = value;
    }
    else {
      enriched[key] = await enrichObject(value, playerMap);
    }
  }

  return enriched;
}

export async function formatJsonResponse(title: string, data: any): Promise<ToolResponse> {
  try {
    const playerIds = collectPlayerIds(data);

    if (playerIds.size === 0) {
      return {
        content: [{
          type: 'text',
          text: `${title}:\n${JSON.stringify(data, null, 2)}`,
        }],
      };
    }

    console.error(`[Enrichment] Found ${playerIds.size} unique player IDs`);

    const players = await playerService.getPlayers(Array.from(playerIds));

    const playerMap = new Map<string, SleeperPlayer>();
    Array.from(playerIds).forEach((id, index) => {
      if (players[index]) {
        playerMap.set(id, players[index]);
      }
    });

    console.error(`[Enrichment] Loaded ${playerMap.size} players`);

    const enrichedData = await enrichObject(data, playerMap);

    return {
      content: [{
        type: 'text',
        text: `${title} (enriched with ${playerMap.size} players):\n${JSON.stringify(enrichedData, null, 2)}`,
      }],
    };

  } catch (error) {
    console.error('[Enrichment] Error:', error);
    return {
      content: [{
        type: 'text',
        text: `${title}:\n${JSON.stringify(data, null, 2)}`,
      }],
    };
  }
}
