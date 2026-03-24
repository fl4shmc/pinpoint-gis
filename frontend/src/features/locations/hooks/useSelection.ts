import { useState } from "react";

interface UseSelectionResult {
  selectedLocationId: number | null;
  setSelectedLocationId: (id: number | null) => void;
}

export function useSelection(): UseSelectionResult {
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(
    null,
  );

  return { selectedLocationId, setSelectedLocationId };
}
