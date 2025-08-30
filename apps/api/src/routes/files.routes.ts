import { Router } from "express";  
import { validate } from '../middlewares/validate';
import { authMiddleware } from "../middlewares/auth";
import { deleteFileController, listFilesController } from "../controllers/files.controller";
import { DeleteFileSchema } from "../validators/files.schema";

const filesRouter = Router();

filesRouter.get("/", authMiddleware, listFilesController);
filesRouter.delete('/', authMiddleware, validate(DeleteFileSchema), deleteFileController);

export default filesRouter;