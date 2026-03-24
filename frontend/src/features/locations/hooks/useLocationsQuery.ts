import { useEffect, useState } from "react";
import { fetchLocations } from "../locationsApi";
import type { LocationItem } from "../locationTypes";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

interface UseLocationsQueryOptions {
  onLoaded: (locations: LocationItem[]) => void;
  setError: (message: string) => void;
}

interface UseLocationsQueryResult {
  loading: boolean;
}

export function useLocationsQuery({
  onLoaded,
  setError,
}: UseLocationsQueryOptions): UseLocationsQueryResult {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadLocations() {
      setLoading(true);
      setError("");

      try {
        const data = await fetchLocations();
        if (mounted) {
          onLoaded(data);
        }
      } catch (error) {
        if (mounted) {
          setError(getApiErrorMessage(error) ?? "Failed to load locations.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadLocations();

    return () => {
      mounted = false;
    };
  }, [onLoaded, setError]);

  return { loading };
}
