# Sleeper Fantasy Football MCP - Express Server

Express server using the official MCP SDK's `StreamableHTTPServerTransport` for proper protocol support.

## Quick Start

### Install Dependencies

```bash
cd apps/express-server
npm install
```

### Set Up Authentication

Create `.env` file:

```bash
# Generate a secure token
openssl rand -base64 32

# Create .env file
echo "MCP_AUTH_TOKEN=your-generated-token-here" > .env
```

Or set environment variable directly:

```bash
export MCP_AUTH_TOKEN="your-secret-token"
```

⚠️ **Required**: Server will not start without `MCP_AUTH_TOKEN` set.

### Run Locally

```bash
npm run dev
```

Server runs at `http://localhost:3000/mcp`

### Test

```bash
curl -X POST http://localhost:3000/mcp \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":"1","method":"tools/list","params":{}}'
```

## Deploy to Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Set auth token (REQUIRED)
railway variables set MCP_AUTH_TOKEN=your-secure-token-here

# Deploy
railway up

# Get URL
railway domain
```

## Deploy to Fly.io

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Launch app
fly launch

# Deploy
fly deploy
```

## Deploy to Render

1. Push to GitHub
2. Go to render.com
3. New → Web Service
4. Connect your repo
5. Build Command: `cd apps/express-server && npm install && npm run build`
6. Start Command: `cd apps/express-server && npm start`

## Client Configuration

```json
{
  "mcpServers": {
    "sleeper": {
      "type": "http",
      "url": "https://YOUR_DOMAIN/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_MCP_AUTH_TOKEN"
      }
    }
  }
}
```

## Environment Variables

**Required:**
- `MCP_AUTH_TOKEN` - Bearer token for authentication (server exits if not set)

**Optional:**
- `PORT` - Server port (default: 3000)
- `UPSTASH_REDIS_REST_URL` - Redis URL for caching
- `UPSTASH_REDIS_REST_TOKEN` - Redis token

## Security

✅ **Bearer token authentication is enforced:**
- Server exits if `MCP_AUTH_TOKEN` is not set
- Timing-safe token comparison prevents timing attacks
- All `/mcp` requests require valid Bearer token
- Returns 401 Unauthorized for invalid/missing tokens

Generate a secure token:
```bash
openssl rand -base64 32
```

## Architecture

```
Express Server
├── StreamableHTTPServerTransport (MCP SDK)
├── McpServer (registers tools)
└── @sleeper-fantasy-football/mcp-sleeper (tool implementations)
```
