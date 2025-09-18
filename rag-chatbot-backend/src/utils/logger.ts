import winston from 'winston';
import path from 'path';

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let log = `${timestamp} [${level}]: ${message}`;

        // Add metadata if present
        if (Object.keys(meta).length > 0) {
            log += ` ${JSON.stringify(meta)}`;
        }

        return log;
    })
);

// Create logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    transports: [
        // Console transport for development
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),

        // File transport for production
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/error.log'),
            level: 'error',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            )
        }),

        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/combined.log'),
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            )
        })
    ],

    // Handle exceptions and rejections
    exceptionHandlers: [
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/exceptions.log')
        })
    ],

    rejectionHandlers: [
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/rejections.log')
        })
    ]
});

// Create logs directory if it doesn't exist
import fs from 'fs';
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Create specialized logging functions for different contexts
export const chatLogger = {
    info: (message: string, meta?: any) => logger.info(`💬 ${message}`, meta),
    error: (message: string, meta?: any) => logger.error(`💬 ${message}`, meta),
    warn: (message: string, meta?: any) => logger.warn(`💬 ${message}`, meta),
    debug: (message: string, meta?: any) => logger.debug(`💬 ${message}`, meta)
};

export const sessionLogger = {
    info: (message: string, meta?: any) => logger.info(`🔗 ${message}`, meta),
    error: (message: string, meta?: any) => logger.error(`🔗 ${message}`, meta),
    warn: (message: string, meta?: any) => logger.warn(`🔗 ${message}`, meta),
    debug: (message: string, meta?: any) => logger.debug(`🔗 ${message}`, meta)
};

export const redisLogger = {
    info: (message: string, meta?: any) => logger.info(`🔌 ${message}`, meta),
    error: (message: string, meta?: any) => logger.error(`🔌 ${message}`, meta),
    warn: (message: string, meta?: any) => logger.warn(`🔌 ${message}`, meta),
    debug: (message: string, meta?: any) => logger.debug(`🔌 ${message}`, meta)
};

export const serverLogger = {
    info: (message: string, meta?: any) => logger.info(`🚀 ${message}`, meta),
    error: (message: string, meta?: any) => logger.error(`🚀 ${message}`, meta),
    warn: (message: string, meta?: any) => logger.warn(`🚀 ${message}`, meta),
    debug: (message: string, meta?: any) => logger.debug(`🚀 ${message}`, meta)
};

export const ragLogger = {
    info: (message: string, meta?: any) => logger.info(`🤖 ${message}`, meta),
    error: (message: string, meta?: any) => logger.error(`🤖 ${message}`, meta),
    warn: (message: string, meta?: any) => logger.warn(`🤖 ${message}`, meta),
    debug: (message: string, meta?: any) => logger.debug(`🤖 ${message}`, meta)
};

export default logger;