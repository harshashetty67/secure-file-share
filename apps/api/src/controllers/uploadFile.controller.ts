// src/controllers/files.controller.ts
import type { Request, Response } from 'express';
import { buildObjectKey, uploadToStorage } from '../services/storage.service';

export async function uploadFileController(req: Request, res: Response) {
  const f = (req as any).file as Express.Multer.File | undefined;
  if (!f) {
    return res.status(400).json({ error: { message: 'No file uploaded (use form-data key "file")' } });
  }

  try {
    const userId = (req as any).user.id as string;
    const { fileId, key } = buildObjectKey(userId, f.originalname);

    await uploadToStorage(f.buffer, key, f.mimetype);

    return res.status(201).json({
      id: fileId,
      objectKey: key,
      size: f.size,
      mime: f.mimetype,
      originalName: f.originalname,
      createdAt: new Date().toISOString(),
    });
  } 
  catch (err: any) {
    return res.status(500).json({ error: { message: 'Upload failed' } });
  }
}
