import { Router } from 'express';
import { validate } from '../middlewares/validate';
import { rateLimitByIp } from '../middlewares/rateLimit';
import { MagicLinkInput, magicLinkSchema } from '../validators/auth.schema';
import { sendMagicLinkController } from '../controllers/auth.controller';

const router = Router();

// POST /auth/magic-link
// order matters: validate → rate-limit → controller
router.post('/magic-link', validate(magicLinkSchema), rateLimitByIp, sendMagicLinkController);

export default router;
