import { z } from 'zod';

export const createSchema = z.object({
  audioUrl: z.string().url(),
});