import { Router } from 'express';
import { getMeController } from '../controllers/me.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
router.get('/', authMiddleware , getMeController);

export default router;