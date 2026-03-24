import type { Dispatch, SetStateAction } from "react";
import { setFavorite } from "../locationsApi";
import type { LocationItem } from "../locationTypes";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

interface UseToggleFavoriteOptions {
  setAllLocations: Dispatch<SetStateAction<LocationItem[]>>;
  setError: (message: string) => void;
}

interface UseToggleFavoriteResult {
  handleToggleFavorite: (location: LocationItem) => Promise<void>;
}

export function useToggleFavorite({
  setAllLocations,
  setError,
}: UseToggleFavoriteOptions): UseToggleFavoriteResult {
  async function handleToggleFavorite(location: LocationItem) {
    const next = !location.isFavorite;

    try {
      await setFavorite(location.id, next);
      setAllLocations((old) =>
        old.map((item) =>
          item.id === location.id ? { ...item, isFavorite: next } : item,
        ),
      );
    } catch (error) {
      setError(
        getApiErrorMessage(error) ?? "Failed to update favorite status.",
      );
    }
  }

  return { handleToggleFavorite };
}
