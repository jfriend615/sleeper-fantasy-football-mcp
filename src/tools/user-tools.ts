import { z } from 'zod';
import { makeSleeperRequest } from '../api-service.js';
import { formatJsonResponse } from '../utils/response-helpers.js';

export const userTools = {
  get_user: {
    schema: {
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
    handler: async (args: any) => {
      const { identifier } = z.object({ identifier: z.string() }).parse(args);
      const user = await makeSleeperRequest(`/user/${identifier}`);
      return formatJsonResponse('User Information', user);
    },
  },

  get_user_leagues: {
    schema: {
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
    handler: async (args: any) => {
      const { userId, sport = 'nfl', season } = z.object({
        userId: z.string(),
        sport: z.string().optional(),
        season: z.string()
      }).parse(args);
      const leagues = await makeSleeperRequest(`/user/${userId}/leagues/${sport}/${season}`, { userId, sport, season });
      return formatJsonResponse(`User Leagues (${sport} ${season})`, leagues);
    },
  },

  get_user_drafts: {
    schema: {
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
    handler: async (args: any) => {
      const { userId, sport = 'nfl', season } = z.object({
        userId: z.string(),
        sport: z.string().optional(),
        season: z.string()
      }).parse(args);
      const drafts = await makeSleeperRequest(`/user/${userId}/drafts/${sport}/${season}`, { userId, sport, season });
      return formatJsonResponse(`User Drafts (${sport} ${season})`, drafts);
    },
  },
};
