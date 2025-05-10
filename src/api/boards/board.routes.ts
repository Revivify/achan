import { Router } from 'express';
import * as boardController from './board.controller';
import { validate } from '../../core/middleware/validateRequest';
import { createBoardSchema, updateBoardSchema } from './board.validators';

const router = Router();

// GET /api/v1/boards - Get all boards
router.get('/', boardController.listBoardsHandler);

// GET /api/v1/boards/:shortName - Get a specific board
router.get('/:shortName', boardController.getBoardHandler);

// POST /api/v1/boards - Create a new board
router.post(
  '/',
  validate(createBoardSchema),
  boardController.createBoardHandler
);

// PUT /api/v1/boards/:shortName - Update a board
router.put(
  '/:shortName',
  validate(updateBoardSchema),
  boardController.updateBoardHandler
);

// DELETE /api/v1/boards/:shortName - Delete a board
router.delete('/:shortName', boardController.deleteBoardHandler);

export default router;