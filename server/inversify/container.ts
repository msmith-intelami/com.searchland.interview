import { Container } from "inversify";
import { TYPE } from "inversify-express-utils";
import { AppAuthProvider } from "./authProvider.js";
import { AuthService } from "../services/authService.js";
import "../controllers/authController.js";

const container = new Container();

container.bind<AppAuthProvider>(TYPE.AuthProvider).to(AppAuthProvider).inSingletonScope();
container.bind(AuthService).toSelf().inSingletonScope();

export { container };
