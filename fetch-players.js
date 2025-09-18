#!/usr/bin/env node

import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

const CACHE_DIR = '.cache';

async function ensureCacheDir() {
  if (!existsSync(CACHE_DIR)) {
    await mkdir(CACHE_DIR, { recursive: true });
  }
}

async function fetchPlayers(sport = 'nfl') {
  console.log(`🏈 Fetching ${sport.toUpperCase()} players data from Sleeper API...`);
  console.log('⚠️  This may take a moment as the response is ~5MB...\n');

  const baseUrl = 'https://api.sleeper.app/v1';
  const url = `${baseUrl}/players/${sport}`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Sleeper API error: ${response.status} ${response.statusText}`);
    }

    console.log('📡 Response received, parsing JSON...');
    const data = await response.json();
    
    console.log(`✅ Successfully fetched ${Object.keys(data).length} players`);
    
    // Save to persistent cache
    await ensureCacheDir();
    const filePath = join(CACHE_DIR, `players-${sport}.json`);
    const cacheData = {
      data,
      timestamp: Date.now(),
      sport,
      playerCount: Object.keys(data).length,
      fileSize: JSON.stringify(data).length
    };
    
    console.log('💾 Saving to persistent cache...');
    await writeFile(filePath, JSON.stringify(cacheData, null, 2));
    
    console.log(`✅ Players data saved to: ${filePath}`);
    console.log(`📊 Cache info:`);
    console.log(`   - Players: ${cacheData.playerCount}`);
    console.log(`   - File size: ${(cacheData.fileSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   - Timestamp: ${new Date(cacheData.timestamp).toISOString()}`);
    console.log(`   - TTL: 24 hours`);
    
    return cacheData;
    
  } catch (error) {
    console.error('❌ Error fetching players data:', error.message);
    process.exit(1);
  }
}

// Main execution
async function main() {
  const sport = process.argv[2] || 'nfl';
  
  console.log('🚀 Sleeper Players Data Fetcher');
  console.log('================================\n');
  
  if (sport !== 'nfl') {
    console.log(`⚠️  Note: Only 'nfl' is currently supported by Sleeper API`);
    console.log(`   Proceeding with sport: ${sport}\n`);
  }
  
  await fetchPlayers(sport);
  
  console.log('\n🎉 Done! The MCP server will now use the cached data.');
  console.log('💡 Run this script periodically to keep the data fresh.');
}

main().catch(console.error);
