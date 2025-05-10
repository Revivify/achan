import { Request, Response, NextFunction } from 'express';
import * as boardService from './board.service';
import { StatusCodes } from 'http-status-codes';
import { CreateBoardInput, UpdateBoardInput } from './board.validators';
import logger from '../../core/logger';

export const listBoardsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const boards = await boardService.getAllBoards();
    res.status(StatusCodes.OK).json(boards);
  } catch (error: any) {
    next(error);
  }
};

export const getBoardHandler = async (
  req: Request<{ shortName: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { shortName } = req.params;
    const board = await boardService.getBoardByShortName(shortName);

    if (!board) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Board not found' });
    }

    res.status(StatusCodes.OK).json(board);
  } catch (error: any) {
    next(error);
  }
};

export const createBoardHandler = async (
  req: Request<{}, {}, CreateBoardInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const board = await boardService.createBoard(req.body);
    logger.info(`Board created: ${board.shortName}`);
    res.status(StatusCodes.CREATED).json(board);
  } catch (error: any) {
    // Handle potential unique constraint violation for shortName
    if (error.code === 'P2002' && error.meta?.target?.includes('shortName')) {
      return res.status(StatusCodes.CONFLICT).json({ message: 'Board short name already exists.' });
    }
    next(error);
  }
};

export const updateBoardHandler = async (
  req: Request<{ shortName: string }, {}, UpdateBoardInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { shortName } = req.params;

    // Check if board exists
    const existingBoard = await boardService.getBoardByShortName(shortName);
    if (!existingBoard) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Board not found' });
    }

    const updatedBoard = await boardService.updateBoard(shortName, req.body);
    logger.info(`Board updated: ${shortName}`);
    res.status(StatusCodes.OK).json(updatedBoard);
  } catch (error: any) {
    next(error);
  }
};

export const deleteBoardHandler = async (
  req: Request<{ shortName: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { shortName } = req.params;

    // Check if board exists
    const existingBoard = await boardService.getBoardByShortName(shortName);
    if (!existingBoard) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Board not found' });
    }

    await boardService.deleteBoard(shortName);
    logger.info(`Board deleted: ${shortName}`);
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (error: any) {
    next(error);
  }
};
