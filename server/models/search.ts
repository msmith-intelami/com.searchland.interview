import { z } from "zod";

export const feedbackSearchInputSchema = z.object({
  query: z.string().trim().min(1).max(200),
});

export type FeedbackSearchInput = z.infer<typeof feedbackSearchInputSchema>;
