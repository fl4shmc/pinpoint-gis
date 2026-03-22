import { useMemo, useState } from "react";
import type {
  LocationCategoryFilter,
  LocationItem,
} from "../locationTypes";

interface UseLocationSelectionOptions {
  allLocations: LocationItem[];
  selectedLocationId: number | null;
}

interface UseLocationSelectionResult {
  categoryFilter: LocationCategoryFilter;
  setCategoryFilter: (filter: LocationCategoryFilter) => void;
  filteredLocations: LocationItem[];
  selectedLocation: LocationItem | null;
}

export function useLocationSelection({
  allLocations,
  selectedLocationId,
}: UseLocationSelectionOptions): UseLocationSelectionResult {
  const [categoryFilter, setCategoryFilter] =
    useState<LocationCategoryFilter>("all");

  const filteredLocations = useMemo(
    () =>
      allLocations.filter((location) => {
        if (categoryFilter === "all") {
          return true;
        }

        return location.category === categoryFilter;
      }),
    [allLocations, categoryFilter],
  );

  const selectedLocation = useMemo(
    () =>
      filteredLocations.find((location) => location.id === selectedLocationId) ??
      allLocations.find((location) => location.id === selectedLocationId) ??
      null,
    [allLocations, filteredLocations, selectedLocationId],
  );

  return {
    categoryFilter,
    setCategoryFilter,
    filteredLocations,
    selectedLocation,
  };
}
