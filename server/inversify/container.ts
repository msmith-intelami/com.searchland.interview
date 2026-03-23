import { Container } from "inversify";
import { TYPES } from "./types.js";
import { AuthService } from "../services/authService.js";
import { FeedbackService } from "../services/feedbackService.js";
import "../controllers/authController.js";
import "../controllers/helloWorldController.js";
import "../controllers/feedbackController.js";

const container = new Container();

container.bind<AuthService>(TYPES.AuthService).to(AuthService).inSingletonScope();
container.bind<FeedbackService>(TYPES.FeedbackService).to(FeedbackService).inSingletonScope();

export { container };
