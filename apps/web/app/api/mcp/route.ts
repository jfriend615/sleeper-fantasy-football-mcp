import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { getAllTools, callTool } from '@sleeper-fantasy-football/mcp-sleeper';

export const runtime = 'nodejs'; // Use 'edge' only if all deps are edge-safe

function unauthorized() {
  return new NextResponse('Unauthorized', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Bearer' },
  });
}

function compareTokens(token1: string, token2: string): boolean {
  if (token1.length !== token2.length) return false;
  const bufA = Buffer.from(token1);
  const bufB = Buffer.from(token2);
  return timingSafeEqual(bufA, bufB);
}

export async function POST(req: Request) {
  if (process.env.NODE_ENV === 'production' && !req.url.startsWith('https:')) {
    return new NextResponse('HTTPS Required', { status: 403 });
  }

  // Bearer token authentication
  const auth = req.headers.get('authorization') || '';
  const secret = process.env.MCP_AUTH_TOKEN || '';

  if (!secret || !compareTokens(auth, `Bearer ${secret}`)) {
    return unauthorized();
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { id, method, params } = body || {};

  try {
    if (method === 'tools/list') {
      const tools = getAllTools();
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: { tools }
      });
    }

    if (method === 'tools/call') {
      const { name, arguments: args } = params || {};
      if (!name) {
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          error: { code: -32602, message: 'Missing tool name' }
        }, { status: 400 });
      }

      const result = await callTool(name, args);
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result
      });
    }

    return NextResponse.json({
      jsonrpc: '2.0',
      id,
      error: { code: -32601, message: 'Method not found' }
    }, { status: 404 });

  } catch (e: any) {
    console.error('MCP Error:', e);
    return NextResponse.json({
      jsonrpc: '2.0',
      id,
      error: {
        code: -32000,
        message: process.env.NODE_ENV === 'development'
          ? e?.message || 'Internal error'
          : 'Internal error'
      }
    }, { status: 500 });
  }
}
