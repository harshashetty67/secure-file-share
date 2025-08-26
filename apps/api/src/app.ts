import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './config';
import authRouter from './routes/auth.routes';
import getMeRouter from './routes/me.routes';
import uploadFileRouter from './routes/uploadFile.routes';
import listFilesRouter from './routes/files.routes';
import sharesRouter from './routes/shares.routes';

export const app = express();

app.use(helmet());
app.use(express.json());
app.use(cors({ origin: config.WEB_APP_ORIGIN }));

// Check server health status
app.get('/health', (_, res) => res.json({ ok: true }));

app.use('/auth', authRouter);
app.use('/me', getMeRouter);

app.use('/uploadFiles', uploadFileRouter);
app.use('/files', listFilesRouter);

app.use('/shares', sharesRouter);
