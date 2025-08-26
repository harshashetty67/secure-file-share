import { z } from 'zod';

export const CreateShareSchema = z.object({
  objectKey: z.string().min(5).max(512),             // EX : u/<uid>/<fileId>-photo.jpg
  ttlMinutes: z.coerce.number().int().min(5).max(7200).optional(),
  maxDownloads: z.coerce.number().int().min(1).optional(),
});
export type CreateShareInput = z.infer<typeof CreateShareSchema>;
