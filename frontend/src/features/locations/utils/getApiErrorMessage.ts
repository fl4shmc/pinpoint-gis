type ApiError = { response?: { data?: { message?: string } } };

export function getApiErrorMessage(error: unknown): string | undefined {
  const typedError = error as ApiError | undefined;
  return typedError?.response?.data?.message;
}
