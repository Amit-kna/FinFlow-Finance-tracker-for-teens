import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const rateLimitMap = new Map<string, { count: number; startTime: number }>();

export function rateLimit(
  requests: number = 10,
  windowMs: number = 60 * 1000 // 1 minute
) {
  return async (req: NextRequest) => {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const key = `ratelimit:${ip}`;
    const now = Date.now();

    const record = rateLimitMap.get(key);

    if (!record || now - record.startTime > windowMs) {
      rateLimitMap.set(key, { count: 1, startTime: now });
      return null;
    }

    if (record.count >= requests) {
      return NextResponse.json(
        { error: 'Too Many Requests', message: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    record.count++;
    return null;
  };
}