import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { CreateShareSchema } from '../validators/shares.schema';
import { createShareController } from '../controllers/shares.controller';

const sharesRouter = Router();

// auth → validate → controller
sharesRouter.post('/', authMiddleware, validate(CreateShareSchema), createShareController);

export default sharesRouter;
