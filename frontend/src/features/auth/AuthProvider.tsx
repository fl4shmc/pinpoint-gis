import { useMemo, useState, type ReactNode } from "react";
import { authStorage } from "./authStorage";
import { AuthContext, type AuthContextValue } from "./authContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    authStorage.getToken(),
  );
  const [email, setEmail] = useState<string>(() => authStorage.getEmail());

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(token),
      email,
      setSession: (newToken: string, newEmail: string) => {
        authStorage.setAuth(newToken, newEmail);
        setToken(newToken);
        setEmail(newEmail);
      },
      logout: () => {
        authStorage.clear();
        setToken(null);
        setEmail("");
      },
    }),
    [token, email],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
