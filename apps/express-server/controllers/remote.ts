import type { Request, Response } from 'express';
import { timingSafeEqual } from 'crypto';


export function validateToken(provided: string | undefined, expected: string): boolean {
  if (!provided) return false;
  const bufA = Buffer.from(provided);
  const bufB = Buffer.from(expected);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function createRegisterHandler(opts: {
  getBaseUrl: (req: Request) => string;
  registrationSecret: string;
}) {
  return function register(req: Request, res: Response) {
    // Debug logging
    console.error('[/register] Query params:', req.query);
    console.error('[/register] Headers:', req.headers);
    console.error('[/register] Body:', req.body);

    // Require ?reg=SECRET to mint a usable transport URL
    const provided = typeof req.query.reg === 'string' ? req.query.reg : undefined;
    if (!validateToken(provided, opts.registrationSecret)) {
      console.error('[/register] Auth failed - no valid ?reg= param');
      return res.status(401).json({
        error: 'Unauthorized',
        debug: { hasRegParam: !!provided, queryKeys: Object.keys(req.query) }
      });
    }

    const base = opts.getBaseUrl(req);
    // Return HTTP transport URL with the same secret in query
    res.json({
      serverInfo: { name: 'sleeper-fantasy-football-mcp', version: '1.0.0' },
      capabilities: { tools: {} },
      transports: [
        { type: 'http', url: `${base}/mcp?token=${encodeURIComponent(opts.registrationSecret)}` }
      ]
    });
  };
}
