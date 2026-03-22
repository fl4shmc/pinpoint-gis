import { useEffect, useState } from "react";
import {
  createLocation,
  fetchLocations,
  setFavorite,
} from "../locationsApi";
import type { CreateLocationPayload, LocationItem } from "../locationTypes";

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
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadLocations();
  }, []);

  async function loadLocations() {
    setLoading(true);
    setError("");

    try {
      const data = await fetchLocations();
      setAllLocations(data);
      if (data.length > 0) {
        setSelectedLocationId(data[0].id);
      }
    } catch {
      setError("Failed to load locations.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(payload: CreateLocationPayload) {
    setSaving(true);
    setError("");

    try {
      const created = await createLocation(payload);
      setAllLocations((old) => [created, ...old]);
      setSelectedLocationId(created.id);
    } catch {
      setError("Failed to create location.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleFavorite(location: LocationItem) {
    const next = !location.isFavorite;

    try {
      await setFavorite(location.id, next);
      setAllLocations((old) =>
        old.map((item) =>
          item.id === location.id ? { ...item, isFavorite: next } : item,
        ),
      );
    } catch {
      setError("Failed to update favorite status.");
    }
  }

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
