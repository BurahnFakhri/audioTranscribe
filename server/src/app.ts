// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import config from './config';
import { limiter } from './middleware/rateLimiter';
import pinoHttp from 'pino-http';
import logger from './utils/logger';
import transcriptionRouter from './routes/transcription.routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: config.allowedOrigins }));
app.use(limiter);
app.use(express.json());
app.use(pinoHttp({ logger }));

app.get('/health', (_req, res) => res.json({ status: 'Running' }));

app.use('/api/transcription', transcriptionRouter);

export default app;