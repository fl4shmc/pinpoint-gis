import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { RequireAuth } from "./RequireAuth";

jest.mock("./useAuth", () => ({
  useAuth: jest.fn(),
}));

import { useAuth } from "./useAuth";

describe("RequireAuth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders children when authenticated", () => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });

    render(
      <MemoryRouter initialEntries={["/map"]}>
        <Routes>
          <Route
            path="/map"
            element={
              <RequireAuth>
                <div>Protected content</div>
              </RequireAuth>
            }
          />
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });

  it("redirects to login when unauthenticated", () => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: false });

    render(
      <MemoryRouter initialEntries={["/map"]}>
        <Routes>
          <Route
            path="/map"
            element={
              <RequireAuth>
                <div>Protected content</div>
              </RequireAuth>
            }
          />
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Login page")).toBeInTheDocument();
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("preserves the requested path in redirect state", () => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: false });

    function StateProbe() {
      const location = useLocation();
      const state = location.state as { from?: string } | null;
      return <div>from:{state?.from ?? "none"}</div>;
    }

    render(
      <MemoryRouter initialEntries={["/map"]}>
        <Routes>
          <Route
            path="/map"
            element={
              <RequireAuth>
                <div>Protected content</div>
              </RequireAuth>
            }
          />
          <Route path="/login" element={<StateProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("from:/map")).toBeInTheDocument();
  });
});
