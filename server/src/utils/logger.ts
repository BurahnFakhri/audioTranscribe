import pino from "pino";
import config from "../config";

const isProd = config.nodeEnv === 'production';

const logger = pino({
    // level: config.logLevel || 'info',
    transport: isProd ? undefined : {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
        }
    }
});

export default logger;