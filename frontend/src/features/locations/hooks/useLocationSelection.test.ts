import { act, renderHook } from "@testing-library/react";
import type { LocationItem } from "../locationTypes";
import { useLocationSelection } from "./useLocationSelection";

const locations: LocationItem[] = [
  {
    id: 1,
    name: "Office",
    description: "Commercial location",
    category: "Commercial",
    status: "Active",
    latitude: 1,
    longitude: 1,
    isFavorite: false,
  },
  {
    id: 2,
    name: "Home",
    description: "Residential location",
    category: "Residential",
    status: "Pending",
    latitude: 2,
    longitude: 2,
    isFavorite: false,
  },
];

describe("useLocationSelection", () => {
  it("defaults to all filter and returns selected location", () => {
    const { result } = renderHook(() =>
      useLocationSelection({
        allLocations: locations,
        selectedLocationId: 1,
      }),
    );

    expect(result.current.categoryFilter).toBe("all");
    expect(result.current.filteredLocations).toEqual(locations);
    expect(result.current.selectedLocation?.id).toBe(1);
  });

  it("filters locations by selected category", () => {
    const { result } = renderHook(() =>
      useLocationSelection({
        allLocations: locations,
        selectedLocationId: 2,
      }),
    );

    act(() => {
      result.current.setCategoryFilter("Residential");
    });

    expect(result.current.filteredLocations).toEqual([locations[1]]);
    expect(result.current.selectedLocation?.id).toBe(2);
  });

  it("preserves selected location via fallback when filtered out", () => {
    const { result } = renderHook(() =>
      useLocationSelection({
        allLocations: locations,
        selectedLocationId: 1,
      }),
    );

    act(() => {
      result.current.setCategoryFilter("Residential");
    });

    expect(result.current.filteredLocations).toEqual([locations[1]]);
    expect(result.current.selectedLocation?.id).toBe(1);
  });

  it("returns null when no selected location exists", () => {
    const { result } = renderHook(() =>
      useLocationSelection({
        allLocations: locations,
        selectedLocationId: null,
      }),
    );

    expect(result.current.selectedLocation).toBeNull();
  });
});
