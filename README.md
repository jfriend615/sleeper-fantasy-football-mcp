# Sleeper Fantasy Football MCP Server

A comprehensive Model Context Protocol (MCP) server that provides access to the complete [Sleeper Fantasy Football API](https://docs.sleeper.com/#introduction).

## Features

### User Management
- **get_user** - Get user information by username or user_id
- **get_user_leagues** - Get all leagues for a user by sport and season
- **get_user_drafts** - Get all drafts for a user by sport and season

### League Management
- **get_league** - Get league information by league ID
- **get_league_rosters** - Get all rosters for a league
- **get_league_users** - Get all users in a league
- **get_league_matchups** - Get matchups for a specific week in a league
- **get_league_playoff_bracket** - Get the playoff bracket for a league
- **get_league_transactions** - Get transactions for a league
- **get_league_traded_picks** - Get traded picks for a league
- **get_league_drafts** - Get all drafts for a league

### Draft Management
- **get_draft** - Get a specific draft by draft ID
- **get_draft_picks** - Get all picks in a draft
- **get_draft_traded_picks** - Get traded picks in a draft

### Player Data
- **get_players** - Get multiple players by their IDs (requires players data to be cached)
- **search_players** - Search players by name (requires players data to be cached)
- **get_players_by_position** - Get players by position (QB, RB, WR, TE, K, DEF, etc.)
- **get_players_by_team** - Get players by team abbreviation (e.g., KC, BUF, SF, etc.)
- **get_players_by_status** - Get players by status (Active, Inactive, IR, etc.)
- **get_players_cache_info** - Get information about the cached players data
- **get_trending_players** - Get trending players based on add/drop activity

### System Information
- **get_nfl_state** - Get current NFL state information

## Installation

```bash
npm install
```

## Setup

For player-related tools to work, you need to fetch and cache the player data first:

```bash
# Fetch and cache NFL player data (~5MB)
npm run fetch-players

# Or run the complete setup (fetch players + build)
npm run setup
```

This creates a local cache of all NFL players that the enhanced player tools use for fast lookups.

## Development

```bash
# Run in development mode
npm run dev

# Build the project
npm run build

# Run the built version
npm start
```

## Usage

This MCP server provides 23 tools covering all aspects of the Sleeper Fantasy Football API:

### Example: Get User Information
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_user",
    "arguments": {
      "identifier": "sleeper"
    }
  }
}
```

### Example: Get League Matchups
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "get_league_matchups",
    "arguments": {
      "leagueId": "123456789",
      "week": "1"
    }
  }
}
```

### Example: Get Trending Players
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "get_trending_players",
    "arguments": {
      "type": "add",
      "lookbackHours": "24",
      "limit": "10"
    }
  }
}
```

### Example: Search Players
```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "search_players",
    "arguments": {
      "query": "mahomes",
      "limit": "5"
    }
  }
}
```

### Example: Get Players by Position
```json
{
  "jsonrpc": "2.0",
  "id": 5,
  "method": "tools/call",
  "params": {
    "name": "get_players_by_position",
    "arguments": {
      "position": "QB",
      "limit": "10"
    }
  }
}
```

## API Reference

The server uses the complete [Sleeper Fantasy Football API](https://docs.sleeper.com/#introduction) which includes:

- **Rate Limits**: Stay under 1000 API calls per minute to avoid IP blocking
- **No Authentication**: Read-only API, no tokens required
- **Data Types**: User data, league information, rosters, matchups, drafts, players, and more
- **Intelligent Caching**: Multi-tier caching system with persistent player data storage for optimal performance

## Testing

Run the test suite to verify all tools are working:

```bash
# Test the MCP server functionality
npm test

# Or run directly
node test-server.js

# See usage examples for all tools
node examples.js
```

## License

ISC
