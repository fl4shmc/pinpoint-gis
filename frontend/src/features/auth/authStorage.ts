const TOKEN_KEY = "pinpoint_token";
const USER_EMAIL_KEY = "pinpoint_email";

export const authStorage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  setAuth(token: string, email: string) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_EMAIL_KEY, email);
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_EMAIL_KEY);
  },
  getEmail(): string {
    return localStorage.getItem(USER_EMAIL_KEY) ?? "";
  },
};
