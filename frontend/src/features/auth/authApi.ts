import { apiClient } from "../../services/apiClient";

export interface AuthResponse {
  token: string;
  expiresAtUtc: string;
  email: string;
}

export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/login", {
    email,
    password,
  });
  return data;
}

export async function register(
  username: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/register", {
    username,
    email,
    password,
  });
  return data;
}
