import { createTRPCReact, httpBatchLink } from "@trpc/react-query";
import superjson from "superjson";
import type { AppRouter } from "../../../contracts/trpc";
import { readStoredToken } from "../auth/storage";

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: import.meta.env.VITE_API_URL ?? "http://localhost:3001/trpc",
      transformer: superjson,
      headers() {
        // The browser token is read at request time so queries automatically use
        // the latest auth state after login, logout, or session restoration.
        const token = readStoredToken();

        return token
          ? {
              authorization: `Bearer ${token}`,
            }
          : {};
      },
    }),
  ],
});
