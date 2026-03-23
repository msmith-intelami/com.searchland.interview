import { Container } from "inversify";
import { TYPE } from "inversify-express-utils";
import { AppAuthProvider } from "./authProvider.js";
import { AuthService } from "../services/authService.js";
import { FeedbackService } from "../services/feedbackService.js";
import "../controllers/authController.js";
import "../controllers/feedbackController.js";

const container = new Container();

container.bind<AppAuthProvider>(TYPE.AuthProvider).to(AppAuthProvider).inSingletonScope();
container.bind(AuthService).toSelf().inSingletonScope();
container.bind(FeedbackService).toSelf().inSingletonScope();

export { container };
