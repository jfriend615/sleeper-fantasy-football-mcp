import { PersistentCache } from './persistent-cache';
import type { SleeperPlayer } from './types';

export class PlayerService {
  private persistentCache: PersistentCache;

  constructor() {
    this.persistentCache = new PersistentCache();
  }

  private async loadPlayers(sport: string): Promise<Record<string, SleeperPlayer> | null> {
    return await this.persistentCache.loadPlayers(sport);
  }

  async getPlayer(playerId: string, sport: string = 'nfl'): Promise<SleeperPlayer | null> {
    const players = await this.loadPlayers(sport);
    if (!players) {
      throw new Error('Players data not available. Please run fetch-players.js first.');
    }
    return players[playerId] || null;
  }

  async getPlayers(playerIds: string[], sport: string = 'nfl'): Promise<SleeperPlayer[]> {
    const players = await this.loadPlayers(sport);
    if (!players) {
      throw new Error('Players data not available. Please run fetch-players.js first.');
    }

    return playerIds
      .map(id => players[id])
      .filter((player): player is SleeperPlayer => player !== undefined); // Filter out any missing players
  }

  async searchPlayers(query: string, sport: string = 'nfl', limit: number = 10): Promise<SleeperPlayer[]> {
    const players = await this.loadPlayers(sport);
    if (!players) {
      throw new Error('Players data not available. Please run fetch-players.js first.');
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
      throw new Error('Players data not available. Please run fetch-players.js first.');
    }

    const results = Object.values(players)
      .filter((player: SleeperPlayer) => player.position === position)
      .slice(0, limit);

    return results;
  }

  async getPlayersByTeam(team: string, sport: string = 'nfl', limit: number = 50): Promise<SleeperPlayer[]> {
    const players = await this.loadPlayers(sport);
    if (!players) {
      throw new Error('Players data not available. Please run fetch-players.js first.');
    }

    const results = Object.values(players)
      .filter((player: SleeperPlayer) => player.team === team)
      .slice(0, limit);

    return results;
  }
}
