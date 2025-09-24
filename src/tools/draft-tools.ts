import { z } from 'zod';
import { makeSleeperRequest } from '../api-service.js';
import { formatJsonResponse } from '../utils/response-helpers.js';

export const draftTools = {
  get_draft: {
    schema: {
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
    handler: async (args: any) => {
      const { draftId } = z.object({ draftId: z.string() }).parse(args);
      const draft = await makeSleeperRequest(`/draft/${draftId}`, { draftId });
      return formatJsonResponse('Draft Information', draft);
    },
  },

  get_draft_picks: {
    schema: {
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
    handler: async (args: any) => {
      const { draftId } = z.object({ draftId: z.string() }).parse(args);
      const picks = await makeSleeperRequest(`/draft/${draftId}/picks`, { draftId });
      return formatJsonResponse('Draft Picks', picks);
    },
  },

  get_draft_traded_picks: {
    schema: {
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
    handler: async (args: any) => {
      const { draftId } = z.object({ draftId: z.string() }).parse(args);
      const tradedPicks = await makeSleeperRequest(`/draft/${draftId}/traded_picks`, { draftId });
      return formatJsonResponse('Draft Traded Picks', tradedPicks);
    },
  },
};
