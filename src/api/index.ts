import { Router } from 'express';
import boardRoutes from './boards/board.routes';
import threadRoutes from './threads/thread.routes';

const router = Router();

// Mount board routes
router.use('/boards', boardRoutes);

// Mount thread routes
router.use('/boards/:board_short_name/threads', threadRoutes);

// Future routes will be mounted here
// router.use('/boards/:board_short_name/threads/:thread_id/replies', replyRoutes);

export default router;
