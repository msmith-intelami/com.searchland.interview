import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LoginPage } from "../../src/pages/LoginPage/LoginPage";

const authState = {
  token: null as string | null,
  user: null,
  isReady: true,
  login: vi.fn(),
  logout: vi.fn(),
};

vi.mock("../../src/shared/auth/AuthProvider", () => ({
  useAuth: () => authState,
}));

vi.mock("../../src/shared/services/authApi", () => ({
  loginWithPassword: vi.fn(),
}));

async function renderLoginPage() {
  const { loginWithPassword } = await import("../../src/shared/services/authApi");
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/feedback" element={<div>Feedback page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );

  return {
    loginWithPassword,
  };
}

describe("LoginPage", () => {
  afterEach(() => {
    authState.login.mockReset();
    authState.logout.mockReset();
    vi.resetAllMocks();
  });

  it("submits credentials and redirects after a successful login", async () => {
    const { loginWithPassword } = await renderLoginPage();
    vi.mocked(loginWithPassword).mockResolvedValue({
      token: "jwt-token",
      user: {
        id: "1",
        email: "admin@example.com",
        name: "Admin User",
      },
    });

    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(loginWithPassword).toHaveBeenCalledWith({
        email: "admin@example.com",
        password: "password123",
      });
    });

    expect(authState.login).toHaveBeenCalledWith("jwt-token", {
      id: "1",
      email: "admin@example.com",
      name: "Admin User",
    });

    await screen.findByText("Feedback page");
  });

  it("shows an error when login fails", async () => {
    const { loginWithPassword } = await renderLoginPage();
    vi.mocked(loginWithPassword).mockRejectedValue(new Error("Invalid credentials"));

    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Invalid credentials.")).toBeInTheDocument();
    expect(authState.login).not.toHaveBeenCalled();
  });
});
