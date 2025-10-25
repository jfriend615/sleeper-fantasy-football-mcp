# Fantasy Football MCP Web App

HTTP MCP server for Sleeper Fantasy Football API, deployed on Vercel.

## Features

- **HTTP MCP Endpoint**: `/api/mcp` with JSON-RPC 2.0 protocol
- **Bearer Token Authentication**: Secure access control
- **All Sleeper Tools**: User, League, Player, Draft, and System tools
- **Intelligent Caching**: Multi-tier caching with persistent storage
- **Player Enrichment**: Automatic player data injection

## Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp env.example .env.local
# Edit .env.local with your MCP_AUTH_TOKEN

# Run development server
npm run dev
```

## Deployment to Vercel

1. **Connect Repository**: Link your GitHub repo to Vercel
2. **Set Environment Variables**:
   - `MCP_AUTH_TOKEN`: Generate a secure random string
3. **Deploy**: Vercel will auto-deploy on push to main

## Usage

### Authentication
All requests require a Bearer token:
```bash
curl -X POST https://your-app.vercel.app/api/mcp \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

### List Available Tools
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list"
}
```

### Call a Tool
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "get_user",
    "arguments": {
      "identifier": "sleeper"
    }
  }
}
```

## Environment Variables

- `MCP_AUTH_TOKEN`: Required. Secure token for API access
- `MCP_PROJECT_ROOT`: Optional. Path to project root for cache files

## Architecture

- **Next.js App Router**: Modern React framework
- **JSON-RPC 2.0**: Standard protocol for MCP communication
- **Bearer Authentication**: Simple token-based security
- **Shared Tool Logic**: Reuses existing tool modules from `../../src/`

## Security

- All endpoints require valid Bearer token
- CORS configured for API access
- No persistent file system (uses Vercel's ephemeral storage)
- Rate limiting recommended for production use
