import { z } from 'zod';

export const magicLinkSchema = z.object({
    email: z.string().email().max(255).trim(),
    redirectUrl: z.string().url().optional()
});

export type MagicLinkInput = z.infer<typeof magicLinkSchema>;