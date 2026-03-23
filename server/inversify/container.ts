import { Container } from "inversify";
import { TYPE } from "inversify-express-utils";
import { TYPES } from "./types.js";
import { AppAuthProvider } from "../application/auth/authProvider.js";
import { AuthService } from "../application/services/authService.js";
import { FeedbackService } from "../application/services/feedbackService.js";
import "../controllers/authController.js";
import "../controllers/feedbackController.js";

const container = new Container();

container.bind<AppAuthProvider>(TYPE.AuthProvider).to(AppAuthProvider).inSingletonScope();
container.bind<AuthService>(TYPES.AuthService).to(AuthService).inSingletonScope();
container.bind<FeedbackService>(TYPES.FeedbackService).to(FeedbackService).inSingletonScope();

export { container };
