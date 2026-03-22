import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import * as authApi from "../../features/auth/authApi";
import * as authContext from "../../features/auth/useAuth";
import { RegisterPage } from "./index";

const mockNavigate = jest.fn();
const mockSetSession = jest.fn();

jest.mock("../../features/auth/authApi", () => ({
  register: jest.fn(),
}));

jest.mock("../../features/auth/useAuth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderRegisterPage() {
  return render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>,
  );
}

async function fillAndSubmit(
  user: ReturnType<typeof userEvent.setup>,
  username: string,
  email: string,
  password: string,
) {
  await user.type(screen.getByPlaceholderText("Username"), username);
  await user.type(screen.getByPlaceholderText("Email"), email);
  await user.type(screen.getByPlaceholderText("Password"), password);
  await user.click(screen.getByRole("button", { name: "Register" }));
}

describe("RegisterPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authContext.useAuth as jest.Mock).mockReturnValue({
      setSession: mockSetSession,
    });
  });

  it("successful submit calls setSession and redirects to /map", async () => {
    const user = userEvent.setup();
    (authApi.register as jest.Mock).mockResolvedValue({
      token: "token-1",
      expiresAtUtc: "2026-01-01T00:00:00Z",
      email: "user@example.com",
    });

    renderRegisterPage();
    await fillAndSubmit(user, "newuser", "user@example.com", "secret123");

    await waitFor(() => {
      expect(authApi.register).toHaveBeenCalledWith(
        "newuser",
        "user@example.com",
        "secret123",
      );
      expect(mockSetSession).toHaveBeenCalledWith("token-1", "user@example.com");
      expect(mockNavigate).toHaveBeenCalledWith("/map", { replace: true });
    });
  });

  it("API failure shows error message", async () => {
    const user = userEvent.setup();
    (authApi.register as jest.Mock).mockRejectedValue({
      response: { data: { message: "Email already exists" } },
    });

    renderRegisterPage();
    await fillAndSubmit(user, "newuser", "user@example.com", "secret123");

    expect(await screen.findByText("Email already exists")).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("loading/disabled state behavior", async () => {
    const user = userEvent.setup();
    (authApi.register as jest.Mock).mockImplementation(
      () => new Promise(() => undefined),
    );

    renderRegisterPage();
    await fillAndSubmit(user, "newuser", "user@example.com", "secret123");

    await waitFor(() => {
      const button = screen.getByRole("button", { name: "Creating account..." });
      expect(button).toBeDisabled();
    });
  });
});
