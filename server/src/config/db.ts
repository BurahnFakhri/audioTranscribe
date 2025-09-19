import mongoose from "mongoose";
import config from "./index";
import logger from "../utils/logger";

const MONGO_URI = config.mongoUri;

export async function connectDB(): Promise<void> {
    if(!MONGO_URI) {
        throw new Error('MONGO_URI not set');
    }

    try {
        await mongoose.connect(MONGO_URI, {});
        logger.info('MongoDB connected');
    } catch (err) {
        logger.fatal({ err }, 'mongo connect error');
        throw err;
    }

    mongoose.connection.on('disconnected', () => {
        logger.fatal('mongo connect error');
    })

    mongoose.connection.on('reconnected', () => {
        console.info('MongoDB Reconnected');
    })

    mongoose.connection.on('error', (err)=> {
        logger.error({ err }, 'mongo connect error');
    })
}

export async function disconnectDB(): Promise<void> {
    await mongoose.disconnect();
    logger.info('mongodb is disconnected');
} 

