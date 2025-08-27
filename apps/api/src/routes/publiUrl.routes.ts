import { Router } from 'express';
import { publicUrlRateLimit } from '../middlewares/shortUrlRequestLimit';
import { getPublicShareUrlController } from '../controllers/publicLink.controller';

const router = Router();

// GET /public/shares/:shareId  (rate-limited, no auth)
router.get('/shares/:shareId', publicUrlRateLimit, getPublicShareUrlController);

export default router;