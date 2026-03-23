import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCReact, httpBatchLink } from "@trpc/react-query";
import { BrowserRouter } from "react-router-dom";
import superjson from "superjson";
import type { AppRouter } from "../server/trpc/router";
import { App } from "./App";
import { readStoredToken } from "./lib/auth";
import "./index.css";

export const trpc = createTRPCReact<AppRouter>();

const queryClient = new QueryClient();
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: import.meta.env.VITE_API_URL ?? "http://localhost:3001/trpc",
      transformer: superjson,
      headers() {
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

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </trpc.Provider>
  </React.StrictMode>,
);
