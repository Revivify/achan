import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { StatusCodes } from 'http-status-codes';
import helmet from 'helmet';
import morgan from 'morgan';
import { routeNotFoundHandler, generalErrorHandler } from './core/middleware/errorHandler';
import logger from './core/logger';
import config from './core/config';
import apiRouter from './api';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

const app: Express = express();

// Core Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Request Logging
const morganFormat = config.NODE_ENV === 'development' ? 'dev' : 'combined';
app.use(morgan(morganFormat, {
    stream: { write: (message) => logger.info(message.trim()) },
    skip: (req, res) => res.statusCode < 400 && config.NODE_ENV === 'production',
}));

// Static files
app.use('/uploads', express.static('public/uploads'));

// API Routes
app.get('/health', (req: Request, res: Response) => {
    res.status(StatusCodes.OK).json({ status: 'UP', uptime: process.uptime() });
});

// API Router
app.use('/api/v1', apiRouter);

// Swagger UI
try {
    const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    logger.info('Swagger UI available at /api-docs');
} catch (error) {
    logger.error('Failed to load Swagger document', error);
}

// Error Handling Middleware (must be last)
app.use(routeNotFoundHandler);
app.use(generalErrorHandler);

export default app;
