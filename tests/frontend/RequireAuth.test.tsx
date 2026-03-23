import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RequireAuth } from "../../src/shared/auth/RequireAuth";

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

function renderProtectedRoute() {
  render(
    <MemoryRouter initialEntries={["/feedback"]}>
      <Routes>
        <Route
          path="/feedback"
          element={
            <RequireAuth>
              <div>Protected content</div>
            </RequireAuth>
          }
        />
        <Route path="/login" element={<div>Login route</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("RequireAuth", () => {
  afterEach(() => {
    authState.token = null;
    authState.user = null;
    authState.isReady = true;
  });

  it("shows a loading message while the session is being resolved", () => {
    authState.isReady = false;

    renderProtectedRoute();

    expect(screen.getByText("Checking session...")).toBeInTheDocument();
  });

  it("redirects to login when no token is available", async () => {
    authState.isReady = true;
    authState.token = null;

    renderProtectedRoute();

    expect(await screen.findByText("Login route")).toBeInTheDocument();
  });

  it("renders the protected content when a token is present", () => {
    authState.isReady = true;
    authState.token = "jwt-token";

    renderProtectedRoute();

    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });
});
