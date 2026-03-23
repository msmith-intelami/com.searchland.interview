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
  app.use((req, _res, next) => {
    req.user = resolveRequestUser(req);
    next();
  });
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

void auditConsumerService.start();
