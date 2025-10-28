import express, { Request, Response } from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { getAllTools, callTool } from '@sleeper-fantasy-football/mcp-sleeper';

const app = express();
app.use(express.json());

const server = new McpServer({
  name: 'sleeper-fantasy-football-mcp',
  version: '1.0.0'
});

// Register all tools from your package
const tools = getAllTools();
for (const tool of tools) {
  server.registerTool(
    tool.name,
    {
      description: tool.description,
      inputSchema: tool.inputSchema,
    },
    async (args: any) => {
      return await callTool(tool.name, args);
    }
  );
}

app.post('/mcp', async (req: Request, res: Response) => {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true
  });

  res.on('close', () => transport.close());

  await server.connect(transport);
  await transport.handleRequest(req as any, res as any, req.body);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`MCP server running on port ${port}`);
});
