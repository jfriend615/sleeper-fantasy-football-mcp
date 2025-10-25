import { userTools } from './user-tools';
import { leagueTools } from './league-tools';
import { playerTools } from './player-tools';
import { draftTools } from './draft-tools';
import { systemTools } from './system-tools';

// Define the tool structure type
interface ToolDefinition {
  schema: {
    name: string;
    description: string;
    inputSchema: any;
  };
  handler: (args: any) => Promise<any>;
}

// Combine all tool modules into a single registry
const toolRegistry: Record<string, ToolDefinition> = {
  ...userTools,
  ...leagueTools,
  ...playerTools,
  ...draftTools,
  ...systemTools,
};

// Extract schemas for MCP
export const getAllTools = () => {
  return Object.values(toolRegistry).map(tool => tool.schema);
};

// Get handler by name
export const getToolHandler = (name: string) => {
  const tool = toolRegistry[name];
  if (!tool) {
    throw new Error(`Unknown tool: ${name}`);
  }
  return tool.handler;
};

// Call tool by name
export const callTool = async (name: string, args: any) => {
  const handler = getToolHandler(name);
  return await handler(args);
};
