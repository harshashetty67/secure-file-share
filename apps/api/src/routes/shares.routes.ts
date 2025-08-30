import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { CreateShareSchema } from '../validators/shares.schema';
import { createShareController, listMySharesController, revokeShareController } from '../controllers/shares.controller';

const sharesRouter = Router();

// auth → validate → controller
sharesRouter.post('/', authMiddleware, validate(CreateShareSchema), createShareController);
sharesRouter.get('/', authMiddleware, listMySharesController);  
sharesRouter.post('/:shareId/revoke', authMiddleware, revokeShareController);

export default sharesRouter;
