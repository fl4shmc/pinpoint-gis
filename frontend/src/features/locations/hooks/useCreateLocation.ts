import { useState, type Dispatch, type SetStateAction } from "react";
import { createLocation } from "../locationsApi";
import type { CreateLocationPayload, LocationItem } from "../locationTypes";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

interface UseCreateLocationOptions {
  setAllLocations: Dispatch<SetStateAction<LocationItem[]>>;
  setSelectedLocationId: (id: number | null) => void;
  setError: (message: string) => void;
}

interface UseCreateLocationResult {
  saving: boolean;
  handleCreate: (payload: CreateLocationPayload) => Promise<void>;
}

export function useCreateLocation({
  setAllLocations,
  setSelectedLocationId,
  setError,
}: UseCreateLocationOptions): UseCreateLocationResult {
  const [saving, setSaving] = useState(false);

  async function handleCreate(payload: CreateLocationPayload) {
    setSaving(true);
    setError("");

    try {
      const created = await createLocation(payload);
      setAllLocations((old) => [created, ...old]);
      setSelectedLocationId(created.id);
    } catch (error) {
      setError(getApiErrorMessage(error) ?? "Failed to create location.");
    } finally {
      setSaving(false);
    }
  }

  return { saving, handleCreate };
}
