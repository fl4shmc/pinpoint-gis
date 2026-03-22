import { act, renderHook, waitFor } from "@testing-library/react";
import type { CreateLocationPayload, LocationItem } from "../locationTypes";
import { useLocations } from "./useLocations";
import {
  createLocation,
  fetchLocations,
  setFavorite,
} from "../locationsApi";

jest.mock("../locationsApi", () => ({
  fetchLocations: jest.fn(),
  createLocation: jest.fn(),
  setFavorite: jest.fn(),
}));

const sampleLocations: LocationItem[] = [
  {
    id: 1,
    name: "One Galle Face",
    description: "Commercial building",
    category: "Commercial",
    status: "Active",
    latitude: 6.9271,
    longitude: 79.8612,
    isFavorite: false,
  },
  {
    id: 2,
    name: "Home",
    description: "Residential place",
    category: "Residential",
    status: "Pending",
    latitude: 6.9,
    longitude: 79.9,
    isFavorite: false,
  },
];

describe("useLocations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads locations on mount and selects the first item", async () => {
    (fetchLocations as jest.Mock).mockResolvedValue(sampleLocations);

    const { result } = renderHook(() => useLocations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("");
    expect(result.current.allLocations).toEqual(sampleLocations);
    expect(result.current.selectedLocationId).toBe(1);
  });

  it("sets an error when initial fetch fails", async () => {
    (fetchLocations as jest.Mock).mockRejectedValue(new Error("network"));

    const { result } = renderHook(() => useLocations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Failed to load locations.");
    expect(result.current.allLocations).toEqual([]);
    expect(result.current.selectedLocationId).toBeNull();
  });

  it("creates a location, prepends it, and selects it", async () => {
    (fetchLocations as jest.Mock).mockResolvedValue(sampleLocations);
    const created: LocationItem = {
      id: 99,
      name: "New Spot",
      description: "Added from test",
      category: "Commercial",
      status: "Active",
      latitude: 7.1,
      longitude: 80.2,
      isFavorite: false,
    };
    (createLocation as jest.Mock).mockResolvedValue(created);

    const payload: CreateLocationPayload = {
      name: "New Spot",
      description: "Added from test",
      category: "Commercial",
      status: "Active",
      latitude: 7.1,
      longitude: 80.2,
    };

    const { result } = renderHook(() => useLocations());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.handleCreate(payload);
    });

    expect(createLocation).toHaveBeenCalledWith(payload);
    expect(result.current.allLocations[0]).toEqual(created);
    expect(result.current.selectedLocationId).toBe(99);
    expect(result.current.saving).toBe(false);
    expect(result.current.error).toBe("");
  });

  it("sets an error when create fails", async () => {
    (fetchLocations as jest.Mock).mockResolvedValue(sampleLocations);
    (createLocation as jest.Mock).mockRejectedValue(new Error("create failed"));

    const { result } = renderHook(() => useLocations());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.handleCreate({
        name: "Bad",
        description: "Bad",
        category: "Commercial",
        status: "Active",
        latitude: 1,
        longitude: 2,
      });
    });

    expect(result.current.error).toBe("Failed to create location.");
    expect(result.current.saving).toBe(false);
  });

  it("toggles favorite on success", async () => {
    (fetchLocations as jest.Mock).mockResolvedValue(sampleLocations);
    (setFavorite as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useLocations());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.handleToggleFavorite(sampleLocations[0]);
    });

    expect(setFavorite).toHaveBeenCalledWith(1, true);
    expect(result.current.allLocations[0].isFavorite).toBe(true);
  });

  it("keeps state unchanged and sets error if favorite update fails", async () => {
    (fetchLocations as jest.Mock).mockResolvedValue(sampleLocations);
    (setFavorite as jest.Mock).mockRejectedValue(new Error("favorite failed"));

    const { result } = renderHook(() => useLocations());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.handleToggleFavorite(sampleLocations[0]);
    });

    expect(result.current.allLocations[0].isFavorite).toBe(false);
    expect(result.current.error).toBe("Failed to update favorite status.");
  });
});
