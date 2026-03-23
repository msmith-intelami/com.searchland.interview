import { desc, eq } from "drizzle-orm";
import { injectable } from "inversify";
import { db } from "../db/client.js";
import { feedback } from "../db/schema.js";
import type { FeedbackInput } from "../models/feedback.js";

@injectable()
export class FeedbackService {
  public async list() {
    return db.select().from(feedback).orderBy(desc(feedback.createdAt));
  }

  public async create(input: FeedbackInput) {
    const [created] = await db.insert(feedback).values(input).returning();
    return created;
  }

  public async update(id: number, input: FeedbackInput) {
    const [updated] = await db
      .update(feedback)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(feedback.id, id))
      .returning();

    return updated ?? null;
  }

  public async delete(id: number) {
    const [deleted] = await db.delete(feedback).where(eq(feedback.id, id)).returning();
    return deleted ?? null;
  }
}

export const feedbackService = new FeedbackService();
