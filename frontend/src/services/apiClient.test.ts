jest.mock("../features/auth/authStorage", () => ({
  authStorage: {
    getToken: jest.fn(),
  },
}));
jest.mock("./env", () => ({
  getApiBaseUrl: jest.fn(() => "http://localhost:8080/api"),
}));

import { authStorage } from "../features/auth/authStorage";
import { apiClient } from "./apiClient";

describe("apiClient request interceptor", () => {
  it("attaches Authorization header when token exists", () => {
    (authStorage.getToken as jest.Mock).mockReturnValue("abc123");

    const fulfilled = (apiClient.interceptors.request as any).handlers[0]
      .fulfilled as (config: { headers?: Record<string, string> }) => {
      headers?: Record<string, string>;
    };

    const config = fulfilled({ headers: {} });

    expect(config.headers?.Authorization).toBe("Bearer abc123");
  });

  it("does not attach Authorization header when token is missing", () => {
    (authStorage.getToken as jest.Mock).mockReturnValue(null);

    const fulfilled = (apiClient.interceptors.request as any).handlers[0]
      .fulfilled as (config: { headers?: Record<string, string> }) => {
      headers?: Record<string, string>;
    };

    const config = fulfilled({ headers: {} });

    expect(config.headers?.Authorization).toBeUndefined();
  });
});
