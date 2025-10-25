import { formatJsonResponse, makeSleeperRequest } from '@sleeper-fantasy-football/core';

export const systemTools = {
  get_nfl_state: {
    schema: {
      name: 'get_nfl_state',
      description: 'Get current NFL state information',
      inputSchema: {
        type: 'object',
        properties: {
          random_string: {
            type: 'string',
            description: 'Dummy parameter for no-parameter tools',
          },
        },
        required: ['random_string'],
      },
    },
    handler: async (args: any) => {
      const state = await makeSleeperRequest('/state/nfl');
      return await formatJsonResponse('NFL State', state);
    },
  },
};
