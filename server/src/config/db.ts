import mongoose from "mongoose";
import config from "./index";

const MONGO_URI = config.mongoUri;

export async function connectDB(): Promise<void> {
    if(!MONGO_URI) {
        throw new Error('MONGO_URI not set');
    }

    try {
        await mongoose.connect(MONGO_URI, {});
        console.log('Mongo DB Connected');
    } catch (err) {
        console.log(err);
        throw err;
    }

    mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB disconnected')
    })

    mongoose.connection.on('reconnected', () => {
        console.info('MongoDB Reconnected');
    })

    mongoose.connection.on('error', (err)=> {
        console.error({ err }, 'MongoDB Error');
    })
}

