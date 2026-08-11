import { z } from 'zod';

export function isValidEmail(email: string) {
    const emailSchema = z.string().email();
    return emailSchema.safeParse(email).success;
}