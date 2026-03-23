import "reflect-metadata";
import "dotenv/config";
import cors from "cors";
import express from "express";
import { InversifyExpressServer } from "inversify-express-utils";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { resolveRequestUser } from "./auth/resolveRequestUser.js";
import { container } from "./inversify/container.js";
import { auditConsumerService } from "./services/auditConsumerService.js";
import { db } from "./db/client.js";
import { appRouter } from "./trpc/router.js";

const port = Number(process.env.PORT ?? 3001);
const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";
const server = new InversifyExpressServer(container);

server.setConfig((app) => {
  app.use(express.json());
  app.use(
    cors({
      origin: clientOrigin,
      credentials: true,
    }),
  );
  // Resolve the authenticated user once at the HTTP boundary so both
  // controller handlers and the tRPC context can rely on the same request state.
  app.use((req, _res, next) => {
    req.user = resolveRequestUser(req);
    next();
  });
  // tRPC is mounted alongside the decorator-based REST controllers because the
  // frontend uses tRPC for typed queries and mutations, while the controllers
  // remain available for conventional REST usage and extension during interviews.
  app.use(
    "/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext: ({ req }) => ({ db, user: req.user ?? null }),
    }),
  );
  app.get("/health", (_request, response) => {
    response.json({ ok: true });
  });
});

server.build().listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});

// The audit consumer is safe to start unconditionally because it becomes a no-op
// when AUDIT_ENABLED is false or supporting infrastructure is missing.
void auditConsumerService.start();
