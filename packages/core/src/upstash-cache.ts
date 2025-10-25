import { Redis } from '@upstash/redis';

export class UpstashCache {
  private redis: Redis;

  constructor() {
    // Initialize with env vars (set in Vercel dashboard)
    this.redis = Redis.fromEnv();
  }

  async savePlayers(sport: string, data: any): Promise<void> {
    const key = `players:${sport}:full`;
    const cacheData = {
      data,
      timestamp: Date.now(),
      sport
    };

    // Set with 4 hour TTL
    await this.redis.setex(key, 14400, JSON.stringify(cacheData));
  }

  async loadPlayers(sport: string): Promise<any | null> {
    const key = `players:${sport}:full`;
    const cached = await this.redis.get(key);

    if (!cached) return null;

    const cacheData = typeof cached === 'string' ? JSON.parse(cached) : cached;
    return cacheData.data;
  }
}
