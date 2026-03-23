import type { AuthUser } from "../auth/storage";

type LoginResponse = {
  token: string;
  user: AuthUser;
};

export async function loginWithPassword(input: { email: string; password: string }) {
  const response = await fetch(`${getServerBaseUrl()}/auth/login`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Invalid credentials.");
  }

  return (await response.json()) as LoginResponse;
}

export async function fetchAuthenticatedUser(token: string) {
  const response = await fetch(`${getServerBaseUrl()}/auth/me`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Session expired.");
  }

  return (await response.json()) as { user: AuthUser };
}

function getServerBaseUrl() {
  const trpcUrl = getViteApiUrl();
  return trpcUrl.replace(/\/trpc$/, "");
}

function getViteApiUrl() {
  return (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.VITE_API_URL ?? "http://localhost:3001/trpc";
}
