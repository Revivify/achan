import { Request, Response, NextFunction } from 'express';
import * as threadService from './thread.service';
import * as imageService from '../../services/image.service';
import { StatusCodes } from 'http-status-codes';
import { CreateThreadInput, DeleteThreadInput, ListThreadsQuery } from './thread.validators';
import logger from '../../core/logger';
import config from '../../core/config';
import bcrypt from 'bcrypt';

// List threads for a board
export const listThreadsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { board_short_name } = req.params;
    // Convert query parameters to the expected types
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 15;
    const result = await threadService.getThreadsByBoard(board_short_name, { page, limit });

    if (!result) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Board not found' });
    }

    // Add URLs to the threads
    const threadsWithUrls = result.threads.map(thread => ({
      ...thread,
      imageUrl: `${config.BASE_URL}/uploads/images/${thread.imageFilenameStored}`,
      thumbnailUrl: `${config.BASE_URL}/uploads/thumbnails/${thread.thumbnailFilenameStored}`
    }));

    res.status(StatusCodes.OK).json({
      threads: threadsWithUrls,
      pagination: result.pagination
    });
  } catch (error: any) {
    next(error);
  }
};

// Get a single thread by ID
export const getThreadHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { board_short_name, thread_id } = req.params;
    // Convert thread_id to a number
    const threadIdNum = parseInt(thread_id as string, 10);
    const thread = await threadService.getThreadById(board_short_name, threadIdNum);

    if (!thread) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Thread not found' });
    }

    // Add URLs to the thread and its replies
    const threadWithUrls = {
      ...thread,
      imageUrl: `${config.BASE_URL}/uploads/images/${thread.imageFilenameStored}`,
      thumbnailUrl: `${config.BASE_URL}/uploads/thumbnails/${thread.thumbnailFilenameStored}`,
      replies: thread.replies.map(reply => ({
        ...reply,
        imageUrl: reply.imageFilenameStored 
          ? `${config.BASE_URL}/uploads/images/${reply.imageFilenameStored}`
          : null,
        thumbnailUrl: reply.thumbnailFilenameStored
          ? `${config.BASE_URL}/uploads/thumbnails/${reply.thumbnailFilenameStored}`
          : null
      }))
    };

    res.status(StatusCodes.OK).json(threadWithUrls);
  } catch (error: any) {
    next(error);
  }
};

// Create a new thread
export const createThreadHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { board_short_name } = req.params;

    // Check if the file was uploaded
    if (!req.file) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Image is required for a new thread' });
    }

    // Process the uploaded image
    const imageDetails = await imageService.processAndStoreImage(req.file);

    // Hash the deletion password if provided
    let deletionPasswordHash;
    if (req.body.deletion_password) {
      deletionPasswordHash = await bcrypt.hash(req.body.deletion_password, 10);
    }

    // Create the thread
    const thread = await threadService.createThread(board_short_name, {
      ...req.body,
      ...imageDetails,
      imageOriginalFilename: req.file.originalname, // Add the original filename
      ipAddress: req.ip,
      deletionPasswordHash
    });

    if (!thread) {
      // Clean up the uploaded files if thread creation failed
      await imageService.deleteImageFiles(imageDetails.imageFilenameStored, imageDetails.thumbnailFilenameStored);
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Board not found' });
    }

    // Add URLs to the response
    const threadWithUrls = {
      ...thread,
      imageUrl: `${config.BASE_URL}/uploads/images/${thread.imageFilenameStored}`,
      thumbnailUrl: `${config.BASE_URL}/uploads/thumbnails/${thread.thumbnailFilenameStored}`
    };

    logger.info(`Thread created: ${thread.id} on board ${board_short_name}`);
    res.status(StatusCodes.CREATED).json(threadWithUrls);
  } catch (error: any) {
    // Clean up the uploaded file if there was an error
    if (req.file) {
      await imageService.deleteImageFiles(req.file.filename);
    }
    next(error);
  }
};

// Delete a thread
export const deleteThreadHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { board_short_name, thread_id } = req.params;
    const { deletion_password } = req.body;

    // Convert thread_id to a number
    const threadIdNum = parseInt(thread_id as string, 10);
    const result = await threadService.deleteThread(board_short_name, threadIdNum, deletion_password);

    if (!result.success) {
      switch (result.reason) {
        case 'board_not_found':
          return res.status(StatusCodes.NOT_FOUND).json({ message: 'Board not found' });
        case 'thread_not_found':
          return res.status(StatusCodes.NOT_FOUND).json({ message: 'Thread not found' });
        case 'password_required':
          return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Deletion password is required' });
        case 'invalid_password':
          return res.status(StatusCodes.FORBIDDEN).json({ message: 'Invalid deletion password' });
        default:
          return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to delete thread' });
      }
    }

    // Delete the image files
    await imageService.deleteImageFiles(result.imageFilenameStored, result.thumbnailFilenameStored);

    logger.info(`Thread deleted: ${thread_id} from board ${board_short_name}`);
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (error: any) {
    next(error);
  }
};
