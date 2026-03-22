import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider } from "./AuthProvider";
import { useAuth } from "./useAuth";

function AuthConsumer() {
  const { isAuthenticated, email, setSession, logout } = useAuth();

  return (
    <div>
      <p data-testid="is-auth">{String(isAuthenticated)}</p>
      <p data-testid="email">{email}</p>
      <button
        type="button"
        onClick={() => setSession("token-123", "user@example.com")}
      >
        set-session
      </button>
      <button type="button" onClick={logout}>
        logout
      </button>
    </div>
  );
}

describe("AuthProvider + useAuth", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("hydrates auth state from localStorage", () => {
    localStorage.setItem("pinpoint_token", "seed-token");
    localStorage.setItem("pinpoint_email", "seed@example.com");

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    expect(screen.getByTestId("is-auth")).toHaveTextContent("true");
    expect(screen.getByTestId("email")).toHaveTextContent("seed@example.com");
  });

  it("setSession updates state and storage", async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await user.click(screen.getByRole("button", { name: "set-session" }));

    expect(screen.getByTestId("is-auth")).toHaveTextContent("true");
    expect(screen.getByTestId("email")).toHaveTextContent("user@example.com");
    expect(localStorage.getItem("pinpoint_token")).toBe("token-123");
    expect(localStorage.getItem("pinpoint_email")).toBe("user@example.com");
  });

  it("logout clears state and storage", async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await user.click(screen.getByRole("button", { name: "set-session" }));
    await user.click(screen.getByRole("button", { name: "logout" }));

    expect(screen.getByTestId("is-auth")).toHaveTextContent("false");
    expect(screen.getByTestId("email")).toHaveTextContent("");
    expect(localStorage.getItem("pinpoint_token")).toBeNull();
    expect(localStorage.getItem("pinpoint_email")).toBeNull();
  });

  it("throws when useAuth is used without provider", () => {
    function BrokenConsumer() {
      useAuth();
      return null;
    }

    expect(() => render(<BrokenConsumer />)).toThrow(
      "useAuth must be used within an AuthProvider",
    );
  });
});
