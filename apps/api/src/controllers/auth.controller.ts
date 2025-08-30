import type { Request, Response } from 'express';
import { DEFAULT_EMAIL_REDIRECT } from '../config';
import { sendMagicLink } from '../services/supabase.service';

export async function sendMagicLinkController(req: Request, res: Response) {
    const { email, redirectTo } = (req as any).validated as {
        email: string;
        redirectTo?: string;
    };

    const finalRedirect = redirectTo ?? DEFAULT_EMAIL_REDIRECT;

    try 
    {
        await sendMagicLink(email, finalRedirect);
    } 
    catch (err) 
    {
        res.send(500).json({
            error: { message: 'Internal server error' }
        });
    }

    return res.json({
        ok: true,
        message:
            'If that email is registered, a sign-in link has been sent. ' +
            'Please wait a few minutes before requesting another link.',
    });
}
