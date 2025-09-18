import { Request, Response, NextFunction } from 'express';
import { serverLogger } from '../utils/logger';

/**
 * Error handling middleware
 */
export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    serverLogger.error('Unhandled error:', err);

    // Don't leak error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';

    res.status(500).json({
        error: 'Internal server error',
        ...(isDevelopment && { details: err.message, stack: err.stack })
    });
};

/**
 * Request logging middleware
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        serverLogger.info(`${req.method} ${req.path}`, {
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
    });

    next();
};

/**
 * Request validation middleware
 */
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
    // Basic request validation
    if (req.method === 'POST' && !req.body) {
        return res.status(400).json({ error: 'Request body is required' });
    }

    next();
};

/**
 * CORS middleware with logging
 */
export const corsHandler = (req: Request, res: Response, next: NextFunction) => {
    const origin = req.get('Origin');
    const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];

    if (!origin || allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin || '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
            return res.sendStatus(200);
        }
    } else {
        serverLogger.warn(`CORS: Blocked request from unauthorized origin: ${origin}`);
        return res.status(403).json({ error: 'CORS: Origin not allowed' });
    }

    next();
};