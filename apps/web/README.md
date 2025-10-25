# Fantasy Football MCP Web App

HTTP MCP server for Sleeper Fantasy Football API, deployed on Vercel.

## Features

- **HTTP MCP Endpoint**: `/api/mcp` with JSON-RPC 2.0 protocol
- **Bearer Token Authentication**: Secure access control
- **All Sleeper Tools**: User, League, Player, Draft, and System tools
- **Upstash Redis Caching**: Persistent player data storage with 24-hour TTL
- **Auto-Fetch**: Player data automatically loads on first request
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
2. **Set Up Upstash Redis**:
   - Go to [Upstash Console](https://console.upstash.com/)
   - Create a free Redis database
   - Copy the REST URL and REST Token
3. **Set Environment Variables**:
   - `MCP_AUTH_TOKEN`: Generate a secure random string
   - `UPSTASH_REDIS_REST_URL`: Your Upstash Redis REST URL
   - `UPSTASH_REDIS_REST_TOKEN`: Your Upstash Redis REST Token
4. **Deploy**: Vercel will auto-deploy on push to main

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
- `UPSTASH_REDIS_REST_URL`: Required. Upstash Redis REST URL for player data caching
- `UPSTASH_REDIS_REST_TOKEN`: Required. Upstash Redis REST Token for authentication

## Architecture

- **Next.js App Router**: Modern React framework
- **JSON-RPC 2.0**: Standard protocol for MCP communication
- **Bearer Authentication**: Simple token-based security
- **Upstash Redis**: Persistent caching for player data (24-hour TTL)
- **Auto-Fetch**: Player data loads automatically on first request
- **Shared Tool Logic**: Reuses existing tool modules from `../../src/`

## Player Data Caching

The app automatically fetches and caches NFL player data from the Sleeper API:

- **First Request**: Fetches ~5MB of player data from Sleeper API (~5 seconds)
- **Subsequent Requests**: Instant response from Redis cache
- **Cache Duration**: 24 hours (configurable)
- **Auto-Refresh**: Cache expires and refreshes automatically
- **No Manual Setup**: No need to run scripts or pre-populate data

## Security

- All endpoints require valid Bearer token
- CORS configured for API access
- Upstash Redis provides persistent storage (no filesystem dependencies)
- Rate limiting recommended for production use
