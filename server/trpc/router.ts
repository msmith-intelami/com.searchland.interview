import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { feedback } from "../db/schema.js";
import { publicProcedure, router } from "./trpc.js";

const feedbackInput = z.object({
  author: z.string().min(1).max(120),
  email: z.string().email(),
  message: z.string().min(1).max(2000),
  status: z.enum(["new", "reviewed"]),
});

export const appRouter = router({
  feedback: router({
    list: publicProcedure.query(async ({ ctx }) => {
      return ctx.db.select().from(feedback).orderBy(desc(feedback.createdAt));
    }),

    create: publicProcedure.input(feedbackInput).mutation(async ({ ctx, input }) => {
      const [created] = await ctx.db.insert(feedback).values(input).returning();
      return created;
    }),

    update: publicProcedure
      .input(
        feedbackInput.extend({
          id: z.number().int().positive(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const [updated] = await ctx.db
          .update(feedback)
          .set({
            author: input.author,
            email: input.email,
            message: input.message,
            status: input.status,
            updatedAt: new Date(),
          })
          .where(eq(feedback.id, input.id))
          .returning();

        if (!updated) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Feedback entry not found",
          });
        }

        return updated;
      }),

    delete: publicProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const [deleted] = await ctx.db.delete(feedback).where(eq(feedback.id, input.id)).returning();

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
