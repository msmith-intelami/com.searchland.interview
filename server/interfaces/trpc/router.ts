import { TRPCError } from "@trpc/server";
import { loginInputSchema } from "../../domain/models/auth.js";
import { feedbackIdSchema, feedbackInputSchema, feedbackUpdateSchema } from "../../domain/models/feedback.js";
import { authService } from "../../application/services/authService.js";
import { auditLogService } from "../../application/services/auditLogService.js";
import { feedbackService } from "../../application/services/feedbackService.js";
import { protectedProcedure, publicProcedure, router } from "./trpc.js";

export const appRouter = router({
  auth: router({
    login: publicProcedure.input(loginInputSchema).mutation(async ({ input }) => {
      const result = await authService.login(input);

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
  audit: router({
    listMine: protectedProcedure.query(async ({ ctx }) => {
      return auditLogService.listForUser(ctx.user);
    }),
  }),
  feedback: router({
    list: protectedProcedure.query(async () => {
      return feedbackService.list();
    }),

    create: protectedProcedure.input(feedbackInputSchema).mutation(async ({ ctx, input }) => {
      return feedbackService.create(input, ctx.user);
    }),

    update: protectedProcedure.input(feedbackUpdateSchema).mutation(async ({ ctx, input }) => {
      const updated = await feedbackService.update(input.id, input, ctx.user);

      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Feedback entry not found",
        });
      }

      return updated;
    }),

    delete: protectedProcedure.input(feedbackIdSchema).mutation(async ({ ctx, input }) => {
      const deleted = await feedbackService.delete(input.id, ctx.user);

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
