import { Router } from "express";  
import { config } from "../config";
import { authMiddleware } from "../middlewares/auth";
import { listFilesController } from "../controllers/files.controller";

const listFilesRouter = Router();

listFilesRouter.get("/", authMiddleware, listFilesController);

export default listFilesRouter;