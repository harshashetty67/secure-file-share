import type { Request, Response, NextFunction } from 'express';
import { config } from '../config';

/**
 * Simple in-memory sliding window rate limiter:
 * - Keyed by req.ip
 * - Allows at most PUBLIC_RATE_LIMIT_MAX hits within PUBLIC_RATE_LIMIT_WINDOW_MS
 */
const ipRecords = new Map<string, number[]>();

export function publicUrlRateLimit(req: Request, res: Response, next: NextFunction) {
  const ip = (req.headers['cf-connecting-ip'] as string) || req.ip || 'unknown';
  const now = Date.now();
  
  // For logging
  const rid = (req as any).rid;
  const shareId = req.params.shareId;

  const windowMs = config.PUBLIC_RATE_LIMIT_WINDOW_MS;
  const allowedRequestLimit = config.PUBLIC_RATE_LIMIT_MAX;

  const recentRequestTimeRecords = (ipRecords.get(ip) || []).filter(ts => now - ts < windowMs);
  recentRequestTimeRecords.push(now);
  ipRecords.set(ip, recentRequestTimeRecords);

  if (recentRequestTimeRecords.length > allowedRequestLimit) {
    console.log('[public-share]', { rid, shareId, event: 'rate_limited' });
    return res.status(429).json({ error: { message: 'Too many requests, try again later.' } });
  }

  next();
}
