import { useState, type FormEvent } from "react";
import type { AuthResponse } from "../authApi";

type AuthError = { response?: { data?: { message?: string } } };

interface UseAuthFormSubmitOptions {
  fallbackErrorMessage: string;
  action: () => Promise<AuthResponse>;
  onSuccess: (response: AuthResponse) => void;
}

interface UseAuthFormSubmitResult {
  loading: boolean;
  error: string;
  submit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}

function getApiErrorMessage(error: unknown): string | undefined {
  const typedError = error as AuthError | undefined;
  return typedError?.response?.data?.message;
}

export function useAuthFormSubmit({
  fallbackErrorMessage,
  action,
  onSuccess,
}: UseAuthFormSubmitOptions): UseAuthFormSubmitResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await action();
      onSuccess(response);
    } catch (err) {
      setError(getApiErrorMessage(err) ?? fallbackErrorMessage);
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, submit };
}
