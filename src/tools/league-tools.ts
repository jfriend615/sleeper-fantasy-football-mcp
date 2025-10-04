import { z } from 'zod';
import { makeSleeperRequest } from '../api-service.js';
import { formatJsonResponse } from '../utils/response-helpers.js';

export const leagueTools = {
  get_league: {
    schema: {
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
    handler: async (args: any) => {
      const { leagueId } = z.object({ leagueId: z.string() }).parse(args);
      const league = await makeSleeperRequest(`/league/${leagueId}`, { leagueId });
      return await formatJsonResponse('League Information', league);
    },
  },

  get_league_rosters: {
    schema: {
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
    handler: async (args: any) => {
      const { leagueId } = z.object({ leagueId: z.string() }).parse(args);
      const rosters = await makeSleeperRequest(`/league/${leagueId}/rosters`, { leagueId });
      return await formatJsonResponse('League Rosters', rosters);
    },
  },

  get_league_users: {
    schema: {
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
    handler: async (args: any) => {
      const { leagueId } = z.object({ leagueId: z.string() }).parse(args);
      const users = await makeSleeperRequest(`/league/${leagueId}/users`, { leagueId });
      return await formatJsonResponse('League Users', users);
    },
  },

  get_league_matchups: {
    schema: {
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
    handler: async (args: any) => {
      const { leagueId, week } = z.object({
        leagueId: z.string(),
        week: z.string()
      }).parse(args);
      const matchups = await makeSleeperRequest(`/league/${leagueId}/matchups/${week}`, { leagueId, week });
      return await formatJsonResponse(`League Matchups (Week ${week})`, matchups);
    },
  },

  get_league_playoff_bracket: {
    schema: {
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
    handler: async (args: any) => {
      const { leagueId } = z.object({ leagueId: z.string() }).parse(args);
      const bracket = await makeSleeperRequest(`/league/${leagueId}/bracket`, { leagueId });
      return await formatJsonResponse('Playoff Bracket', bracket);
    },
  },

  get_league_transactions: {
    schema: {
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
    handler: async (args: any) => {
      const { leagueId, round } = z.object({
        leagueId: z.string(),
        round: z.string().optional()
      }).parse(args);
      const endpoint = round ? `/league/${leagueId}/transactions/${round}` : `/league/${leagueId}/transactions`;
      const transactions = await makeSleeperRequest(endpoint, { leagueId, round });
      return await formatJsonResponse(`League Transactions${round ? ` (Round ${round})` : ''}`, transactions);
    },
  },

  get_league_traded_picks: {
    schema: {
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
    handler: async (args: any) => {
      const { leagueId } = z.object({ leagueId: z.string() }).parse(args);
      const tradedPicks = await makeSleeperRequest(`/league/${leagueId}/traded_picks`, { leagueId });
      return await formatJsonResponse('Traded Picks', tradedPicks);
    },
  },

  get_league_drafts: {
    schema: {
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
    handler: async (args: any) => {
      const { leagueId } = z.object({ leagueId: z.string() }).parse(args);
      const drafts = await makeSleeperRequest(`/league/${leagueId}/drafts`, { leagueId });
      return await formatJsonResponse('League Drafts', drafts);
    },
  },
};
