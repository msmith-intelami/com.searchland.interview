import "dotenv/config";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../infrastructure/persistence/postgres.js";
import { users } from "../infrastructure/persistence/schema.js";

async function main() {
  const email = process.env.SEED_USER_EMAIL ?? "admin@example.com";
  const name = process.env.SEED_USER_NAME ?? "Demo Admin";
  const password = process.env.SEED_USER_PASSWORD ?? "password123";
  const passwordHash = await hash(password, 12);

  const existing = await db.select().from(users).where(eq(users.email, email));

  if (existing.length > 0) {
    await db
      .update(users)
      .set({
        name,
        passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.email, email));

    console.log(`Updated seeded user ${email}`);
    return;
  }

  await db.insert(users).values({
    email,
    name,
    passwordHash,
  });

  console.log(`Created seeded user ${email}`);
}

void main().catch((error) => {
  console.error("Failed to seed user", error);
  process.exit(1);
});
