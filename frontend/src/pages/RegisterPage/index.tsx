import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../features/auth/authApi";
import { useAuth } from "../../features/auth/AuthContext";
import { useAuthFormSubmit } from "../../features/auth/hooks/useAuthFormSubmit";
import { FormInput } from "../../components/shared/form";
import "./RegisterPage.css";

export function RegisterPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loading, error, submit } = useAuthFormSubmit({
    fallbackErrorMessage:
      "Registration failed. Email or username may already exist.",
    action: () => register(username, email, password),
    onSuccess: (data) => {
      setSession(data.token, data.email);
      navigate("/map", { replace: true });
    },
  });

  return (
    <main className="auth-shell">
      <form className="auth-card" onSubmit={submit}>
        <h1>Register</h1>
        <FormInput
          required
          minLength={3}
          value={username}
          onChange={setUsername}
          placeholder="Username"
        />
        <FormInput
          required
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="Email"
        />
        <FormInput
          required
          minLength={6}
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Password"
        />
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </main>
  );
}
