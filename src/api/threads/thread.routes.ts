import { Router } from 'express';
import * as threadController from './thread.controller';
import { validate } from '../../core/middleware/validateRequest';
import { createThreadSchema, deleteThreadSchema, getThreadSchema, listThreadsSchema, DeleteThreadInput } from './thread.validators';
import { uploadImage } from '../../core/middleware/imageUpload';
import { Request, Response, NextFunction } from 'express';

const router = Router({ mergeParams: true }); // mergeParams allows access to parent router params

// GET /api/v1/boards/:board_short_name/threads - List threads for a board
router.get(
  '/',
  validate(listThreadsSchema),
  threadController.listThreadsHandler
);

// GET /api/v1/boards/:board_short_name/threads/:thread_id - Get a specific thread
router.get(
  '/:thread_id',
  validate(getThreadSchema),
  threadController.getThreadHandler
);

// POST /api/v1/boards/:board_short_name/threads - Create a new thread
router.post(
  '/',
  uploadImage.single('image'), // 'image' is the field name in the form data
  validate(createThreadSchema),
  threadController.createThreadHandler
);

// DELETE /api/v1/boards/:board_short_name/threads/:thread_id - Delete a thread
router.delete(
  '/:thread_id',
  validate(deleteThreadSchema),
  threadController.deleteThreadHandler
);

export default router;
