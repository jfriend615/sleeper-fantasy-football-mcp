#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { makeSleeperRequest } from './api-service.js';
import { PlayerService } from './player-service.js';

// Define the server
const server = new Server(
  {
    name: 'sleeper-fantasy-football-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Initialize player service
const playerService = new PlayerService();

// Define tools for Sleeper Fantasy Football API
const tools: Tool[] = [
  // User endpoints
  {
    name: 'get_user',
    description: 'Get user information by username or user_id',
    inputSchema: {
      type: 'object',
      properties: {
        identifier: {
          type: 'string',
          description: 'The Sleeper username or user_id to look up',
        },
      },
      required: ['identifier'],
    },
  },

  // League endpoints
  {
    name: 'get_user_leagues',
    description: 'Get all leagues for a user by sport and season',
    inputSchema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'The user ID to get leagues for',
        },
        sport: {
          type: 'string',
          description: 'The sport (currently only "nfl" is supported)',
          default: 'nfl',
        },
        season: {
          type: 'string',
          description: 'The season year (e.g., "2023", "2024")',
        },
      },
      required: ['userId', 'season'],
    },
  },
  {
    name: 'get_league',
    description: 'Get league information by league ID',
    inputSchema: {
      type: 'object',
      properties: {
        leagueId: {
          type: 'string',
          description: 'The Sleeper league ID',
        },
      },
      required: ['leagueId'],
    },
  },
  {
    name: 'get_league_rosters',
    description: 'Get all rosters for a league',
    inputSchema: {
      type: 'object',
      properties: {
        leagueId: {
          type: 'string',
          description: 'The Sleeper league ID',
        },
      },
      required: ['leagueId'],
    },
  },
  {
    name: 'get_league_users',
    description: 'Get all users in a league',
    inputSchema: {
      type: 'object',
      properties: {
        leagueId: {
          type: 'string',
          description: 'The Sleeper league ID',
        },
      },
      required: ['leagueId'],
    },
  },
  {
    name: 'get_league_matchups',
    description: 'Get matchups for a specific week in a league',
    inputSchema: {
      type: 'object',
      properties: {
        leagueId: {
          type: 'string',
          description: 'The Sleeper league ID',
        },
        week: {
          type: 'string',
          description: 'The week number (1-18 for regular season)',
        },
      },
      required: ['leagueId', 'week'],
    },
  },
  {
    name: 'get_league_playoff_bracket',
    description: 'Get the playoff bracket for a league',
    inputSchema: {
      type: 'object',
      properties: {
        leagueId: {
          type: 'string',
          description: 'The Sleeper league ID',
        },
      },
      required: ['leagueId'],
    },
  },
  {
    name: 'get_league_transactions',
    description: 'Get transactions for a league',
    inputSchema: {
      type: 'object',
      properties: {
        leagueId: {
          type: 'string',
          description: 'The Sleeper league ID',
        },
        round: {
          type: 'string',
          description: 'The round number (optional)',
        },
      },
      required: ['leagueId'],
    },
  },
  {
    name: 'get_league_traded_picks',
    description: 'Get traded picks for a league',
    inputSchema: {
      type: 'object',
      properties: {
        leagueId: {
          type: 'string',
          description: 'The Sleeper league ID',
        },
      },
      required: ['leagueId'],
    },
  },
  {
    name: 'get_nfl_state',
    description: 'Get current NFL state information',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },

  // Draft endpoints
  {
    name: 'get_user_drafts',
    description: 'Get all drafts for a user by sport and season',
    inputSchema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'The user ID to get drafts for',
        },
        sport: {
          type: 'string',
          description: 'The sport (currently only "nfl" is supported)',
          default: 'nfl',
        },
        season: {
          type: 'string',
          description: 'The season year (e.g., "2023", "2024")',
        },
      },
      required: ['userId', 'season'],
    },
  },
  {
    name: 'get_league_drafts',
    description: 'Get all drafts for a league',
    inputSchema: {
      type: 'object',
      properties: {
        leagueId: {
          type: 'string',
          description: 'The Sleeper league ID',
        },
      },
      required: ['leagueId'],
    },
  },
  {
    name: 'get_draft',
    description: 'Get a specific draft by draft ID',
    inputSchema: {
      type: 'object',
      properties: {
        draftId: {
          type: 'string',
          description: 'The Sleeper draft ID',
        },
      },
      required: ['draftId'],
    },
  },
  {
    name: 'get_draft_picks',
    description: 'Get all picks in a draft',
    inputSchema: {
      type: 'object',
      properties: {
        draftId: {
          type: 'string',
          description: 'The Sleeper draft ID',
        },
      },
      required: ['draftId'],
    },
  },
  {
    name: 'get_draft_traded_picks',
    description: 'Get traded picks in a draft',
    inputSchema: {
      type: 'object',
      properties: {
        draftId: {
          type: 'string',
          description: 'The Sleeper draft ID',
        },
      },
      required: ['draftId'],
    },
  },

  // Player endpoints - NEW TARGETED APPROACH
  {
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
  {
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
  {
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
  {
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
  {
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
];

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_user': {
        const { identifier } = z.object({ identifier: z.string() }).parse(args);
        const user = await makeSleeperRequest(`/user/${identifier}`);
        return {
          content: [
            {
              type: 'text',
              text: `User Information:\n${JSON.stringify(user, null, 2)}`,
            },
          ],
        };
      }

      case 'get_user_leagues': {
        const { userId, sport = 'nfl', season } = z.object({
          userId: z.string(),
          sport: z.string().optional(),
          season: z.string()
        }).parse(args);
        const leagues = await makeSleeperRequest(`/user/${userId}/leagues/${sport}/${season}`, { userId, sport, season });
        return {
          content: [
            {
              type: 'text',
              text: `User Leagues (${sport} ${season}):\n${JSON.stringify(leagues, null, 2)}`,
            },
          ],
        };
      }

      case 'get_league': {
        const { leagueId } = z.object({ leagueId: z.string() }).parse(args);
        const league = await makeSleeperRequest(`/league/${leagueId}`, { leagueId });
        return {
          content: [
            {
              type: 'text',
              text: `League Information:\n${JSON.stringify(league, null, 2)}`,
            },
          ],
        };
      }

      case 'get_league_rosters': {
        const { leagueId } = z.object({ leagueId: z.string() }).parse(args);
        const rosters = await makeSleeperRequest(`/league/${leagueId}/rosters`, { leagueId });
        return {
          content: [
            {
              type: 'text',
              text: `League Rosters:\n${JSON.stringify(rosters, null, 2)}`,
            },
          ],
        };
      }

      case 'get_league_users': {
        const { leagueId } = z.object({ leagueId: z.string() }).parse(args);
        const users = await makeSleeperRequest(`/league/${leagueId}/users`, { leagueId });
        return {
          content: [
            {
              type: 'text',
              text: `League Users:\n${JSON.stringify(users, null, 2)}`,
            },
          ],
        };
      }

      case 'get_league_matchups': {
        const { leagueId, week } = z.object({
          leagueId: z.string(),
          week: z.string()
        }).parse(args);
        const matchups = await makeSleeperRequest(`/league/${leagueId}/matchups/${week}`, { leagueId, week });
        return {
          content: [
            {
              type: 'text',
              text: `League Matchups (Week ${week}):\n${JSON.stringify(matchups, null, 2)}`,
            },
          ],
        };
      }

      case 'get_league_playoff_bracket': {
        const { leagueId } = z.object({ leagueId: z.string() }).parse(args);
        const bracket = await makeSleeperRequest(`/league/${leagueId}/bracket`, { leagueId });
        return {
          content: [
            {
              type: 'text',
              text: `Playoff Bracket:\n${JSON.stringify(bracket, null, 2)}`,
            },
          ],
        };
      }

      case 'get_league_transactions': {
        const { leagueId, round } = z.object({
          leagueId: z.string(),
          round: z.string().optional()
        }).parse(args);
        const endpoint = round ? `/league/${leagueId}/transactions/${round}` : `/league/${leagueId}/transactions`;
        const transactions = await makeSleeperRequest(endpoint, { leagueId, round });
        return {
          content: [
            {
              type: 'text',
              text: `League Transactions${round ? ` (Round ${round})` : ''}:\n${JSON.stringify(transactions, null, 2)}`,
            },
          ],
        };
      }

      case 'get_league_traded_picks': {
        const { leagueId } = z.object({ leagueId: z.string() }).parse(args);
        const tradedPicks = await makeSleeperRequest(`/league/${leagueId}/traded_picks`, { leagueId });
        return {
          content: [
            {
              type: 'text',
              text: `Traded Picks:\n${JSON.stringify(tradedPicks, null, 2)}`,
            },
          ],
        };
      }

      case 'get_nfl_state': {
        const state = await makeSleeperRequest('/state/nfl');
        return {
          content: [
            {
              type: 'text',
              text: `NFL State:\n${JSON.stringify(state, null, 2)}`,
            },
          ],
        };
      }

      case 'get_user_drafts': {
        const { userId, sport = 'nfl', season } = z.object({
          userId: z.string(),
          sport: z.string().optional(),
          season: z.string()
        }).parse(args);
        const drafts = await makeSleeperRequest(`/user/${userId}/drafts/${sport}/${season}`, { userId, sport, season });
        return {
          content: [
            {
              type: 'text',
              text: `User Drafts (${sport} ${season}):\n${JSON.stringify(drafts, null, 2)}`,
            },
          ],
        };
      }

      case 'get_league_drafts': {
        const { leagueId } = z.object({ leagueId: z.string() }).parse(args);
        const drafts = await makeSleeperRequest(`/league/${leagueId}/drafts`, { leagueId });
        return {
          content: [
            {
              type: 'text',
              text: `League Drafts:\n${JSON.stringify(drafts, null, 2)}`,
            },
          ],
        };
      }

      case 'get_draft': {
        const { draftId } = z.object({ draftId: z.string() }).parse(args);
        const draft = await makeSleeperRequest(`/draft/${draftId}`, { draftId });
        return {
          content: [
            {
              type: 'text',
              text: `Draft Information:\n${JSON.stringify(draft, null, 2)}`,
            },
          ],
        };
      }

      case 'get_draft_picks': {
        const { draftId } = z.object({ draftId: z.string() }).parse(args);
        const picks = await makeSleeperRequest(`/draft/${draftId}/picks`, { draftId });
        return {
          content: [
            {
              type: 'text',
              text: `Draft Picks:\n${JSON.stringify(picks, null, 2)}`,
            },
          ],
        };
      }

      case 'get_draft_traded_picks': {
        const { draftId } = z.object({ draftId: z.string() }).parse(args);
        const tradedPicks = await makeSleeperRequest(`/draft/${draftId}/traded_picks`, { draftId });
        return {
          content: [
            {
              type: 'text',
              text: `Draft Traded Picks:\n${JSON.stringify(tradedPicks, null, 2)}`,
            },
          ],
        };
      }

      // NEW PLAYER TOOLS
      case 'get_players': {
        const { playerIds, sport = 'nfl' } = z.object({
          playerIds: z.array(z.string()),
          sport: z.string().optional()
        }).parse(args);
        const players = await playerService.getPlayers(playerIds, sport);
        return {
          content: [
            {
              type: 'text',
              text: `Players Information (${players.length} found):\n${JSON.stringify(players, null, 2)}`,
            },
          ],
        };
      }

      case 'search_players': {
        const { query, sport = 'nfl', limit = '10' } = z.object({
          query: z.string(),
          sport: z.string().optional(),
          limit: z.string().optional()
        }).parse(args);
        const players = await playerService.searchPlayers(query, sport, parseInt(limit));
        return {
          content: [
            {
              type: 'text',
              text: `Search Results for "${query}" (${players.length} players):\n${JSON.stringify(players, null, 2)}`,
            },
          ],
        };
      }

      case 'get_players_by_position': {
        const { position, sport = 'nfl', limit = '50' } = z.object({
          position: z.string(),
          sport: z.string().optional(),
          limit: z.string().optional()
        }).parse(args);
        const players = await playerService.getPlayersByPosition(position, sport, parseInt(limit));
        return {
          content: [
            {
              type: 'text',
              text: `Players by Position (${position}):\n${JSON.stringify(players, null, 2)}`,
            },
          ],
        };
      }

      case 'get_players_by_team': {
        const { team, sport = 'nfl', limit = '50' } = z.object({
          team: z.string(),
          sport: z.string().optional(),
          limit: z.string().optional()
        }).parse(args);
        const players = await playerService.getPlayersByTeam(team, sport, parseInt(limit));
        return {
          content: [
            {
              type: 'text',
              text: `Players by Team (${team}):\n${JSON.stringify(players, null, 2)}`,
            },
          ],
        };
      }

      case 'get_trending_players': {
        const { sport = 'nfl', type, lookbackHours = '24', limit = '25' } = z.object({
          sport: z.string().optional(),
          type: z.enum(['add', 'drop']),
          lookbackHours: z.string().optional(),
          limit: z.string().optional()
        }).parse(args);
        const trending = await makeSleeperRequest(`/players/${sport}/trending/${type}?lookback_hours=${lookbackHours}&limit=${limit}`, {
          sport, type, lookbackHours, limit
        });
        return {
          content: [
            {
              type: 'text',
              text: `Trending Players (${type}):\n${JSON.stringify(trending, null, 2)}`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Sleeper Fantasy Football MCP server with intelligent caching running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
