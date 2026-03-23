import type * as express from "express";
import { inject } from "inversify";
import { controller, httpDelete, httpGet, httpPost, httpPut, interfaces } from "inversify-express-utils";
import { isPrivate } from "../decorators/isPrivate.js";
import { TYPES } from "../inversify/types.js";
import { feedbackInputSchema } from "../models/feedback.js";
import { FeedbackService } from "../services/feedbackService.js";

@controller("/feedback")
export class FeedbackController implements interfaces.Controller {
  public constructor(@inject(TYPES.FeedbackService) private readonly feedbackService: FeedbackService) {}

  @httpGet("/")
  @isPrivate()
  public async list(_req: express.Request, res: express.Response): Promise<void> {
    const items = await this.feedbackService.list();
    res.json(items);
  }

  @httpPost("/")
  @isPrivate()
  public async create(req: express.Request, res: express.Response): Promise<void> {
    const parsed = feedbackInputSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const created = await this.feedbackService.create(parsed.data);
    res.status(201).json(created);
  }

  @httpPut("/:id")
  @isPrivate()
  public async update(req: express.Request, res: express.Response): Promise<void> {
    const id = Number(req.params.id);
    const parsed = feedbackInputSchema.safeParse(req.body);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: "A valid numeric id is required." });
      return;
    }

    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const updated = await this.feedbackService.update(id, parsed.data);

    if (!updated) {
      res.status(404).json({ error: "Feedback entry not found." });
      return;
    }

    res.json(updated);
  }

  @httpDelete("/:id")
  @isPrivate()
  public async delete(req: express.Request, res: express.Response): Promise<void> {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: "A valid numeric id is required." });
      return;
    }

    const deleted = await this.feedbackService.delete(id);

    if (!deleted) {
      res.status(404).json({ error: "Feedback entry not found." });
      return;
    }

    res.json({ success: true });
  }
}
