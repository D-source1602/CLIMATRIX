import express, { type Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env';
import { requestLogger } from './middleware/requestLogger';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';
import { apiRouter } from './routes';
import anomalyRoute from './routes/anomaly';

export function createApp(): Express {
  const app = express();

  // Security & infra
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(helmet());

  const corsOrigins =
    env.CORS_ORIGIN === '*'
      ? true
      : env.CORS_ORIGIN.split(',').map((s) => s.trim());

  app.use(cors({ origin: corsOrigins, credentials: true }));

  // Body parsing — 1 MB cap on JSON. Large CSV uploads will be handled by
  // streamed multipart endpoints in a later phase, NOT through this parser.
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Observability
  app.use(requestLogger);

  // Routes
  app.use('/api/v1', apiRouter);

  app.use('/api/v1/anomaly', anomalyRoute);

  // 404 + global error handler MUST be last
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
