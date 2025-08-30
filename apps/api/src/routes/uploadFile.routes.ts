import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { uploadFileController } from '../controllers/uploadFile.controller';
import { uploadSingle } from '../middlewares/upload';

const router = Router();

router.post('/', authMiddleware,  uploadSingle, uploadFileController);

export default router;