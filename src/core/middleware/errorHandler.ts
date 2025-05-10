import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import logger from '../logger';
import config from '../config';

interface CustomError extends Error {
    statusCode?: number;
    isOperational?: boolean; // Differentiate between operational and programmer errors
}

export const routeNotFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    const error: CustomError = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
    error.statusCode = StatusCodes.NOT_FOUND;
    next(error);
};

export const generalErrorHandler = (
    err: CustomError,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction // Must have 4 arguments for Express to recognize it as an error handler
) => {
    logger.error(err);

    const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    const message = err.isOperational || statusCode < 500 ? err.message : 'An unexpected error occurred.';

    res.status(statusCode).json({
        message,
        ...(config.NODE_ENV === 'development' && { stack: err.stack, details: err }),
    });
};