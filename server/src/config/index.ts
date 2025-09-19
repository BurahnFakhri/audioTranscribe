import dotenv from 'dotenv';
dotenv.config();

const env = process.env;

export default { 
    PORT: env.PORT || 4000,
    nodeEnv: env.NODE_ENV || 'development',
    allowedOrigins: env.ALLOWED_ORIGINS ? env.ALLOWED_ORIGINS.split(',').map(s => s.trim()) : '*',
    rateLimitWindowMs: Number(env.RATE_LIMIT_WINDOW_MS || 60000),
    rateLimitMax: Number(env.RATE_LIMIT_MAX || 30),
    mongoUri: env.MONGO_URI || 'mongodb://localhost:27017/transcribe_dev',
    storageDir: env.STORAGE_DIR || 'uploads'  
}