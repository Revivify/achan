import { z } from 'zod';

export const createBoardSchema = z.object({
  body: z.object({
    shortName: z.string().min(1).max(10).regex(/^[a-zA-Z0-9]+$/),
    name: z.string().min(1).max(100),
    description: z.string().optional(),
  }),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>['body'];

export const updateBoardSchema = z.object({
  params: z.object({
    shortName: z.string(),
  }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().optional(),
  }),
});

export type UpdateBoardInput = z.infer<typeof updateBoardSchema>['body'];