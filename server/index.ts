import "reflect-metadata";
import "dotenv/config";
import cors from "cors";
import express, { type Application, type Request, type Response } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { InversifyExpressServer } from "inversify-express-utils";
import { db } from "./db/client.js";
import { container } from "./inversify/container.js";
import { appRouter } from "./trpc/router.js";

const port = Number(process.env.PORT ?? 3001);
const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";
const server = new InversifyExpressServer(container);

server.setConfig((app: Application) => {
  app.use(express.json());
  app.use(
    cors({
      origin: clientOrigin,
      credentials: true,
    }),
  );
});

const app = server.build();

app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext: () => ({ db }),
  }),
);

app.get("/health", (_request: Request, response: Response) => {
  response.json({ ok: true });
});

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
