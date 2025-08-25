import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './config';
import authRouter from './routes/auth.routes';
import getMeRouter from './routes/me.routes';

export const app = express();

app.use(helmet());
app.use(express.json());
app.use(cors({ origin: config.WEB_APP_ORIGIN }));

app.get('/health', (_, res) => res.json({ ok: true }));
app.use('/auth', authRouter);
app.use('/me', getMeRouter);
