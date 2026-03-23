import "reflect-metadata";
import "dotenv/config";
import cors from "cors";
import express, { type Application, type Request, type Response } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { getBearerToken } from "./auth/token.js";
import { db } from "./db/client.js";
import { loginInputSchema } from "./models/auth.js";
import { authService } from "./services/authService.js";
import { auditConsumerService } from "./services/auditConsumerService.js";
import { appRouter } from "./trpc/router.js";

const port = Number(process.env.PORT ?? 3001);
const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  }),
);
app.use((req, _res, next) => {
  const token = getBearerToken(req);
  req.user = token ? authService.verifyToken(token) : null;
  next();
});

app.post("/auth/login", (req: Request, res: Response) => {
  const parsed = loginInputSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const result = authService.login(parsed.data);

  if (!result) {
    res.status(401).json({ error: "Invalid credentials." });
    return;
  }

  res.json(result);
});

app.get("/auth/me", (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: "Invalid or expired token." });
    return;
  }

  res.json({ user: req.user });
});

app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext: ({ req }) => ({ db, user: req.user ?? null }),
  }),
);

app.get("/health", (_request: Request, response: Response) => {
  response.json({ ok: true });
});

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});

void auditConsumerService.start();
