import { z } from 'zod';
import { formatJsonResponse } from '../../../../src/utils/response-helpers';
import { makeSleeperRequest } from '../../../../src/api-service';
import { PlayerService } from '../../../../src/player-service';

// Initialize player service
const playerService = new PlayerService();

export const playerTools = {
  get_players: {
    schema: {
      name: 'get_players',
      description: 'Get multiple players by their IDs (requires players data to be cached)',
      inputSchema: {
        type: 'object',
        properties: {
          playerIds: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Array of Sleeper player IDs',
          },
          sport: {
            type: 'string',
            description: 'The sport (currently only "nfl" is supported)',
            default: 'nfl',
          },
        },
        required: ['playerIds'],
      },
    },
    handler: async (args: any) => {
      const { playerIds, sport = 'nfl' } = z.object({
        playerIds: z.array(z.string()),
        sport: z.string().optional()
      }).parse(args);
      const players = await playerService.getPlayers(playerIds, sport);
      return await formatJsonResponse(`Players Information (${players.length} found)`, players);
    },
  },

  search_players: {
    schema: {
      name: 'search_players',
      description: 'Search players by name (requires players data to be cached)',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query (player name)',
          },
          sport: {
            type: 'string',
            description: 'The sport (currently only "nfl" is supported)',
            default: 'nfl',
          },
          limit: {
            type: 'string',
            description: 'Maximum number of results (default: 10)',
            default: '10',
          },
        },
        required: ['query'],
      },
    },
    handler: async (args: any) => {
      const { query, sport = 'nfl', limit = '10' } = z.object({
        query: z.string(),
        sport: z.string().optional(),
        limit: z.string().optional()
      }).parse(args);
      const players = await playerService.searchPlayers(query, sport, parseInt(limit));
      return await formatJsonResponse(`Search Results for "${query}" (${players.length} players)`, players);
    },
  },

  get_players_by_position: {
    schema: {
      name: 'get_players_by_position',
      description: 'Get players by position (requires players data to be cached)',
      inputSchema: {
        type: 'object',
        properties: {
          position: {
            type: 'string',
            description: 'Player position (QB, RB, WR, TE, K, DEF, etc.)',
          },
          sport: {
            type: 'string',
            description: 'The sport (currently only "nfl" is supported)',
            default: 'nfl',
          },
          limit: {
            type: 'string',
            description: 'Maximum number of results (default: 50)',
            default: '50',
          },
        },
        required: ['position'],
      },
    },
    handler: async (args: any) => {
      const { position, sport = 'nfl', limit = '50' } = z.object({
        position: z.string(),
        sport: z.string().optional(),
        limit: z.string().optional()
      }).parse(args);
      const players = await playerService.getPlayersByPosition(position, sport, parseInt(limit));
      return await formatJsonResponse(`Players by Position (${position})`, players);
    },
  },

  get_players_by_team: {
    schema: {
      name: 'get_players_by_team',
      description: 'Get players by team (requires players data to be cached)',
      inputSchema: {
        type: 'object',
        properties: {
          team: {
            type: 'string',
            description: 'Team abbreviation (e.g., KC, BUF, SF, etc.)',
          },
          sport: {
            type: 'string',
            description: 'The sport (currently only "nfl" is supported)',
            default: 'nfl',
          },
          limit: {
            type: 'string',
            description: 'Maximum number of results (default: 50)',
            default: '50',
          },
        },
        required: ['team'],
      },
    },
    handler: async (args: any) => {
      const { team, sport = 'nfl', limit = '50' } = z.object({
        team: z.string(),
        sport: z.string().optional(),
        limit: z.string().optional()
      }).parse(args);
      const players = await playerService.getPlayersByTeam(team, sport, parseInt(limit));
      return await formatJsonResponse(`Players by Team (${team})`, players);
    },
  },

  get_trending_players: {
    schema: {
      name: 'get_trending_players',
      description: 'Get trending players based on add/drop activity',
      inputSchema: {
        type: 'object',
        properties: {
          sport: {
            type: 'string',
            description: 'The sport (currently only "nfl" is supported)',
            default: 'nfl',
          },
          type: {
            type: 'string',
            description: 'Either "add" or "drop"',
            enum: ['add', 'drop'],
          },
          lookbackHours: {
            type: 'string',
            description: 'Number of hours to look back (default is 24)',
            default: '24',
          },
          limit: {
            type: 'string',
            description: 'Number of results (default is 25)',
            default: '25',
          },
        },
        required: ['type'],
      },
    },
    handler: async (args: any) => {
      const { sport = 'nfl', type, lookbackHours = '24', limit = '25' } = z.object({
        sport: z.string().optional(),
        type: z.enum(['add', 'drop']),
        lookbackHours: z.string().optional(),
        limit: z.string().optional()
      }).parse(args);
      const trending = await makeSleeperRequest(`/players/${sport}/trending/${type}?lookback_hours=${lookbackHours}&limit=${limit}`, {
        sport, type, lookbackHours, limit
      });
      return await formatJsonResponse('Trending Players', trending);
    },
  },
};
