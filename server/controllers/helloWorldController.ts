import type * as express from "express";
import { controller, httpGet, httpPost, interfaces } from "inversify-express-utils";
import { isPrivate } from "../decorators/isPrivate.js";

@controller("/hello")
export class HelloWorldController implements interfaces.Controller {
  @httpGet("/")
  @isPrivate()
  public get(req: express.Request, res: express.Response): void {
    res.json({ message: "Hello World from GET request!" });
  }

  @httpPost("/")
  @isPrivate()
  public async post(req: express.Request, res: express.Response): Promise<void> {
    if (!req.body || Object.keys(req.body).length === 0) {
      res.status(400).json({ error: "Body parameters are missing or empty." });
      return;
    }

    res.json({ message: "Hello World!", received: req.body });
  }
}
