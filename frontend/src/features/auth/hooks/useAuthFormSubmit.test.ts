import { act, renderHook } from "@testing-library/react";
import type { AuthResponse } from "../authApi";
import { useAuthFormSubmit } from "./useAuthFormSubmit";

function createSubmitEvent() {
  return { preventDefault: jest.fn() };
}

describe("useAuthFormSubmit", () => {
  it("success path calls onSuccess", async () => {
    const response = {
      token: "token-1",
      expiresAtUtc: "2026-01-01T00:00:00Z",
      email: "user@example.com",
    };
    const action = jest.fn().mockResolvedValue(response);
    const onSuccess = jest.fn();

    const { result } = renderHook(() =>
      useAuthFormSubmit({
        fallbackErrorMessage: "fallback error",
        action,
        onSuccess,
      }),
    );

    await act(async () => {
      await result.current.submit(createSubmitEvent() as never);
    });

    expect(action).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith(response);
    expect(result.current.error).toBe("");
    expect(result.current.loading).toBe(false);
  });

  it("error path uses API message or fallback", async () => {
    const action = jest
      .fn()
      .mockRejectedValueOnce({ response: { data: { message: "API error" } } })
      .mockRejectedValueOnce(new Error("unknown"));
    const onSuccess = jest.fn();

    const { result } = renderHook(() =>
      useAuthFormSubmit({
        fallbackErrorMessage: "Fallback error",
        action,
        onSuccess,
      }),
    );

    await act(async () => {
      await result.current.submit(createSubmitEvent() as never);
    });
    expect(result.current.error).toBe("API error");
    expect(onSuccess).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.submit(createSubmitEvent() as never);
    });
    expect(result.current.error).toBe("Fallback error");
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("always resets loading in finally", async () => {
    let rejectAction: (reason?: unknown) => void = () => undefined;
    const action = jest.fn(
      () =>
        new Promise<AuthResponse>((_, reject) => {
          rejectAction = reject;
        }),
    );

    const { result } = renderHook(() =>
      useAuthFormSubmit({
        fallbackErrorMessage: "fallback error",
        action,
        onSuccess: jest.fn(),
      }),
    );

    act(() => {
      void result.current.submit(createSubmitEvent() as never);
    });
    expect(result.current.loading).toBe(true);

    await act(async () => {
      rejectAction(new Error("network"));
      await Promise.resolve();
    });

    expect(result.current.loading).toBe(false);
  });
});
