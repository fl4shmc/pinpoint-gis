import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import * as authApi from "../../features/auth/authApi";
import * as authContext from "../../features/auth/useAuth";
import { LoginPage } from "./index";

const mockNavigate = jest.fn();
const mockSetSession = jest.fn();
let mockLocationState: unknown = null;

jest.mock("../../features/auth/authApi", () => ({
  login: jest.fn(),
}));

jest.mock("../../features/auth/useAuth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: mockLocationState }),
  };
});

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
}

async function fillAndSubmit(
  user: ReturnType<typeof userEvent.setup>,
  email: string,
  password: string,
) {
  await user.type(screen.getByPlaceholderText("Email"), email);
  await user.type(screen.getByPlaceholderText("Password"), password);
  await user.click(screen.getByRole("button", { name: "Login" }));
}

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocationState = null;
    (authContext.useAuth as jest.Mock).mockReturnValue({
      setSession: mockSetSession,
    });
  });

  it("successful submit calls setSession and redirects", async () => {
    const user = userEvent.setup();
    (authApi.login as jest.Mock).mockResolvedValue({
      token: "token-1",
      expiresAtUtc: "2026-01-01T00:00:00Z",
      email: "user@example.com",
    });

    renderLoginPage();
    await fillAndSubmit(user, "user@example.com", "secret123");

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith("user@example.com", "secret123");
      expect(mockSetSession).toHaveBeenCalledWith("token-1", "user@example.com");
      expect(mockNavigate).toHaveBeenCalledWith("/map", { replace: true });
    });
  });

  it("API failure shows error message", async () => {
    const user = userEvent.setup();
    (authApi.login as jest.Mock).mockRejectedValue({
      response: { data: { message: "Invalid credentials" } },
    });

    renderLoginPage();
    await fillAndSubmit(user, "user@example.com", "wrong");

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("submit button shows loading/disabled state", async () => {
    const user = userEvent.setup();
    (authApi.login as jest.Mock).mockImplementation(
      () => new Promise(() => undefined),
    );

    renderLoginPage();
    await fillAndSubmit(user, "user@example.com", "secret123");

    await waitFor(() => {
      const button = screen.getByRole("button", { name: "Signing in..." });
      expect(button).toBeDisabled();
    });
  });

  it("redirect honors location.state.from", async () => {
    const user = userEvent.setup();
    mockLocationState = { from: "/secure/area" };
    (authApi.login as jest.Mock).mockResolvedValue({
      token: "token-2",
      expiresAtUtc: "2026-01-01T00:00:00Z",
      email: "user@example.com",
    });

    renderLoginPage();
    await fillAndSubmit(user, "user@example.com", "secret123");

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/secure/area", { replace: true });
    });
  });
});
