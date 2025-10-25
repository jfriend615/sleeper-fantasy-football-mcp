#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types';
import { getAllTools, callTool } from '../packages/mcp-sleeper/src/tools/index';

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

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: getAllTools() };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    return await callTool(name, args);
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
