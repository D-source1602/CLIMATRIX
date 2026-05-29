import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import {
  generate,
  list,
  download,
  remove,
} from '../controllers/report.controller';

export const reportRouter = Router();

// All report endpoints require an authenticated user.
reportRouter.use(requireAuth);

reportRouter.post('/generate', generate);
reportRouter.get('/', list);
reportRouter.get('/:id/download', download);
reportRouter.delete('/:id', remove);
