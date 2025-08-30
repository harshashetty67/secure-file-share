import { revokeSharesByObjectKey } from "../services/shares.service";
import { listUserObjects, objectExists, removeObject } from "../services/storage.service";
import { DeleteFileInput } from "../validators/files.schema";
import { Request, Response } from 'express';

export async function listFilesController(req: Request, res: Response) {
  const userId = req.user!.id;
  const limit = Math.min(Number(req.query.limit ?? 5), 20);
  const offset = Math.max(Number(req.query.offset ?? 0), 0);

  const { items, hasMore } = await listUserObjects(userId, { limit, offset });
  const shaped = items.filter(i => i.name) // skip directories/placeholders
                .map(i => ({
                            objectKey: `u/${userId}/${i.name}`,
                            fileName: i.name.split('-').slice(1).join('-') || i.name,
                            size: i.metadata?.size ?? null,
                            lastModified: i.updated_at ?? null,
                }));

  res.json({ items: shaped, nextOffset: hasMore ? offset + limit : null });
}

export async function deleteFileController(req: Request, res: Response) {
  const body = (req as any).validated as DeleteFileInput
  const userId = (req as any).user.id as string;

  // Ownership check
  const prefix = `u/${userId}/`;
  if (!body.objectKey.startsWith(prefix)) {
    return res.status(403).json({ error: { message: 'Not allowed to delete this object' } });
  }

  // Check if file exists
  const exists = await objectExists(body.objectKey);
  if (!exists) {
    return res.status(404).json({ error: { message: 'File not found' } });
  }

  // Delete file from Storage bucket
  try {
    await removeObject(body.objectKey);
  } 
  catch {
    return res.status(500).json({ error: { message: 'Delete failed' } });
  }

  // Revoke any related shares
  let revoked = 0;
  try {
    revoked = await revokeSharesByObjectKey(userId, body.objectKey);
  } 
  catch {
    // swallow; deletion already succeeded
  }

  return res.json({ ok: true, revokedShares: revoked });
}