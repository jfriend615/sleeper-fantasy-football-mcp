import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { getAllTools, callTool } from '@sleeper-fantasy-football/mcp-sleeper';
import { createRegisterHandler, validateToken } from './controllers/remote.js';

const app = express();
app.use(express.json());

// Require auth token at startup
const MCP_AUTH_TOKEN = process.env.MCP_AUTH_TOKEN;
if (!MCP_AUTH_TOKEN) {
  console.error('❌ MCP_AUTH_TOKEN environment variable is required');
  console.error('   Set it in your environment or .env file');
  process.exit(1);
}

// Authentication middleware for /mcp - accepts Bearer header or ?token query param
app.use('/mcp', (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization || '';
  const bearer = header.startsWith('Bearer ') ? header.slice(7) : undefined;
  const qToken = typeof req.query.token === 'string' ? req.query.token : undefined;
  const token = bearer ?? qToken;

  if (!validateToken(token, MCP_AUTH_TOKEN)) {
    return res.status(401).set('WWW-Authenticate', 'Bearer').send('Unauthorized');
  }

  next();
});

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

// Gated /register endpoint - requires ?reg=SECRET
app.post(
  '/register',
  createRegisterHandler({
    getBaseUrl: (req) => `${req.protocol}://${req.get('host')}`,
    registrationSecret: MCP_AUTH_TOKEN
  })
);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`MCP server running on port ${port}`);
});
