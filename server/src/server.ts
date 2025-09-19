
import express from "express";
import cors from 'cors';
import helmet from "helmet";
import config from "./config";
import { limiter } from "./middleware/rateLimiter";
import { connectDB, disconnectDB } from "./config/db";
import pinoHttp from 'pino-http';
import logger from "./utils/logger";
import transcriptionRouter from './routes/transcription.routes';


const app = express();
const PORT = Number(config.PORT || 4000);

app.use(helmet());

app.use(cors({
    origin: config.allowedOrigins
}));

app.use(limiter);

app.use(express.json());

app.use(pinoHttp({ logger }))

app.get('/health', (_req, res) => {
    res.json({ status: 'Running'})
});

app.use('/api/transcription', transcriptionRouter);

const start = async () => {
    try {
        await connectDB();
        const server = app.listen(PORT, () => {
            logger.info(`Transcribe express server running. Port: ${PORT}`);
        });
        const shutdown = async (signal?: string) => {
            logger.info({ signal }, 'Shutting down...');
            await disconnectDB();
            server.close(async () => process.exit(0));
        }
        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);

    } catch (error) {
        logger.fatal({ error }, 'Startup error');
        process.exit(1);
    }    
}

start();


