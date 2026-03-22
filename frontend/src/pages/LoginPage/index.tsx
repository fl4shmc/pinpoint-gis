import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { login } from "../../features/auth/authApi";
import { useAuth } from "../../features/auth/AuthContext";
import { useAuthFormSubmit } from "../../features/auth/hooks/useAuthFormSubmit";
import { FormInput } from "../../components/shared/form";
import "./LoginPage.css";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loading, error, submit } = useAuthFormSubmit({
    fallbackErrorMessage: "Login failed. Please check your credentials.",
    action: () => login(email, password),
    onSuccess: (data) => {
      setSession(data.token, data.email);
      const from = (location.state as { from?: string } | null)?.from ?? "/map";
      navigate(from, { replace: true });
    },
  });

  return (
    <main className="auth-shell">
      <form className="auth-card" onSubmit={submit}>
        <h1>Sign in</h1>
        <FormInput
          required
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="Email"
        />
        <FormInput
          required
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Password"
        />
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>
        <p>
          Need an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </main>
  );
}
