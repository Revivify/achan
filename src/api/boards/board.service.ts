import prisma from '../../core/prisma';
import { CreateBoardInput, UpdateBoardInput } from './board.validators';

export const getAllBoards = async () => {
  return prisma.board.findMany({
    include: { 
      _count: { 
        select: { 
          threads: true 
        } 
      } 
    },
    orderBy: {
      shortName: 'asc'
    }
  });
};

export const getBoardByShortName = async (shortName: string) => {
  return prisma.board.findUnique({
    where: { shortName },
    include: { 
      _count: { 
        select: { 
          threads: true 
        } 
      } 
    }
  });
};

export const createBoard = async (data: CreateBoardInput) => {
  return prisma.board.create({
    data
  });
};

export const updateBoard = async (shortName: string, data: UpdateBoardInput) => {
  return prisma.board.update({
    where: { shortName },
    data
  });
};

export const deleteBoard = async (shortName: string) => {
  return prisma.board.delete({
    where: { shortName }
  });
};