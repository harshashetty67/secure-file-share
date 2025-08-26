import type { Request, Response } from 'express';
import { z } from 'zod';
import { CreateShareSchema } from '../validators/shares.schema';
import { insertShare } from '../services/shares.service';
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
        mime: null,        // v1: skip; you can store from upload later
        size: null,        // v1: skip
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
