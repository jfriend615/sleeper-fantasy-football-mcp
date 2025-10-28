import { UpstashCache } from './upstash-cache.js';
import type { SleeperPlayer } from './types.js';

export class PlayerService {
  private upstashCache: UpstashCache;

  constructor() {
    this.upstashCache = new UpstashCache();
  }

  private async fetchFromSleeper(sport: string): Promise<Record<string, SleeperPlayer>> {
    const response = await fetch(`https://api.sleeper.app/v1/players/${sport}`);
    if (!response.ok) throw new Error(`Failed to fetch players: ${response.statusText}`);
    return await response.json() as Record<string, SleeperPlayer>;
  }

  private async loadPlayers(sport: string): Promise<Record<string, SleeperPlayer> | null> {
    // Try cache first
    let players = await this.upstashCache.loadPlayers(sport);

    // If cache miss, fetch and cache
    if (!players) {
      players = await this.fetchFromSleeper(sport);
      await this.upstashCache.savePlayers(sport, players);
    }

    return players;
  }

  async getPlayer(playerId: string, sport: string = 'nfl'): Promise<SleeperPlayer | null> {
    const players = await this.loadPlayers(sport);
    if (!players) {
      throw new Error('Failed to load players data from cache or API.');
    }
    return players[playerId] || null;
  }

  async getPlayers(playerIds: string[], sport: string = 'nfl'): Promise<SleeperPlayer[]> {
    const players = await this.loadPlayers(sport);
    if (!players) {
      throw new Error('Failed to load players data from cache or API.');
    }

    return playerIds
      .map(id => players[id])
      .filter((player): player is SleeperPlayer => player !== undefined); // Filter out any missing players
  }

  async searchPlayers(query: string, sport: string = 'nfl', limit: number = 10): Promise<SleeperPlayer[]> {
    const players = await this.loadPlayers(sport);
    if (!players) {
      throw new Error('Failed to load players data from cache or API.');
    }

    const results = Object.values(players)
      .filter((player: SleeperPlayer) =>
        player.full_name?.toLowerCase().includes(query.toLowerCase()) ||
        player.first_name?.toLowerCase().includes(query.toLowerCase()) ||
        player.last_name?.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, limit);

    return results;
  }

  async getPlayersByPosition(position: string, sport: string = 'nfl', limit: number = 50): Promise<SleeperPlayer[]> {
    const players = await this.loadPlayers(sport);
    if (!players) {
      throw new Error('Failed to load players data from cache or API.');
    }

    const results = Object.values(players)
      .filter((player: SleeperPlayer) => player.position === position)
      .slice(0, limit);

    return results;
  }

  async getPlayersByTeam(team: string, sport: string = 'nfl', limit: number = 50): Promise<SleeperPlayer[]> {
    const players = await this.loadPlayers(sport);
    if (!players) {
      throw new Error('Failed to load players data from cache or API.');
    }

    const results = Object.values(players)
      .filter((player: SleeperPlayer) => player.team === team)
      .slice(0, limit);

    return results;
  }
}
