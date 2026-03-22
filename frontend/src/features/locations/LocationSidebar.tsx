import {
  LOCATION_CATEGORIES,
  type LocationCategoryFilter,
  type LocationItem,
} from "./locationTypes";

interface LocationSidebarProps {
  locations: LocationItem[];
  selectedLocationId: number | null;
  filter: LocationCategoryFilter;
  onFilterChange: (filter: LocationCategoryFilter) => void;
  onSelectLocation: (location: LocationItem) => void;
}

export function LocationSidebar({
  locations,
  selectedLocationId,
  filter,
  onFilterChange,
  onSelectLocation,
}: LocationSidebarProps) {
  return (
    <aside className="sidebar">
      <h2>Browse Locations</h2>
      <label className="field">
        Filter by category
        <select
          value={filter}
          onChange={(event) =>
            onFilterChange(event.target.value as LocationCategoryFilter)
          }
        >
          <option value="all">All</option>
          {LOCATION_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>

      <div className="location-list">
        {locations.map((location) => (
          <button
            key={location.id}
            type="button"
            className={`location-item ${selectedLocationId === location.id ? "active" : ""}`}
            onClick={() => onSelectLocation(location)}
          >
            <span>{location.name}</span>
            <small>
              {location.category} • {location.status}
            </small>
          </button>
        ))}
        {locations.length === 0 && (
          <p className="muted">No locations in current filter.</p>
        )}
      </div>
    </aside>
  );
}
