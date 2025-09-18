#!/usr/bin/env node

const { spawn } = require('child_process');

// Example usage of all Sleeper MCP tools
async function runExamples() {
  console.log('Sleeper Fantasy Football MCP Server - Complete Examples\n');
  
  const server = spawn('npm', ['run', 'dev'], { stdio: ['pipe', 'pipe', 'pipe'] });
  
  let requestId = 1;
  
  server.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      try {
        const response = JSON.parse(line);
        if (response.result) {
          console.log(`✓ ${response.id}: ${response.result.content?.[0]?.text?.split('\n')[0] || 'Success'}`);
        } else if (response.error) {
          console.log(`✗ ${response.id}: ${response.error.message}`);
        }
      } catch (e) {
        // Ignore non-JSON lines
      }
    }
  });
  
  server.stderr.on('data', (data) => {
    if (data.toString().includes('Sleeper Fantasy Football MCP server running')) {
      console.log('Server started, running examples...\n');
    }
  });
  
  // Wait for server to start
  setTimeout(() => {
    const examples = [
      {
        name: 'get_user',
        description: 'Get user by username',
        args: { identifier: 'sleeper' }
      },
      {
        name: 'get_nfl_state',
        description: 'Get current NFL state',
        args: {}
      },
      {
        name: 'get_trending_players',
        description: 'Get trending players (adds)',
        args: { type: 'add', limit: '5' }
      },
      {
        name: 'get_trending_players',
        description: 'Get trending players (drops)',
        args: { type: 'drop', limit: '5' }
      }
    ];
    
    examples.forEach((example, index) => {
      setTimeout(() => {
        console.log(`${index + 1}. ${example.description}...`);
        const request = {
          jsonrpc: '2.0',
          id: requestId++,
          method: 'tools/call',
          params: {
            name: example.name,
            arguments: example.args
          }
        };
        server.stdin.write(JSON.stringify(request) + '\n');
      }, index * 2000);
    });
    
    // Clean up
    setTimeout(() => {
      server.kill();
      console.log('\n✓ Examples completed!');
      console.log('\nTo use specific tools with your data:');
      console.log('1. Get your user ID: get_user with your username');
      console.log('2. Get your leagues: get_user_leagues with your user ID and season');
      console.log('3. Get league details: get_league with a league ID');
      console.log('4. Get matchups: get_league_matchups with league ID and week');
      console.log('5. Get rosters: get_league_rosters with league ID');
      console.log('\nAll 17 tools are available for comprehensive fantasy football data access!');
    }, examples.length * 2000 + 1000);
    
  }, 1000);
}

runExamples().catch(console.error);
