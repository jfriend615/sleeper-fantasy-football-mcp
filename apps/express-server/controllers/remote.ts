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
    // Require ?reg=SECRET to mint a usable transport URL
    const provided = typeof req.query.reg === 'string' ? req.query.reg : undefined;
    if (!validateToken(provided, opts.registrationSecret)) {
      return res.status(401).json({ error: 'Unauthorized' });
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
