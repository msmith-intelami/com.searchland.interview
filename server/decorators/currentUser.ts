import { principal } from "inversify-express-utils";

export function currentUser() {
  return principal();
}
