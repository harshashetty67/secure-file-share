import type { Request, Response } from 'express';
import { getShare, incrementDownloadCount } from '../services/shares.service';
import { getSignedGetUrl } from '../services/storage.service';
import { config } from '../config';

/**
 * GET /public/shares/:shareId
 * - Validates the share (not revoked/expired/maxed)
 * - Mints a short-lived signed GET URL (3 min by default)
 * - Best-effort increments download_count
 */
export async function getPublicShareUrlController(req: Request, res: Response) {
  const shareId = req.params.shareId;
  let share;
  const userIp = (req.headers['cf-connecting-ip'] as string) || req.ip;

  const rid = (req as any).rid;
  console.log('[public-share]', { rid, shareId, ip: userIp, event: 'request' });

  try {
    share = await getShare(shareId);
  } 
  catch {
    return res.status(404).json({ error: { message: ' Share Not found' } });
  }

  if (share.revoked) {
    console.log('[public-share]', { rid, shareId, event: 'revoked' });
    return res.status(410).json({ error: { message: 'Link revoked' } });
  }

  const now = Date.now();

  if (share.expires_at && now >= new Date(share.expires_at).getTime()) {
    console.log('[public-share]', { rid, shareId, event: 'expired' });
    return res.status(410).json({ error: { message: 'Link expired' } });
  }

  if (share.max_downloads && share.download_count >= share.max_downloads) {
    console.log('[public-share]', { rid, shareId, event: 'maxed download limit' });
    return res.status(410).json({ error: { message: 'Download limit reached' } });
  }

  // 3) Get a short-lived URL from Storage
  try {
    const downloadUrl = await getSignedGetUrl(share.object_key, config.SIGNED_DOWNLOAD_TTL_SECONDS);

    // 4) Increment counter (non-blocking)
    incrementDownloadCount(shareId).catch(() => {});

    console.log('[public-share]', { rid, shareId, event: 'issued', ttl: config.SIGNED_DOWNLOAD_TTL_SECONDS });

    // 5) Return minimal info to the client
    return res.json({
      fileName: share.file_name,
      mime: share.mime ?? null,
      size: share.size ?? null,
      downloadUrl,
      expiresInSeconds: config.SIGNED_DOWNLOAD_TTL_SECONDS,
    });
  } 
  catch {
    console.error('[public-share]', { rid, shareId, event: 'sign_url_failed' });
    return res.status(500).json({ error: { message: 'Unable to generate download link' } });
  }
}
