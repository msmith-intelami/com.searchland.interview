import { TRPCError } from "@trpc/server";
import { loginInputSchema } from "../models/auth.js";
import { feedbackIdSchema, feedbackInputSchema, feedbackUpdateSchema } from "../models/feedback.js";
import { authService } from "../services/authService.js";
import { feedbackService } from "../services/feedbackService.js";
import { protectedProcedure, publicProcedure, router } from "./trpc.js";

export const appRouter = router({
  auth: router({
    login: publicProcedure.input(loginInputSchema).mutation(({ input }) => {
      const result = authService.login(input);

      if (!result) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }

      return result;
    }),

    me: protectedProcedure.query(({ ctx }) => {
      return { user: ctx.user };
    }),
  }),
  feedback: router({
    list: protectedProcedure.query(async () => {
      return feedbackService.list();
    }),

    create: protectedProcedure.input(feedbackInputSchema).mutation(async ({ input }) => {
      return feedbackService.create(input);
    }),

    update: protectedProcedure.input(feedbackUpdateSchema).mutation(async ({ input }) => {
      const updated = await feedbackService.update(input.id, input);

      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Feedback entry not found",
        });
      }

      return updated;
    }),

    delete: protectedProcedure.input(feedbackIdSchema).mutation(async ({ input }) => {
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
