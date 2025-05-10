import prisma from '../../core/prisma';
import { CreateThreadInput, ListThreadsQuery } from './thread.validators';
import { ProcessedImageResult } from '../../services/image.service';
import bcrypt from 'bcrypt';

// Get all threads for a board with pagination
export const getThreadsByBoard = async (
  boardShortName: string,
  { page, limit }: ListThreadsQuery
) => {
  // Ensure page and limit are valid numbers
  const pageNum = page || 1;
  const limitNum = limit || 15;
  const skip = (pageNum - 1) * limitNum;

  // Get the board ID first
  const board = await prisma.board.findUnique({
    where: { shortName: boardShortName },
    select: { id: true }
  });

  if (!board) {
    return null;
  }

  // Get threads with pagination, ordered by last_bumped_at
  const [threads, totalThreads] = await Promise.all([
    prisma.thread.findMany({
      where: { boardId: board.id },
      orderBy: { lastBumpedAt: 'desc' },
      skip,
      take: limitNum,
      include: {
        _count: {
          select: { replies: true }
        },
        // Include a few recent replies
        replies: {
          orderBy: { createdAt: 'desc' },
          take: 3,
        }
      }
    }),
    prisma.thread.count({
      where: { boardId: board.id }
    })
  ]);

  // Calculate pagination info
  const totalPages = Math.ceil(totalThreads / limitNum);

  return {
    threads,
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalThreads
    }
  };
};

// Get a single thread by ID with all replies
export const getThreadById = async (boardShortName: string, threadId: number) => {
  // Get the board ID first
  const board = await prisma.board.findUnique({
    where: { shortName: boardShortName },
    select: { id: true }
  });

  if (!board) {
    return null;
  }

  // Get the thread with all its replies
  const thread = await prisma.thread.findFirst({
    where: {
      id: threadId,
      boardId: board.id
    },
    include: {
      replies: {
        orderBy: { createdAt: 'asc' },
        include: {
          childReplies: true
        }
      }
    }
  });

  return thread;
};

// Create a new thread
export const createThread = async (
  boardShortName: string,
  threadData: CreateThreadInput & ProcessedImageResult & {
    ipAddress?: string;
    deletionPasswordHash?: string;
    imageOriginalFilename: string;
  }
) => {
  // Get the board ID first
  const board = await prisma.board.findUnique({
    where: { shortName: boardShortName },
    select: { id: true }
  });

  if (!board) {
    return null;
  }

  // Create the thread
  const thread = await prisma.thread.create({
    data: {
      boardId: board.id,
      subject: threadData.subject,
      comment: threadData.comment,
      posterName: threadData.poster_name || 'Anonymous',
      imageOriginalFilename: threadData.imageOriginalFilename,
      imageFilenameStored: threadData.imageFilenameStored,
      imageMimetype: threadData.imageMimetype,
      imageFilesizeBytes: threadData.imageFilesizeBytes,
      imageWidth: threadData.imageWidth,
      imageHeight: threadData.imageHeight,
      thumbnailFilenameStored: threadData.thumbnailFilenameStored,
      ipAddress: threadData.ipAddress,
      deletionPasswordHash: threadData.deletionPasswordHash
    }
  });

  return thread;
};

// Delete a thread
export const deleteThread = async (
  boardShortName: string,
  threadId: number,
  deletionPassword?: string
) => {
  // Get the board ID first
  const board = await prisma.board.findUnique({
    where: { shortName: boardShortName },
    select: { id: true }
  });

  if (!board) {
    return { success: false, reason: 'board_not_found' };
  }

  // Get the thread
  const thread = await prisma.thread.findFirst({
    where: {
      id: threadId,
      boardId: board.id
    }
  });

  if (!thread) {
    return { success: false, reason: 'thread_not_found' };
  }

  // Check deletion password if provided and if thread has a password hash
  if (thread.deletionPasswordHash && deletionPassword) {
    const passwordMatch = await bcrypt.compare(deletionPassword, thread.deletionPasswordHash);
    if (!passwordMatch) {
      return { success: false, reason: 'invalid_password' };
    }
  } else if (thread.deletionPasswordHash && !deletionPassword) {
    return { success: false, reason: 'password_required' };
  }

  // Delete the thread
  await prisma.thread.delete({
    where: { id: threadId }
  });

  return { success: true, imageFilenameStored: thread.imageFilenameStored, thumbnailFilenameStored: thread.thumbnailFilenameStored };
};
