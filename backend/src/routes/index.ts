import { Router } from 'express';
import { healthRouter } from './health.routes';
import { authRouter } from './auth.routes';
import { reportRouter } from './report.routes';
import publicHeatmapRouter from './publicHeatmap';

/**
 * Root API router — mounted by the app at `/api/v1`.
 * Future routers (industries, emissions, notices, compliance) plug in here.
 */
export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/reports', reportRouter);
apiRouter.use('/public', publicHeatmapRouter);
