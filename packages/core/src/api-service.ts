import { SleeperCache } from './cache.js';
import { PersistentCache } from './persistent-cache.js';

// Global cache instances
const cache = new SleeperCache();
const persistentCache = new PersistentCache();

// Enhanced API request function with caching
export async function makeSleeperRequest(endpoint: string, params: Record<string, any> = {}): Promise<any> {
  if (endpoint.includes('/players/') && !endpoint.includes('/trending')) {
    const sport = params.sport || 'nfl';

    // Try persistent cache first
    const cachedPlayers = await persistentCache.loadPlayers(sport);
    if (cachedPlayers) {
      console.error(`Loaded players data from persistent cache (${sport})`);
      return cachedPlayers;
    }

    // If not in persistent cache, fetch from API
    console.error(`Fetching players data from API (${sport}) - this may take a moment...`);
    const baseUrl = 'https://api.sleeper.app/v1';
    const url = `${baseUrl}${endpoint}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Sleeper API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Save to persistent cache
      await persistentCache.savePlayers(sport, data);
      console.error(`Saved players data to persistent cache (${sport})`);

      // Also cache in memory for this session
      cache.set(endpoint, data, params);

      return data;
    } catch (error) {
      throw new Error(`Failed to fetch from Sleeper API: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // For all other endpoints, use regular in-memory cache
  const cachedData = cache.get(endpoint, params);
  if (cachedData) {
    return cachedData;
  }

  // Make API request
  const baseUrl = 'https://api.sleeper.app/v1';
  const url = `${baseUrl}${endpoint}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Sleeper API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Cache the response
    cache.set(endpoint, data, params);

    return data;
  } catch (error) {
    throw new Error(`Failed to fetch from Sleeper API: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
