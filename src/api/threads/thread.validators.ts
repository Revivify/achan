import { z } from 'zod';

// Schema for creating a new thread
export const createThreadSchema = z.object({
  params: z.object({
    board_short_name: z.string(),
  }),
  body: z.object({
    subject: z.string().max(255).optional(),
    comment: z.string().min(1),
    poster_name: z.string().max(50).optional(),
    deletion_password: z.string().optional(),
  }),
});

export type CreateThreadInput = z.infer<typeof createThreadSchema>['body'];

// Schema for getting a thread by ID
export const getThreadSchema = z.object({
  params: z.object({
    board_short_name: z.string(),
    thread_id: z.string().transform((val) => parseInt(val, 10)),
  }),
});

// Schema for deleting a thread
export const deleteThreadSchema = z.object({
  params: z.object({
    board_short_name: z.string(),
    thread_id: z.string().transform((val) => parseInt(val, 10)),
  }),
  body: z.object({
    deletion_password: z.string().optional(),
  }),
});

export type DeleteThreadInput = z.infer<typeof deleteThreadSchema>['body'];

// Schema for listing threads
export const listThreadsSchema = z.object({
  params: z.object({
    board_short_name: z.string(),
  }),
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 15)),
  }),
});

export type ListThreadsQuery = z.infer<typeof listThreadsSchema>['query'];