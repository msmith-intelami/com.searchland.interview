import type { Request, Response } from "express";
import { resolveRequestUser } from "../auth/resolveRequestUser.js";

type ControllerMethod = (req: Request, res: Response, ...args: unknown[]) => unknown;

export function isPrivate() {
  return (_target: unknown, _propertyKey: string | symbol, descriptor: PropertyDescriptor): void => {
    const original = descriptor.value as ControllerMethod;

    const decoratedMethod: ControllerMethod = function decoratedMethod(this: unknown, req, res, ...args) {
      const user = resolveRequestUser(req);

      if (!user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      req.user = user;
      return original.apply(this, [req, res, ...args]);
    };

    descriptor.value = decoratedMethod;
  };
}
