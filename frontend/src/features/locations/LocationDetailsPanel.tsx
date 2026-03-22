import type { LocationItem } from "./locationTypes";

interface LocationDetailsPanelProps {
  location: LocationItem | null;
  loading: boolean;
  onToggleFavorite: (location: LocationItem) => void;
}

export function LocationDetailsPanel({
  location,
  loading,
  onToggleFavorite,
}: LocationDetailsPanelProps) {
  return (
    <aside className="details">
      <h2>Details</h2>
      {!location && (
        <p className="muted">Select a marker or list item to view details.</p>
      )}
      {location && (
        <div className="details-card">
          <h3>{location.name}</h3>
          <p>{location.description}</p>
          <p>
            <strong>Category:</strong> {location.category}
          </p>
          <p>
            <strong>Status:</strong> {location.status}
          </p>
          <p>
            <strong>Coordinates:</strong> {location.latitude.toFixed(4)},{" "}
            {location.longitude.toFixed(4)}
          </p>
          <button
            type="button"
            disabled={loading}
            onClick={() => onToggleFavorite(location)}
          >
            {location.isFavorite ? "Remove Favorite" : "Save as Favorite"}
          </button>
        </div>
      )}
    </aside>
  );
}
