import rateLimit from "express-rate-limit";
import config from "../config";

export const limiter = rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
        const retryAfterSecs = Math.ceil(config.rateLimitWindowMs / 1000);
        res.setHeader('Retry-After', String(retryAfterSecs));
        return res.status(429).json( {
            success: false,
            error: {
                type: 'RATE_LIMIT_EXCEEDED',
                message: 'Too many requests - please try again later.',
                retryAfter: retryAfterSecs + ' Seconds',
                limit: config.rateLimitMax,
                windowMs: config.rateLimitWindowMs
            }
        });
    }
})