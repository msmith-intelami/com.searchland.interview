import { TRPCError } from "@trpc/server";
import { feedbackIdSchema, feedbackInputSchema, feedbackUpdateSchema } from "../models/feedback.js";
import { feedbackService } from "../services/feedbackService.js";
import { publicProcedure, router } from "./trpc.js";

export const appRouter = router({
  feedback: router({
    list: publicProcedure.query(async () => {
      return feedbackService.list();
    }),

    create: publicProcedure.input(feedbackInputSchema).mutation(async ({ input }) => {
      return feedbackService.create(input);
    }),

    update: publicProcedure.input(feedbackUpdateSchema).mutation(async ({ input }) => {
      const updated = await feedbackService.update(input.id, input);

      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Feedback entry not found",
        });
      }

      return updated;
    }),

    delete: publicProcedure.input(feedbackIdSchema).mutation(async ({ input }) => {
      const deleted = await feedbackService.delete(input.id);

      if (!deleted) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Feedback entry not found",
        });
      }

      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
