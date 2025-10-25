#!/usr/bin/env node

// Simple test script for the MCP HTTP endpoint
// Run with: node test-mcp.js

const MCP_AUTH_TOKEN = process.env.MCP_AUTH_TOKEN || 'test-token';
const BASE_URL = process.env.MCP_BASE_URL || 'http://localhost:3000';

async function testMCP() {
  console.log('🧪 Testing MCP HTTP Endpoint...\n');

  const headers = {
    'Authorization': `Bearer ${MCP_AUTH_TOKEN}`,
    'Content-Type': 'application/json'
  };

  try {
    // Test 1: List tools
    console.log('1. Testing tools/list...');
    const listResponse = await fetch(`${BASE_URL}/api/mcp`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list'
      })
    });

    if (!listResponse.ok) {
      throw new Error(`HTTP ${listResponse.status}: ${listResponse.statusText}`);
    }

    const listResult = await listResponse.json();
    console.log(`✅ Found ${listResult.result?.tools?.length || 0} tools`);

    if (listResult.result?.tools?.length > 0) {
      console.log('   Sample tools:');
      listResult.result.tools.slice(0, 3).forEach(tool => {
        console.log(`   - ${tool.name}: ${tool.description}`);
      });
    }

    // Test 2: Call a simple tool
    console.log('\n2. Testing tools/call (get_nfl_state)...');
    const callResponse = await fetch(`${BASE_URL}/api/mcp`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'get_nfl_state',
          arguments: {
            random_string: 'test'
          }
        }
      })
    });

    if (!callResponse.ok) {
      throw new Error(`HTTP ${callResponse.status}: ${callResponse.statusText}`);
    }

    const callResult = await callResponse.json();
    console.log('✅ Tool call successful');
    console.log('   Response type:', typeof callResult.result);
    console.log('   Has content:', !!callResult.result?.content);

    console.log('\n🎉 All tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run tests
testMCP();
