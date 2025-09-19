
import express from "express";
import cors from 'cors';
import helmet from "helmet";
import config from "./config";
import { limiter } from "./middleware/rateLimiter";
import { connectDB, disconnectDB } from "./config/db";


const app = express();
const PORT = Number(config.PORT || 4000);

app.use(helmet());

app.use(cors({
    origin: config.allowedOrigins
}));

app.use(limiter);

app.get('/health', (_req, res) => {
    res.json({ status: 'Running'})
});

const start = async () => {
    try {
        await connectDB();
        const server = app.listen(PORT, () => {
            console.log(`transcribe server — express running. Port: ${PORT}`);
        });
        const shutdown = async () => {
            console.log('Shutting down..');
            await disconnectDB();
            server.close(async () => process.exit(0));
        }
        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);

    } catch (error) {
        console.error("Startup error", error);
        process.exit(1);
    }    
}

start();


