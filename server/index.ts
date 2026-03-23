import "dotenv/config";
import cors from "cors";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { db } from "./db/client.js";
import { appRouter } from "./trpc/router.js";

const app = express();
const port = Number(process.env.PORT ?? 3001);
const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";

app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  }),
);

app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext: () => ({ db }),
  }),
);

app.get("/health", (_request, response) => {
  response.json({ ok: true });
});

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
