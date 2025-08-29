import { z } from 'zod';

export const DeleteFileSchema = z.object({
  objectKey: z.string().min(8).max(512),
});

export type DeleteFileInput = z.infer<typeof DeleteFileSchema>;
