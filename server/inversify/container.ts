import { Container } from "inversify";
import { TYPES } from "./types.js";
import { FeedbackService } from "../services/feedbackService.js";
import "../controllers/helloWorldController.js";
import "../controllers/feedbackController.js";

const container = new Container();

container.bind<FeedbackService>(TYPES.FeedbackService).to(FeedbackService).inSingletonScope();

export { container };
