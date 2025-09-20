import app from './app';
import config from './config';
import { connectDB, disconnectDB } from './config/db';
import logger from './utils/logger';

const PORT = Number(config.PORT || 4000);

const start = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      logger.info(`Transcribe express server running. Port: ${PORT}`);
    });

    const shutdown = async (signal?: string) => {
      logger.info({ signal }, 'Shutting down...');
      await disconnectDB();
      server.close(() => {
        logger.info('HTTP server closed');
        setTimeout(() => process.exit(0), 100);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    logger.fatal({ error }, 'Startup error');
    setTimeout(() => process.exit(1), 100);
  }
};

start();