import type { Request, Response } from "express";

type ControllerMethod = (req: Request, res: Response, ...args: unknown[]) => unknown;

export function isPrivate() {
  return (_target: unknown, _propertyKey: string | symbol, descriptor: PropertyDescriptor): void => {
    const original = descriptor.value as ControllerMethod;

    const decoratedMethod: ControllerMethod = function decoratedMethod(this: unknown, req, res, ...args) {
      const privateApiKey = process.env.PRIVATE_API_KEY;

      if (privateApiKey && req.header("x-private-key") !== privateApiKey) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      return original.apply(this, [req, res, ...args]);
    };

    descriptor.value = decoratedMethod;
  };
}
