import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
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
app.use(cors({ origin: config.WEB_APP_ORIGIN }));
app.use(requestId);

// Check server health status
app.get('/health', (_, res) => res.json({ ok: true }));

app.use('/auth', authRouter);
app.use('/me', getMeRouter);

app.use('/uploadFiles', uploadFileRouter);
app.use('/files', filesRouter);

app.use('/shares', sharesRouter);
app.use('/publicUrl', publicUrlRouter);
