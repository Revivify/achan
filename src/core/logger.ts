import pino from 'pino';
import config from './config';

const logger = pino({
  transport: config.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined,
  level: process.env.LOG_LEVEL || 'info',
});

export default logger;