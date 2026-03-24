import { useCallback, useState } from "react";
import type { CreateLocationPayload, LocationItem } from "../locationTypes";
import { useCreateLocation } from "./useCreateLocation";
import { useLocationsQuery } from "./useLocationsQuery";
import { useSelection } from "./useSelection";
import { useToggleFavorite } from "./useToggleFavorite";

interface UseLocationsResult {
  allLocations: LocationItem[];
  selectedLocationId: number | null;
  setSelectedLocationId: (id: number | null) => void;
  loading: boolean;
  saving: boolean;
  error: string;
  handleCreate: (payload: CreateLocationPayload) => Promise<void>;
  handleToggleFavorite: (location: LocationItem) => Promise<void>;
}

export function useLocations(): UseLocationsResult {
  const [allLocations, setAllLocations] = useState<LocationItem[]>([]);
  const { selectedLocationId, setSelectedLocationId } = useSelection();
  const [error, setError] = useState("");

  const handleLoaded = useCallback(
    (locations: LocationItem[]) => {
      setAllLocations(locations);
      if (locations.length > 0) {
        setSelectedLocationId(locations[0].id);
      }
    },
    [setSelectedLocationId],
  );

  const { loading } = useLocationsQuery({ onLoaded: handleLoaded, setError });
  const { saving, handleCreate } = useCreateLocation({
    setAllLocations,
    setSelectedLocationId,
    setError,
  });
  const { handleToggleFavorite } = useToggleFavorite({ setAllLocations, setError });

  return {
    allLocations,
    selectedLocationId,
    setSelectedLocationId,
    loading,
    saving,
    error,
    handleCreate,
    handleToggleFavorite,
  };
}
