import { createContext } from "react";

export interface AuthContextValue {
  isAuthenticated: boolean;
  email: string;
  setSession: (token: string, email: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
