/**
 * Response formatting utilities for MCP tools with auto-enrichment
 */

import { PlayerService } from '../player-service.js';

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
function extractPlayerInfo(player: any): any {
  if (!player) return null;

  return {
    player_id: player.player_id,
    full_name: player.full_name,
    position: player.position,
    team: player.team || 'FA',
    status: player.status,
    number: player.number,
    injury_status: player.injury_status,
    injury_notes: player.injury_notes,
    years_exp: player.years_exp,
    age: player.age,
    depth_chart_position: player.depth_chart_position,
    depth_chart_order: player.depth_chart_order,
  };
}

function looksLikePlayerId(value: any): boolean {
  return typeof value === 'string' && /^\d{1,10}$/.test(value);
}

function collectPlayerIds(obj: any, ids: Set<string> = new Set()): Set<string> {
  if (Array.isArray(obj)) {
    obj.forEach(item => collectPlayerIds(item, ids));
  } else if (obj && typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj)) {
      if (['player_id', 'players', 'starters', 'reserve', 'taxi'].includes(key)) {
        if (Array.isArray(value)) {
          value.forEach(v => {
            if (looksLikePlayerId(v) && v !== '0') ids.add(v);
          });
        } else if (looksLikePlayerId(value)) {
          ids.add(value as string);
        }
      }
      else if (key === 'players_points' && typeof value === 'object' && value !== null) {
        Object.keys(value).forEach(id => {
          if (looksLikePlayerId(id)) ids.add(id);
        });
      }
      else {
        collectPlayerIds(value, ids);
      }
    }
  }
  return ids;
}

async function enrichObject(obj: any, playerMap: Map<string, any>): Promise<any> {
  if (Array.isArray(obj)) {
    return Promise.all(obj.map(item => enrichObject(item, playerMap)));
  }

  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const enriched: any = {};

  for (const [key, value] of Object.entries(obj)) {
    if (key === 'players' && Array.isArray(value)) {
      enriched[key] = value;
      enriched['players_enriched'] = value
        .filter(id => id !== '0')
        .map(id => extractPlayerInfo(playerMap.get(id)))
        .filter(p => p !== null);
    }
    else if (key === 'starters' && Array.isArray(value)) {
      enriched[key] = value;
      enriched['starters_enriched'] = value
        .filter(id => id !== '0')
        .map(id => extractPlayerInfo(playerMap.get(id)))
        .filter(p => p !== null);
    }
    else if (key === 'reserve' && Array.isArray(value)) {
      enriched[key] = value;
      enriched['reserve_enriched'] = value
        .filter(id => id !== '0')
        .map(id => extractPlayerInfo(playerMap.get(id)))
        .filter(p => p !== null);
    }
    else if (key === 'player_id' && looksLikePlayerId(value)) {
      enriched[key] = value;
      enriched['player_info'] = extractPlayerInfo(playerMap.get(value as string));
    }
    else if (key === 'players_points' && typeof value === 'object' && value !== null) {
      enriched[key] = value;
      enriched['players_with_points'] = Object.entries(value)
        .map(([id, points]) => ({
          ...extractPlayerInfo(playerMap.get(id)),
          points,
        }))
        .filter(p => p.player_id)
        .sort((a, b) => (b.points as number) - (a.points as number));
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

    const playerMap = new Map();
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
