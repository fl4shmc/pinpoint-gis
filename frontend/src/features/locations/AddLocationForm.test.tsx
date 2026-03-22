import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddLocationForm } from "./AddLocationForm";

describe("AddLocationForm", () => {
  it("submits payload with numeric latitude/longitude conversion", async () => {
    const user = userEvent.setup();
    const onCreate = jest.fn().mockResolvedValue(undefined);
    render(<AddLocationForm onCreate={onCreate} />);

    await user.type(screen.getByPlaceholderText("Name"), "Test Place");
    await user.type(
      screen.getByPlaceholderText("Description"),
      "Test description",
    );
    await user.clear(screen.getByPlaceholderText("Latitude"));
    await user.type(screen.getByPlaceholderText("Latitude"), "7.1234");
    await user.clear(screen.getByPlaceholderText("Longitude"));
    await user.type(screen.getByPlaceholderText("Longitude"), "80.5678");

    const selects = screen.getAllByRole("combobox");
    await user.selectOptions(selects[0], "Residential");
    await user.selectOptions(selects[1], "Pending");

    await user.click(screen.getByRole("button", { name: "Add Location" }));

    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledWith({
        name: "Test Place",
        description: "Test description",
        latitude: 7.1234,
        longitude: 80.5678,
        category: "Residential",
        status: "Pending",
      });
    });
  });

  it("shows loading and disables submit while request is pending", async () => {
    const user = userEvent.setup();
    let resolveCreate: () => void = () => undefined;
    const onCreate = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveCreate = resolve;
        }),
    );

    render(<AddLocationForm onCreate={onCreate} />);
    await user.type(screen.getByPlaceholderText("Name"), "Async Place");
    await user.type(
      screen.getByPlaceholderText("Description"),
      "Async description",
    );

    await user.click(screen.getByRole("button", { name: "Add Location" }));

    expect(screen.getByRole("button", { name: "Saving..." })).toBeDisabled();

    resolveCreate();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Add Location" })).toBeEnabled();
    });
  });

  it("resets form after successful submit", async () => {
    const user = userEvent.setup();
    const onCreate = jest.fn().mockResolvedValue(undefined);
    render(<AddLocationForm onCreate={onCreate} />);

    await user.type(screen.getByPlaceholderText("Name"), "Reset Me");
    await user.type(screen.getByPlaceholderText("Description"), "Reset this too");
    await user.clear(screen.getByPlaceholderText("Latitude"));
    await user.type(screen.getByPlaceholderText("Latitude"), "9.9");
    await user.clear(screen.getByPlaceholderText("Longitude"));
    await user.type(screen.getByPlaceholderText("Longitude"), "8.8");

    await user.click(screen.getByRole("button", { name: "Add Location" }));

    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByPlaceholderText("Name")).toHaveValue("");
    expect(screen.getByPlaceholderText("Description")).toHaveValue("");
    expect(screen.getByPlaceholderText("Latitude")).toHaveValue(6.9271);
    expect(screen.getByPlaceholderText("Longitude")).toHaveValue(79.8612);
  });
});
