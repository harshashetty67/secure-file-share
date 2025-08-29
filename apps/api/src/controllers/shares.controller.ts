import type { Request, Response } from 'express';
import { z } from 'zod';
import { CreateShareSchema, ShareId } from '../validators/shares.schema';
import { insertShare, revokeShareOwned } from '../services/shares.service';
import { listShares } from '../services/shares.service';
import { config } from '../config';

export async function createShareController(req: Request, res: Response) {
    const body = (req as any).validated as z.infer<typeof CreateShareSchema>;
    const userId = (req as any).user.id as string;

    // Ownership check: prevents sharing someone else's file
    if (!body.objectKey.startsWith(`u/${userId}/`)) {
        return res.status(403).json({ error: { message: 'Not owner of file' } });
    }

    // TTL: use request value or default (env)
    const ttlMin = body.ttlMinutes ?? config.SHARE_DEFAULT_TTL_MIN;
    const expiresAt = new Date(Date.now() + ttlMin * 60_000).toISOString();

    // Derive filename from key for UI
    const fileName = body.objectKey.split('/').pop() || 'file';

    // Insert durable share record
    const row = await insertShare({
        owner_id: userId,
        object_key: body.objectKey,
        file_name: fileName,
        mime: null,        
        size: null,        
        expires_at: expiresAt,
        max_downloads: body.maxDownloads ?? null,
    });

    // Return stable shareId + a public URL your frontend will use
    return res.status(201).json({
        shareId: row.id,
        publicUrl: `${config.SITE_URL}/d/${row.id}`,
        expiresAt: row.expires_at,
        maxDownloads: row.max_downloads ?? null,
    });
}

export async function revokeShareController(req: Request, res: Response) {
  // 1) Validate route param simply (no extra middleware needed)
  const shareIdRaw = req.params.shareId;
  const parsedShareId = ShareId.safeParse(shareIdRaw);

  if (!parsedShareId.success) {
    return res.status(400).json({ error: { message: 'Invalid shareId (must be UUID)' } });
  }

  const shareId = parsedShareId.data;
  const ownerId = (req as any).user.id as string;

  try {
    const row = await revokeShareOwned(shareId, ownerId);

    if (!row) {
      return res.status(404).json({ error: { message: 'Share not found' } });
    }

    return res.json({ id: row.id, revoked: true });
  } 
  
  catch {
    return res.status(500).json({ error: { message: 'Failed to revoke share' } });
  }
}

export async function listMySharesController(req: Request, res: Response) {
  const ownerId = (req as any).user.id as string;
  const limit  = Math.min(Number(req.query.limit ?? 5), 20);
  const offset = Math.max(Number(req.query.offset ?? 0), 0);

  const rows = await listShares(ownerId, limit, offset);
  const now = Date.now();

  const items = rows.map(r => {
    const expired = r.expires_at ? now >= new Date(r.expires_at).getTime() : false;
    const maxed = r.max_downloads ? r.download_count >= r.max_downloads : false;
    const status = r.revoked ? 'revoked' : expired ? 'expired' : maxed ? 'maxed' : 'active';

    return {
      id: r.id,
      objectKey: r.object_key,
      fileName: r.file_name,
      mime: r.mime ?? null,
      size: r.size ?? null,
      createdAt: r.created_at,
      expiresAt: r.expires_at ?? null,
      maxDownloads: r.max_downloads ?? null,
      downloadCount: r.download_count,
      status,
      publicUrl: `${process.env.SITE_URL}/d/${r.id}`,
    };
  });

  const nextOffset = rows.length === limit ? offset + limit : null;
  return res.json({ items, nextOffset });
}
