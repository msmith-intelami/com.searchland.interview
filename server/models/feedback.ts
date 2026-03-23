import { z } from "zod";

export const feedbackStatusSchema = z.enum(["new", "reviewed"]);

export const feedbackInputSchema = z.object({
  author: z.string().min(1).max(120),
  email: z.string().email(),
  message: z.string().min(1).max(2000),
  status: feedbackStatusSchema,
});

export const feedbackIdSchema = z.object({
  id: z.number().int().positive(),
});

export const feedbackUpdateSchema = feedbackInputSchema.extend({
  id: z.number().int().positive(),
});

export type FeedbackStatus = z.infer<typeof feedbackStatusSchema>;
export type FeedbackInput = z.infer<typeof feedbackInputSchema>;
export type FeedbackUpdateInput = z.infer<typeof feedbackUpdateSchema>;
export type FeedbackIdInput = z.infer<typeof feedbackIdSchema>;
