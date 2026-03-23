import { Container } from "inversify";
import { TYPE } from "inversify-express-utils";
import { TYPES } from "./types.js";
import { AppAuthProvider } from "../auth/authProvider.js";
import { AuthService } from "../services/authService.js";
import { AuditConsumerService } from "../services/auditConsumerService.js";
import { AuditLogService } from "../services/auditLogService.js";
import { AuditService } from "../services/auditService.js";
import { FeedbackService } from "../services/feedbackService.js";
import "../controllers/authController.js";
import "../controllers/helloWorldController.js";
import "../controllers/feedbackController.js";

const container = new Container();

container.bind<AppAuthProvider>(TYPE.AuthProvider).to(AppAuthProvider).inSingletonScope();
container.bind<AuthService>(TYPES.AuthService).to(AuthService).inSingletonScope();
container.bind<AuditConsumerService>(TYPES.AuditConsumerService).to(AuditConsumerService).inSingletonScope();
container.bind<AuditLogService>(TYPES.AuditLogService).to(AuditLogService).inSingletonScope();
container.bind<AuditService>(TYPES.AuditService).to(AuditService).inSingletonScope();
container.bind<FeedbackService>(TYPES.FeedbackService).to(FeedbackService).inSingletonScope();

export { container };
