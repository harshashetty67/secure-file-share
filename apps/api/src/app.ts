import express, { type NextFunction, type Request, type Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import multer from 'multer';
import { config } from './config';
import authRouter from './routes/auth.routes';
import getMeRouter from './routes/me.routes';
import uploadFileRouter from './routes/uploadFile.routes';
import filesRouter from './routes/files.routes';
import sharesRouter from './routes/shares.routes';
import publicUrlRouter from './routes/publiUrl.routes';
import { requestId } from './middlewares/requestId';

export const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(express.json());
const allowedOrigins = config.WEB_APP_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}));
app.use(requestId);

// Check server health status
app.get('/health', (_, res) => res.json({ ok: true }));

app.use('/auth', authRouter);
app.use('/me', getMeRouter);

app.use('/uploadFiles', uploadFileRouter);
app.use('/files', filesRouter);

app.use('/shares', sharesRouter);
app.use('/publicUrl', publicUrlRouter);

// JSON error handler — keeps multer/other errors from returning HTML stack traces
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? `File is too large. Max ${config.MAX_UPLOAD_MB} MB.`
      : err.message;
    return res.status(400).json({ error: { code: err.code, message } });
  }
  const message = err instanceof Error ? err.message : 'Internal server error';
  const status = /unsupported file type/i.test(message) ? 415 : 500;
  return res.status(status).json({ error: { message } });
});
