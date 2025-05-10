import { Router } from 'express';
import boardRoutes from './boards/board.routes';

const router = Router();

// Mount board routes
router.use('/boards', boardRoutes);

// Future routes will be mounted here
// router.use('/boards/:board_short_name/threads', threadRoutes);
// router.use('/boards/:board_short_name/threads/:thread_id/replies', replyRoutes);

export default router;