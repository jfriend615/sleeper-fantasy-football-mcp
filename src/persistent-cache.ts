import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

export class PersistentCache {
  private cacheDir: string;

  constructor() {
    // Check for environment variable first, then fall back to absolute path
    const projectRoot = process.env.MCP_PROJECT_ROOT || '/Users/jordanfreund/sleeper-fantasy-football-mcp';
    this.cacheDir = join(projectRoot, '.cache');
    this.ensureCacheDir();
  }

  private async ensureCacheDir(): Promise<void> {
    if (!existsSync(this.cacheDir)) {
      await mkdir(this.cacheDir, { recursive: true });
    }
  }

  // Save players data to file
  async savePlayers(sport: string, data: any): Promise<void> {
    await this.ensureCacheDir();
    const filePath = join(this.cacheDir, `players-${sport}.json`);
    const cacheData = {
      data,
      timestamp: Date.now(),
      sport
    };
    await writeFile(filePath, JSON.stringify(cacheData, null, 2));
  }

  // Load players data from file
  async loadPlayers(sport: string): Promise<any | null> {
    const filePath = join(this.cacheDir, `players-${sport}.json`);

    if (!existsSync(filePath)) {
      return null;
    }

    try {
      const content = await readFile(filePath, 'utf-8');
      const cacheData = JSON.parse(content);

      // Check if data is still fresh (24 hours)
      const age = Date.now() - cacheData.timestamp;
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      if (age > maxAge) {
        return null; // Data is stale
      }

      return cacheData.data;
    } catch (error) {
      return null;
    }
  }
}
